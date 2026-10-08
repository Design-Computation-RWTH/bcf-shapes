import assert from "node:assert/strict";
import test from "node:test";

import { loadShapes, loadTurtle, validate } from "./support/validator.js";

/**
 * Proves that the shapes accept a valid project and reject each fault.
 *
 * A suite that only checks conforming data cannot tell a working shape from
 * one whose target never matches. Each invalid test file breaks exactly one
 * rule, so a failure here names the rule that stopped working.
 */

const root = new URL("../", import.meta.url);
const testData = (path: string) => new URL(`test-data/${path}`, root);
const shapes = await loadShapes(
  new URL("shapes/bcf-shapes.ttl", root),
  new URL("tests/support/bcfOWL.ttl", root),
);

const CASES: ReadonlyArray<{
  file: string;
  focusNode: string;
  expected: RegExp;
}> = [
  {
    file: "topic-missing-title.ttl",
    focusNode: "https://example.org/fixture#topic-no-title",
    expected: /dcterms:title/u,
  },
  {
    file: "topic-two-statuses.ttl",
    focusNode: "https://example.org/fixture#topic-two-statuses",
    // The shape states no sh:message for this property, so the engine's own
    // wording is what a caller sees.
    expected: /More than 1 values/u,
  },
  {
    file: "topic-status-outside-scheme.ttl",
    focusNode: "https://example.org/fixture#topic-foreign-status",
    expected: /not a member/u,
  },
  {
    file: "viewpoint-two-cameras.ttl",
    focusNode: "https://example.org/fixture#viewpoint-two-cameras",
    // sh:not reports generically: the Viewpoint matched the "both cameras"
    // shape it was required not to match.
    expected: /does have shape/u,
  },
  {
    file: "comment-without-topic.ttl",
    focusNode: "https://example.org/fixture#comment-orphan",
    expected: /exactly one Topic/u,
  },
  {
    file: "topic-title-not-literal.ttl",
    focusNode: "https://example.org/fixture#topic-title-iri",
    expected: /dcterms:title, as a string literal/u,
  },
  {
    file: "topic-without-project.ttl",
    focusNode: "https://example.org/fixture#topic-no-project",
    expected: /exactly one Project/u,
  },
  {
    file: "comment-project-differs-from-topic.ttl",
    focusNode: "https://example.org/fixture#comment-other-project",
    expected: /not the same as the project of the Topic/u,
  },
  {
    file: "topic-type-outside-scheme.ttl",
    focusNode: "https://example.org/fixture#topic-foreign-type",
    expected: /type is not a member/u,
  },
  {
    file: "topic-label-outside-scheme.ttl",
    focusNode: "https://example.org/fixture#topic-foreign-label",
    expected: /label is not a member/u,
  },
  {
    file: "topic-priority-outside-scheme.ttl",
    focusNode: "https://example.org/fixture#topic-foreign-priority",
    expected: /priority is not a member/u,
  },
  {
    file: "topic-stage-outside-scheme.ttl",
    focusNode: "https://example.org/fixture#topic-foreign-stage",
    expected: /stage is not a member/u,
  },
  {
    file: "topic-creator-not-user.ttl",
    focusNode: "https://example.org/fixture#topic-creator-not-user",
    expected: /not a user of the project/u,
  },
  {
    file: "topic-creator-not-agent.ttl",
    focusNode: "https://example.org/fixture#topic-creator-not-agent",
    expected: /creator must be a prov:Agent/u,
  },
  {
    file: "topic-two-modified-dates.ttl",
    focusNode: "https://example.org/fixture#topic-two-modified",
    expected: /at most one dcterms:modified/u,
  },
];

// Each valid file stands alone. valid-project.ttl is also the base of the
// invalid files. If it were itself invalid, every case below would pass for
// the wrong reason.
const VALID = [
  "valid-project.ttl",
  "valid-extension-schema.ttl",
  "valid-topic-comment.ttl",
  "valid-viewpoint.ttl",
  "valid-provenance.ttl",
];

for (const file of VALID) {
  test(`accepts ${file}`, async () => {
    const report = await validate(shapes, await loadTurtle(testData(file)));
    assert.deepEqual(report.violations, []);
    assert.equal(report.conforms, true);
  });
}

for (const testCase of CASES) {
  test(`rejects ${testCase.file}`, async () => {
    const report = await validate(
      shapes,
      await loadTurtle(
        testData("valid-project.ttl"),
        testData(`invalid/${testCase.file}`),
      ),
    );
    assert.equal(report.conforms, false);
    const messages = report.violations
      .filter((violation) => violation.focusNode === testCase.focusNode)
      .map((violation) => violation.message)
      .join(" | ");
    assert.match(messages, testCase.expected);
  });
}
