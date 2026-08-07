import { describe, expect, it } from "vitest";
import { computeAccommodationGap, computeFirstTimeMissingAccommodations } from "./accommodation-gap";

describe("computeAccommodationGap", () => {
  it("returns nothing when the candidate has no needs", () => {
    expect(computeAccommodationGap([], [])).toEqual([]);
  });

  it("returns nothing when the job covers every need", () => {
    expect(computeAccommodationGap(["FLEXIBLE_HOURS"], ["FLEXIBLE_HOURS", "EXTENDED_BREAKS"])).toEqual([]);
  });

  it("returns only the uncovered needs", () => {
    expect(computeAccommodationGap(["FLEXIBLE_HOURS", "EXTENDED_BREAKS"], ["FLEXIBLE_HOURS"])).toEqual([
      "EXTENDED_BREAKS",
    ]);
  });

  it("returns everything when the job specifies nothing", () => {
    expect(computeAccommodationGap(["EXTENDED_BREAKS"], [])).toEqual(["EXTENDED_BREAKS"]);
  });
});

describe("computeFirstTimeMissingAccommodations", () => {
  it("returns nothing when there's no gap to begin with", () => {
    expect(computeFirstTimeMissingAccommodations([], [])).toEqual([]);
  });

  it("returns nothing when the org has provided the missing item before", () => {
    expect(computeFirstTimeMissingAccommodations(["EXTENDED_BREAKS"], ["EXTENDED_BREAKS"])).toEqual([]);
  });

  it("returns the item when the org has never provided it", () => {
    expect(computeFirstTimeMissingAccommodations(["EXTENDED_BREAKS"], ["FLEXIBLE_HOURS"])).toEqual([
      "EXTENDED_BREAKS",
    ]);
  });

  it("only returns the genuinely novel subset when some items have history and others don't", () => {
    const result = computeFirstTimeMissingAccommodations(
      ["EXTENDED_BREAKS", "WHEELCHAIR_ACCESSIBLE_WORKSPACE"],
      ["EXTENDED_BREAKS"],
    );
    expect(result).toEqual(["WHEELCHAIR_ACCESSIBLE_WORKSPACE"]);
  });
});
