// AuthoringService -- APS-REQ-028/029/030/031/032/039/040/041/042
// Case authoring: simulation templates, ground truth, trigger rules, rubric versioning.
//
// RBAC: All methods require TEACHER or SYSTEM_ADMIN.
//
// Scope-granularity gap (documented):
//   SimulationTemplate has no author or course owner field in the current schema.
//   RBAC is therefore role-only for templates (TEACHER/SYSTEM_ADMIN).
//   A TEACHER can see and edit any template. This is a known gap flagged to Ido.
//   The schema would need an ownerUserId or courseId on SimulationTemplate to tighten this.
//   For now, role check is enforced at the HTTP guard layer; all TEACHERs share authoring space.
//
// Versioning semantics (APS-REQ-032):
//   A SimulationTemplate is considered "in use" when at least one Assignment references it.
//   Editing an in-use template creates a new template record (version incremented) rather than
//   mutating the original. The original template row and its rubric versions remain untouched
//   so existing Assignments (which pin rubricVersionId) continue to reference consistent data.
//   If the template has no assignments, it is edited in place.
//
// Hard off-ramp (APS-REQ-030):
//   hardOffRampText is mandatory. If the caller provides an empty or absent value,
//   the service AUTO-INJECTS the canonical default text (not rejection).
//   Design choice: auto-inject over reject, to reduce authoring friction while ensuring
//   no ground truth row ever lacks a safe off-ramp.
//   Default: "I am a simulated training patient. If you are experiencing real distress,
//             please contact your student welfare service."

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../db/prisma.service.js";
import { composePersonaPrompt, generateRubricCriteria } from "@aps/engine";
import type {
  CreateTemplateRequest,
  UpdateTemplateRequest,
  CreateGroundTruthRequest,
  UpdateGroundTruthRequest,
  CreateTriggerRuleRequest,
  GenerateRubricRequest,
  UpdateCriterionRequest,
  KnownFacts,
  DisclosureAllowList,
} from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Hard off-ramp default (APS-REQ-030)
// ---------------------------------------------------------------------------

export const DEFAULT_HARD_OFF_RAMP =
  "I am a simulated training patient. If you are experiencing real distress, please contact your student welfare service.";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateKnownFacts(kf: unknown): KnownFacts {
  if (typeof kf !== "object" || kf === null) {
    throw new BadRequestException("knownFacts must be an object");
  }
  const obj = kf as Record<string, unknown>;
  if (!Array.isArray(obj["facts"])) throw new BadRequestException("knownFacts.facts must be an array");
  if (!Array.isArray(obj["doNotInvent"])) throw new BadRequestException("knownFacts.doNotInvent must be an array");
  if (!Array.isArray(obj["riskBoundaries"])) throw new BadRequestException("knownFacts.riskBoundaries must be an array");
  return obj as unknown as KnownFacts;
}

function validateDisclosureAllowList(dal: unknown): DisclosureAllowList {
  if (typeof dal !== "object" || dal === null) {
    throw new BadRequestException("disclosureAllowList must be an object");
  }
  const obj = dal as Record<string, unknown>;
  if (!Array.isArray(obj["disclosed"])) throw new BadRequestException("disclosureAllowList.disclosed must be an array");
  if (!Array.isArray(obj["unlocked"])) throw new BadRequestException("disclosureAllowList.unlocked must be an array");
  if (!Array.isArray(obj["locked"])) throw new BadRequestException("disclosureAllowList.locked must be an array");
  if (!Array.isArray(obj["triggers"])) throw new BadRequestException("disclosureAllowList.triggers must be an array");
  return obj as unknown as DisclosureAllowList;
}

function resolveHardOffRamp(text: string | undefined | null): string {
  if (!text || text.trim() === "") return DEFAULT_HARD_OFF_RAMP;
  return text;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class AuthoringService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // Template CRUD (APS-REQ-028/029/032)
  // -------------------------------------------------------------------------

  /**
   * Create a new SimulationTemplate from builder fields.
   * Persona prompt is composed deterministically (APS-REQ-029).
   * A stub GroundTruth row is created alongside so the FK (groundTruthId) is satisfied.
   * The stub ground truth uses safe defaults; the caller should follow up with
   * POST /authoring/ground-truth to populate real values.
   */
  async createTemplate(dto: CreateTemplateRequest) {
    const { builder } = dto;
    const personaPrompt = composePersonaPrompt(builder);

    // B1 FIX: all three steps (GT stub, template, GT update) run inside a single
    // Prisma interactive transaction so a failure at any step rolls back all three.
    // Without this: a crash at step 2 leaves a dangling GroundTruth row with
    // simulationTemplateId="PENDING"; a crash at step 3 leaves the template with a
    // GT whose back-reference is still "PENDING". Both orphan states are unrecoverable
    // without manual DB cleanup and accumulate silently in production.
    //
    // Schema note: SimulationTemplate has a groundTruthId FK pointing to GroundTruth.
    // GroundTruth also has simulationTemplateId (back-reference, @unique).
    // The circular dependency means we cannot create both in a single nested statement;
    // we use the tx callback pattern: GT stub -> template -> GT update, all atomic.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Cast: $transaction is present on the real Prisma client at runtime and on the
    // stub (packages/db/src/index.ts) but the composite-build type resolution does not
    // surface it on PrismaService (pre-existing tsc gap, see simulation.service.ts).
    const template = await (this.prisma as any).$transaction(async (tx: any) => {
      // Step 1: create a placeholder GroundTruth (simulationTemplateId placeholder)
      const gt = await tx.groundTruth.create({
        data: {
          simulationTemplateId: "PENDING", // will be updated after template creation
          knownFacts: { facts: [], doNotInvent: [], riskBoundaries: [] },
          disclosureAllowList: { disclosed: [], unlocked: [], locked: [], triggers: [] },
          escalationRules: {},
          hardOffRampText: DEFAULT_HARD_OFF_RAMP,
          version: 1,
        },
      });

      // Step 2: create the template referencing the GT
      const tpl = await tx.simulationTemplate.create({
        data: {
          title: builder.title,
          version: 1,
          clinicalModel: builder.clinicalModel,
          studentLevel: builder.studentLevel,
          challengeLevel: builder.challengeLevel,
          riskLevel: builder.riskLevel,
          languages: builder.languages,
          personaPrompt,
          groundTruthId: gt.id,
        },
      });

      // Step 3: update GT with real simulationTemplateId
      await tx.groundTruth.update({
        where: { id: gt.id },
        data: { simulationTemplateId: tpl.id },
      });

      return tpl;
    });

    return template;
  }

  /**
   * Update an existing SimulationTemplate.
   * Versioning: if the template is referenced by any Assignment (in-use),
   * create a new template row (version + 1) rather than mutating the original.
   * The new template row starts with a stub GT (same stub pattern as createTemplate).
   * The caller must separately update the new template's ground truth.
   */
  async updateTemplate(templateId: string, dto: UpdateTemplateRequest) {
    const existing = await this.prisma.simulationTemplate.findUnique({
      where: { id: templateId },
      include: { assignments: { take: 1 } },
    });
    if (!existing) throw new NotFoundException("SimulationTemplate not found");

    const inUse = existing.assignments.length > 0;

    // Build updated field values
    const builder = dto.builder;
    const newTitle = builder.title ?? existing.title;
    const newClinicalModel = builder.clinicalModel ?? existing.clinicalModel;
    const newStudentLevel = builder.studentLevel ?? existing.studentLevel;
    const newChallengeLevel = builder.challengeLevel ?? existing.challengeLevel;
    const newRiskLevel = builder.riskLevel ?? existing.riskLevel;
    const newLanguages = builder.languages ?? existing.languages;

    // M1 FIX: only RE-COMPOSE personaPrompt when the caller supplies ALL builder fields
    // needed by composePersonaPrompt. On a partial update (e.g. only {title: "New Name"}),
    // primarySkill / patientStyle / presentingProblem / mode are NOT stored on the
    // SimulationTemplate schema columns, so they cannot be recovered from the DB.
    // Falling back to literals ("general"/"neutral"/""/""intake") would silently corrupt
    // the clinical prompt on every partial PATCH -- replacing real values with placeholders.
    //
    // Rule: PRESERVE the existing personaPrompt when any of the four prompt-builder fields
    // is absent in the update DTO. ONLY re-compose when all four are present.
    // TODO (M1 tracked task): add primarySkill, patientStyle, presentingProblem, hiddenIssue,
    // mode as columns on SimulationTemplate so partial updates can safely re-compose.
    const hasFullBuilderFieldset =
      builder.primarySkill !== undefined &&
      builder.patientStyle !== undefined &&
      builder.presentingProblem !== undefined &&
      builder.mode !== undefined;

    let newPersonaPrompt: string;
    if (hasFullBuilderFieldset) {
      const updatedBuilderFields = {
        title: newTitle,
        clinicalModel: newClinicalModel,
        studentLevel: newStudentLevel,
        primarySkill: builder.primarySkill!,
        secondarySkill: builder.secondarySkill,
        patientStyle: builder.patientStyle!,
        presentingProblem: builder.presentingProblem!,
        hiddenIssue: builder.hiddenIssue,
        riskLevel: newRiskLevel,
        challengeLevel: newChallengeLevel,
        languages: newLanguages,
        mode: builder.mode!,
      };
      newPersonaPrompt = composePersonaPrompt(updatedBuilderFields);
    } else {
      // Partial update: preserve the existing personaPrompt unchanged.
      // Callers must supply the full builder fieldset to trigger a re-compose.
      newPersonaPrompt = existing.personaPrompt;
    }

    if (inUse) {
      // B1 FIX: version-bump GT creation also uses an interactive transaction.
      // Same orphan risk as createTemplate: a crash between any of the three steps
      // leaves dangling/inconsistent rows that cannot be recovered automatically.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newTemplate = await (this.prisma as any).$transaction(async (tx: any) => {
        // Stub GT for the new version -- caller populates separately
        const gt = await tx.groundTruth.create({
          data: {
            simulationTemplateId: "PENDING",
            knownFacts: { facts: [], doNotInvent: [], riskBoundaries: [] },
            disclosureAllowList: { disclosed: [], unlocked: [], locked: [], triggers: [] },
            escalationRules: {},
            hardOffRampText: DEFAULT_HARD_OFF_RAMP,
            version: 1,
          },
        });

        const tpl = await tx.simulationTemplate.create({
          data: {
            title: newTitle,
            version: existing.version + 1,
            clinicalModel: newClinicalModel,
            studentLevel: newStudentLevel,
            challengeLevel: newChallengeLevel,
            riskLevel: newRiskLevel,
            languages: newLanguages,
            personaPrompt: newPersonaPrompt,
            groundTruthId: gt.id,
          },
        });

        await tx.groundTruth.update({
          where: { id: gt.id },
          data: { simulationTemplateId: tpl.id },
        });

        return tpl;
      });

      return { versionBumped: true, template: newTemplate };
    }

    // Not in use -- update in place
    const updated = await this.prisma.simulationTemplate.update({
      where: { id: templateId },
      data: {
        title: newTitle,
        clinicalModel: newClinicalModel,
        studentLevel: newStudentLevel,
        challengeLevel: newChallengeLevel,
        riskLevel: newRiskLevel,
        languages: newLanguages,
        personaPrompt: newPersonaPrompt,
      },
    });

    return { versionBumped: false, template: updated };
  }

  async getTemplate(templateId: string) {
    const template = await this.prisma.simulationTemplate.findUnique({
      where: { id: templateId },
      include: { groundTruth: true, rubricVersions: true },
    });
    if (!template) throw new NotFoundException("SimulationTemplate not found");
    return template;
  }

  // -------------------------------------------------------------------------
  // Ground Truth (APS-REQ-030)
  // -------------------------------------------------------------------------

  /**
   * Create or replace the GroundTruth for a template.
   * Hard off-ramp auto-inject: if hardOffRampText is absent or empty, the service
   * injects DEFAULT_HARD_OFF_RAMP. This ensures no ground truth row ever lacks a
   * safe off-ramp (APS-REQ-030 -- hard off-ramp is a rule, not author-optional).
   */
  async createGroundTruth(dto: CreateGroundTruthRequest) {
    const { simulationTemplateId } = dto;

    const template = await this.prisma.simulationTemplate.findUnique({
      where: { id: simulationTemplateId },
    });
    if (!template) throw new NotFoundException("SimulationTemplate not found");

    // Validate shape
    const knownFacts = validateKnownFacts(dto.knownFacts);
    const disclosureAllowList = validateDisclosureAllowList(dto.disclosureAllowList);
    const hardOffRampText = resolveHardOffRamp(dto.hardOffRampText);

    // Check if a real GT already exists (not the stub with simulationTemplateId=PENDING)
    const existing = await this.prisma.groundTruth.findUnique({
      where: { simulationTemplateId },
    });

    if (existing) {
      // Update in place
      return this.prisma.groundTruth.update({
        where: { simulationTemplateId },
        data: {
          knownFacts: knownFacts as object,
          disclosureAllowList: disclosureAllowList as object,
          escalationRules: (dto.escalationRules ?? {}) as object,
          hardOffRampText,
          version: existing.version + 1,
        },
      });
    }

    return this.prisma.groundTruth.create({
      data: {
        simulationTemplateId,
        knownFacts: knownFacts as object,
        disclosureAllowList: disclosureAllowList as object,
        escalationRules: (dto.escalationRules ?? {}) as object,
        hardOffRampText,
        version: dto.version ?? 1,
      },
    });
  }

  async updateGroundTruth(simulationTemplateId: string, dto: UpdateGroundTruthRequest) {
    const existing = await this.prisma.groundTruth.findUnique({
      where: { simulationTemplateId },
    });
    if (!existing) throw new NotFoundException("GroundTruth not found for this template");

    const updateData: Record<string, unknown> = {};

    if (dto.knownFacts !== undefined) {
      updateData["knownFacts"] = validateKnownFacts(dto.knownFacts) as object;
    }
    if (dto.disclosureAllowList !== undefined) {
      updateData["disclosureAllowList"] = validateDisclosureAllowList(dto.disclosureAllowList) as object;
    }
    if (dto.escalationRules !== undefined) {
      updateData["escalationRules"] = dto.escalationRules as object;
    }
    if (dto.hardOffRampText !== undefined) {
      updateData["hardOffRampText"] = resolveHardOffRamp(dto.hardOffRampText);
    }
    updateData["version"] = existing.version + 1;

    return this.prisma.groundTruth.update({
      where: { simulationTemplateId },
      data: updateData,
    });
  }

  async getGroundTruth(simulationTemplateId: string) {
    const gt = await this.prisma.groundTruth.findUnique({
      where: { simulationTemplateId },
    });
    if (!gt) throw new NotFoundException("GroundTruth not found");
    return gt;
  }

  // -------------------------------------------------------------------------
  // Trigger Rules (APS-REQ-031)
  // -------------------------------------------------------------------------

  async createTriggerRule(dto: CreateTriggerRuleRequest) {
    const template = await this.prisma.simulationTemplate.findUnique({
      where: { id: dto.simulationTemplateId },
    });
    if (!template) throw new NotFoundException("SimulationTemplate not found");

    return this.prisma.triggerRule.create({
      data: {
        simulationTemplateId: dto.simulationTemplateId,
        triggerCondition: dto.triggerCondition,
        action: dto.action,
        priority: dto.priority ?? 0,
      },
    });
  }

  async getTriggerRules(simulationTemplateId: string) {
    const template = await this.prisma.simulationTemplate.findUnique({
      where: { id: simulationTemplateId },
    });
    if (!template) throw new NotFoundException("SimulationTemplate not found");

    return this.prisma.triggerRule.findMany({
      where: { simulationTemplateId },
      orderBy: { priority: "asc" },
    });
  }

  // -------------------------------------------------------------------------
  // Rubric -- generate, edit, publish (APS-REQ-039/040/041/042)
  // -------------------------------------------------------------------------

  /**
   * Generate a DRAFT RubricVersion for a template.
   * Deterministic: uses generateRubricCriteria from the engine layer.
   * If the template already has a DRAFT rubric version, throws ConflictException
   * (caller must publish or delete it first).
   * competencyId values in the generated criteria are external-key tokens;
   * the service looks up live Competency rows and substitutes null for missing ones.
   */
  async generateRubric(dto: GenerateRubricRequest) {
    const { simulationTemplateId } = dto;

    const template = await this.prisma.simulationTemplate.findUnique({
      where: { id: simulationTemplateId },
      include: { rubricVersions: { orderBy: { version: "desc" }, take: 1 } },
    });
    if (!template) throw new NotFoundException("SimulationTemplate not found");

    // Check for existing DRAFT
    const latestVersion = template.rubricVersions[0];
    if (latestVersion && latestVersion.status === "DRAFT") {
      throw new ConflictException(
        "A DRAFT rubric version already exists. Publish or discard it before generating a new one.",
      );
    }

    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

    // Generate criteria from engine (deterministic)
    const { criteria: draftCriteria } = generateRubricCriteria({
      challengeLevel: template.challengeLevel,
      riskLevel: template.riskLevel,
    });

    // Resolve competencyId: look up live Competency rows by externalKey
    // competencyId in draftCriteria is the externalKey token (e.g. "COMP-EMPATHY-001")
    const externalKeys = draftCriteria
      .map((c) => c.competencyId)
      .filter((k): k is string => !!k);

    const competencyRows = await this.prisma.competency.findMany({
      where: { externalKey: { in: externalKeys } },
      select: { id: true, externalKey: true },
    });

    const keyToId = new Map<string, string>(
      competencyRows.map((r: { id: string; externalKey: string }) => [r.externalKey, r.id]),
    );

    // Create RubricVersion with criteria
    const rubricVersion = await this.prisma.rubricVersion.create({
      data: {
        simulationTemplateId,
        version: nextVersion,
        status: "DRAFT",
        criteria: {
          create: draftCriteria.map((c) => ({
            labelKey: c.labelKey,
            labels: c.labels as object,
            weight: c.weight,
            maxScore: c.maxScore,
            scoringAnchors: c.scoringAnchors as object,
            competencyId: c.competencyId ? (keyToId.get(c.competencyId) ?? null) : null,
            formativeOnly: c.formativeOnly,
          })),
        },
      },
      include: { criteria: true },
    });

    return rubricVersion;
  }

  /**
   * Update a single RubricCriterion.
   * The rubric version must be DRAFT. Published versions are immutable (APS-REQ-041).
   */
  async updateCriterion(criterionId: string, dto: UpdateCriterionRequest) {
    const criterion = await this.prisma.rubricCriterion.findUnique({
      where: { id: criterionId },
      include: { rubricVersion: true },
    });
    if (!criterion) throw new NotFoundException("RubricCriterion not found");

    const rubricVersion = criterion.rubricVersion as { status: string };
    if (rubricVersion.status !== "DRAFT") {
      throw new ConflictException("Cannot edit criteria on a PUBLISHED rubric version");
    }

    const updateData: Record<string, unknown> = {};
    if (dto.labels !== undefined) updateData["labels"] = dto.labels as object;
    if (dto.weight !== undefined) updateData["weight"] = dto.weight;
    if (dto.maxScore !== undefined) updateData["maxScore"] = dto.maxScore;
    if (dto.scoringAnchors !== undefined) updateData["scoringAnchors"] = dto.scoringAnchors as object;
    if (dto.competencyId !== undefined) updateData["competencyId"] = dto.competencyId;
    if (dto.formativeOnly !== undefined) updateData["formativeOnly"] = dto.formativeOnly;

    return this.prisma.rubricCriterion.update({
      where: { id: criterionId },
      data: updateData,
    });
  }

  /**
   * Publish a DRAFT RubricVersion.
   * Once published, the version and its criteria are immutable (APS-REQ-041).
   * An Assignment pins the rubricVersionId -- that pin must remain stable.
   */
  async publishRubric(rubricVersionId: string) {
    const rubricVersion = await this.prisma.rubricVersion.findUnique({
      where: { id: rubricVersionId },
    });
    if (!rubricVersion) throw new NotFoundException("RubricVersion not found");

    if (rubricVersion.status === "PUBLISHED") {
      throw new ConflictException("RubricVersion is already PUBLISHED");
    }

    return this.prisma.rubricVersion.update({
      where: { id: rubricVersionId },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      include: { criteria: true },
    });
  }

  async getRubricVersion(rubricVersionId: string) {
    const rv = await this.prisma.rubricVersion.findUnique({
      where: { id: rubricVersionId },
      include: { criteria: true },
    });
    if (!rv) throw new NotFoundException("RubricVersion not found");
    return rv;
  }
}
