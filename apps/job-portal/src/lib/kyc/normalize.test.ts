import { describe, expect, it } from "vitest";
import { normalizeEmailForDedup, normalizePhone } from "./normalize";

describe("normalizePhone", () => {
  it("strips spaces and a leading +91", () => {
    expect(normalizePhone("+91 98765 43210")).toBe("9876543210");
  });

  it("strips a bare 91 country-code prefix", () => {
    expect(normalizePhone("919876543210")).toBe("9876543210");
  });

  it("strips a leading trunk 0", () => {
    expect(normalizePhone("09876543210")).toBe("9876543210");
  });

  it("leaves a plain 10-digit number unchanged", () => {
    expect(normalizePhone("9876543210")).toBe("9876543210");
  });

  it("strips dashes", () => {
    expect(normalizePhone("98765-43210")).toBe("9876543210");
  });

  it("normalizes all four formats of the same number to the same value", () => {
    const forms = ["+91 98765 43210", "919876543210", "09876543210", "9876543210"];
    const normalized = new Set(forms.map(normalizePhone));
    expect(normalized.size).toBe(1);
  });
});

describe("normalizeEmailForDedup", () => {
  it("lowercases the address", () => {
    expect(normalizeEmailForDedup("User@Example.com")).toBe("user@example.com");
  });

  it("strips a +tag from the local part", () => {
    expect(normalizeEmailForDedup("user+jobs@gmail.com")).toBe("user@gmail.com");
  });

  it("leaves an address with no +tag unchanged (aside from case)", () => {
    expect(normalizeEmailForDedup("user@gmail.com")).toBe("user@gmail.com");
  });

  it("does not touch dots in the local part (deliberately not Gmail-specific)", () => {
    expect(normalizeEmailForDedup("first.last@gmail.com")).toBe("first.last@gmail.com");
  });
});
