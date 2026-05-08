import { test, describe } from "node:test";
import assert from "node:assert";
import { buildCreatedOffer, type CreateOfferInput } from "./offer-utils.ts";

describe("buildCreatedOffer", () => {
  const baseInput: CreateOfferInput = {
    name: "Test Offer",
    offerNumber: "OFF-2026-001",
    type: "standard",
    inputDate: "2026-01-01",
    closeDate: "2026-01-15",
    description: "A test offer description",
    currency: "EUR",
  };

  test("correctly maps input fields to the offer object", () => {
    const result = buildCreatedOffer(baseInput);

    assert.strictEqual(result.name, baseInput.name);
    assert.strictEqual(result.offerNumber, baseInput.offerNumber);
    assert.strictEqual(result.type, baseInput.type);
    assert.strictEqual(result.inputDate, baseInput.inputDate);
    assert.strictEqual(result.closeDate, baseInput.closeDate);
    assert.strictEqual(result.description, baseInput.description);
    assert.strictEqual(result.currency, baseInput.currency);
  });

  test("initializes default fields correctly", () => {
    const result = buildCreatedOffer(baseInput);

    assert.strictEqual(result.owner, "Estimator");
    assert.strictEqual(result.status, "draft");
    assert.strictEqual(result.calculationStatus, "not_calculated");
    assert.strictEqual(result.scopes, 0);
    assert.strictEqual(result.lines, 0);
    assert.strictEqual(result.total, 0);
  });

  test("generates correct slug-based id from offerNumber", () => {
    const input = { ...baseInput, offerNumber: "ABC 123 / XYZ" };
    const result = buildCreatedOffer(input);

    // slug = abc-123-xyz
    // id = off-abc-123-xyz
    assert.strictEqual(result.id, "off-abc-123-xyz");
  });

  test("does not double-prefix id if offerNumber already starts with off- (case insensitive)", () => {
    const input = { ...baseInput, offerNumber: "OFF-789-SPECIAL" };
    const result = buildCreatedOffer(input);

    // slug = off-789-special
    // id = off-789-special
    assert.strictEqual(result.id, "off-789-special");
  });

  test("handles lowercase offerNumber correctly for ID", () => {
    const input = { ...baseInput, offerNumber: "off-something" };
    const result = buildCreatedOffer(input);

    assert.strictEqual(result.id, "off-something");
  });

  test("replaces multiple non-alphanumeric characters with a single hyphen in ID", () => {
    const input = { ...baseInput, offerNumber: "ABC!!!123" };
    const result = buildCreatedOffer(input);

    assert.strictEqual(result.id, "off-abc-123");
  });
});
