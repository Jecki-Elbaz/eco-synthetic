// arc-access.spec.ts -- S7-GAL-ACCESS unit test
// Asserts that no file in apps/api/src/simulation/arc/ exports a class or interface
// ending in "Dto" or "Entity" that contains the field "notableMomentsSummary".
// This confirms ArcSessionSummary PII fields are not exposed via a DTO to a
// controller response layer.
//
// Approach B from S7-GAL-ACCESS (envelope 2026-07-12).
// Manual verification also required on every new controller method that accesses
// ArcSessionSummary. Ref: APS-022.
//
// Test items:
//   A1: no DTO or Entity class exported from arc/ contains notableMomentsSummary

import * as fs from "node:fs";
import * as path from "node:path";

// CommonJS module context: __dirname is available directly.
const ARC_DIR = path.resolve(__dirname, "../simulation/arc");

function readArcFiles(): Array<{ file: string; content: string }> {
  const files = fs.readdirSync(ARC_DIR).filter((f) => f.endsWith(".ts"));
  return files.map((f) => ({
    file: f,
    content: fs.readFileSync(path.join(ARC_DIR, f), "utf-8"),
  }));
}

describe("S7-GAL-ACCESS: ArcSessionSummary -- no DTO leak", () => {
  it("A1: no file in arc/ exports a Dto or Entity containing notableMomentsSummary", () => {
    const arcFiles = readArcFiles();
    const violations: string[] = [];

    for (const { file, content } of arcFiles) {
      // Match exported class/interface declarations ending in Dto or Entity
      const dtoEntityPattern = /export\s+(class|interface)\s+\w+(Dto|Entity)\b/g;
      const hasDtoOrEntity = dtoEntityPattern.test(content);

      if (hasDtoOrEntity && content.includes("notableMomentsSummary")) {
        violations.push(file);
      }
    }

    expect(violations).toEqual([]);
    // Manual verification note (APS-022):
    // On every new controller method accessing ArcSessionSummary, confirm no DTO
    // exposes notableMomentsSummary or other PII-HIGH fields to the HTTP response layer.
  });
});
