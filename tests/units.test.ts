import { describe, it, expect } from "vitest";
import {
  HALF_MARATHON_KM,
  MARATHON_KM,
  convertKmToMile,
  convertMileToKm,
  KM_PER_MILE,
} from "../src/lib/units";

// Constant test
describe("constants", () => {
  it("Half Marathon in Km is 21.0975", () => {
    expect(HALF_MARATHON_KM).toBe(21.0975);
  });

  it("Marathon in Km is 42.195", () => {
    expect(MARATHON_KM).toBe(42.195);
  });
});

// Function test
describe("convertKmToMile", () => {
  it("Convert 10Kilometers to 6.213Miles", () => {
    expect(convertKmToMile(10)).toBeCloseTo(6.213);
  });
});

describe("convertMileToKm", () => {
  it("Convert 26.218Miles to 42.193Kilometers", () => {
    expect(convertMileToKm(26.218)).toBeCloseTo(42.193);
  });
});

// Round trip test
describe("round trip", () => {
  it("KM -> MI -> KM", () => {
    expect(convertMileToKm(convertKmToMile(1))).toBeCloseTo(1);
  });
});

// Verify Check T8
describe("1 mi = 1.609344 km", () => {
  it("Verify check 1 mi = 1.609344 km", () => {
    expect(convertMileToKm(1)).toBeCloseTo(KM_PER_MILE);
  });
});
