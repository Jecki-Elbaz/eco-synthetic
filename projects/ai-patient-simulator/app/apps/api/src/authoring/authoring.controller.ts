// AuthoringController -- REST endpoints for case authoring (APS-REQ-028-032, 039-042)
// All endpoints: TEACHER or SYSTEM_ADMIN only.
//
// Routes:
//   POST   /authoring/templates                                       create template
//   GET    /authoring/templates/:templateId                           get template (includes rubricProvisional)
//   PATCH  /authoring/templates/:templateId                           update template (version-bump if in use)
//   PATCH  /authoring/templates/:templateId/rubric-reviewed           S5-GAL-M6: mark rubric reviewed
//   POST   /authoring/ground-truth                                    create/replace ground truth
//   PATCH  /authoring/ground-truth/:templateId                        update ground truth
//   GET    /authoring/ground-truth/:templateId                        get ground truth
//   POST   /authoring/triggers                                        create trigger rule
//   GET    /authoring/triggers/:templateId                            list trigger rules for template
//   POST   /authoring/rubric/generate                                 generate DRAFT rubric version
//   GET    /authoring/rubrics/:rubricVersionId                        get rubric version
//   PATCH  /authoring/rubrics/:rubricVersionId/criteria/:criterionId  update criterion
//   POST   /authoring/rubrics/:rubricVersionId/publish                publish rubric version (M6 gates)

import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { AuthoringService } from "./authoring.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { RequiredRoles } from "../rbac/roles.decorator.js";
import type {
  CreateTemplateRequest,
  UpdateTemplateRequest,
  CreateGroundTruthRequest,
  UpdateGroundTruthRequest,
  CreateTriggerRuleRequest,
  GenerateRubricRequest,
  UpdateCriterionRequest,
} from "@aps/shared-types";

@Controller("authoring")
@UseGuards(JwtAuthGuard, RolesGuard)
@RequiredRoles("TEACHER", "SYSTEM_ADMIN")
export class AuthoringController {
  constructor(private readonly authoringService: AuthoringService) {}

  // -------------------------------------------------------------------------
  // Templates
  // -------------------------------------------------------------------------

  @Post("templates")
  createTemplate(@Body() body: CreateTemplateRequest) {
    return this.authoringService.createTemplate(body);
  }

  @Get("templates/:templateId")
  getTemplate(@Param("templateId") templateId: string) {
    return this.authoringService.getTemplate(templateId);
  }

  @Patch("templates/:templateId")
  updateTemplate(
    @Param("templateId") templateId: string,
    @Body() body: UpdateTemplateRequest,
  ) {
    return this.authoringService.updateTemplate(templateId, body);
  }

  /**
   * S5-GAL-M6: mark rubric as reviewed for a template.
   * Sets rubricLastReviewedAt = NOW(). Must be called before publishRubric
   * when ground truth was updated after the last review.
   */
  @Patch("templates/:templateId/rubric-reviewed")
  markRubricReviewed(@Param("templateId") templateId: string) {
    return this.authoringService.markRubricReviewed(templateId);
  }

  // -------------------------------------------------------------------------
  // Ground Truth
  // -------------------------------------------------------------------------

  @Post("ground-truth")
  createGroundTruth(@Body() body: CreateGroundTruthRequest) {
    return this.authoringService.createGroundTruth(body);
  }

  @Patch("ground-truth/:templateId")
  updateGroundTruth(
    @Param("templateId") templateId: string,
    @Body() body: UpdateGroundTruthRequest,
  ) {
    return this.authoringService.updateGroundTruth(templateId, body);
  }

  @Get("ground-truth/:templateId")
  getGroundTruth(@Param("templateId") templateId: string) {
    return this.authoringService.getGroundTruth(templateId);
  }

  // -------------------------------------------------------------------------
  // Trigger Rules
  // -------------------------------------------------------------------------

  @Post("triggers")
  createTriggerRule(@Body() body: CreateTriggerRuleRequest) {
    return this.authoringService.createTriggerRule(body);
  }

  @Get("triggers/:templateId")
  getTriggerRules(@Param("templateId") templateId: string) {
    return this.authoringService.getTriggerRules(templateId);
  }

  // -------------------------------------------------------------------------
  // Rubric
  // -------------------------------------------------------------------------

  @Post("rubric/generate")
  generateRubric(@Body() body: GenerateRubricRequest) {
    return this.authoringService.generateRubric(body);
  }

  @Get("rubrics/:rubricVersionId")
  getRubricVersion(@Param("rubricVersionId") rubricVersionId: string) {
    return this.authoringService.getRubricVersion(rubricVersionId);
  }

  @Patch("rubrics/:rubricVersionId/criteria/:criterionId")
  updateCriterion(
    @Param("criterionId") criterionId: string,
    @Body() body: UpdateCriterionRequest,
  ) {
    return this.authoringService.updateCriterion(criterionId, body);
  }

  @Post("rubrics/:rubricVersionId/publish")
  publishRubric(@Param("rubricVersionId") rubricVersionId: string) {
    return this.authoringService.publishRubric(rubricVersionId);
  }
}
