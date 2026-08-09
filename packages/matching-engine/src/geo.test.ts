import { describe, expect, it } from "vitest";
import { haversineDistanceKm, resolveCityCoordinates, resolveNearestDistanceKm } from "./geo";

describe("resolveCityCoordinates", () => {
  it("resolves a known city case-insensitively and trimmed", () => {
    expect(resolveCityCoordinates("Bengaluru")).not.toBeNull();
    expect(resolveCityCoordinates("  bengaluru  ")).not.toBeNull();
    expect(resolveCityCoordinates("BENGALURU")).not.toBeNull();
  });

  it("treats common aliases as the same city", () => {
    expect(resolveCityCoordinates("Bangalore")).toEqual(resolveCityCoordinates("Bengaluru"));
  });

  it("returns null for an unknown location", () => {
    expect(resolveCityCoordinates("Not A Real City XYZ")).toBeNull();
  });
});

describe("haversineDistanceKm", () => {
  it("returns 0 for identical coordinates", () => {
    const point = { lat: 12.9716, lng: 77.5946 };
    expect(haversineDistanceKm(point, point)).toBeCloseTo(0);
  });

  it("returns a plausible distance between two known-far-apart cities", () => {
    const bengaluru = resolveCityCoordinates("Bengaluru")!;
    const delhi = resolveCityCoordinates("Delhi")!;
    const distance = haversineDistanceKm(bengaluru, delhi);
    // Real straight-line distance is ~1740km — assert a generous but
    // meaningful range rather than pinning an exact figure.
    expect(distance).toBeGreaterThan(1500);
    expect(distance).toBeLessThan(2000);
  });

  it("is symmetric", () => {
    const a = resolveCityCoordinates("Mumbai")!;
    const b = resolveCityCoordinates("Pune")!;
    expect(haversineDistanceKm(a, b)).toBeCloseTo(haversineDistanceKm(b, a));
  });
});

describe("resolveNearestDistanceKm", () => {
  it("returns null when the job location is null", () => {
    expect(resolveNearestDistanceKm(["Bengaluru"], null)).toBeNull();
  });

  it("returns null when the job location isn't a known city", () => {
    expect(resolveNearestDistanceKm(["Bengaluru"], "Not A Real City")).toBeNull();
  });

  it("returns null when none of the candidate's locations are known cities", () => {
    expect(resolveNearestDistanceKm(["Not A Real City"], "Bengaluru")).toBeNull();
  });

  it("returns the distance to the single resolvable preferred location", () => {
    const distance = resolveNearestDistanceKm(["Mumbai"], "Pune");
    expect(distance).not.toBeNull();
    expect(distance).toBeGreaterThan(0);
  });

  it("returns the shortest distance among multiple preferred locations", () => {
    const distance = resolveNearestDistanceKm(["Delhi", "Pune"], "Mumbai");
    const toDelhi = haversineDistanceKm(resolveCityCoordinates("Mumbai")!, resolveCityCoordinates("Delhi")!);
    const toPune = haversineDistanceKm(resolveCityCoordinates("Mumbai")!, resolveCityCoordinates("Pune")!);
    expect(distance).toBeCloseTo(Math.min(toDelhi, toPune));
  });

  it("ignores unresolvable locations in a mixed list rather than failing entirely", () => {
    const withNoise = resolveNearestDistanceKm(["Not A Real City", "Pune"], "Mumbai");
    const clean = resolveNearestDistanceKm(["Pune"], "Mumbai");
    expect(withNoise).toBeCloseTo(clean!);
  });
});
