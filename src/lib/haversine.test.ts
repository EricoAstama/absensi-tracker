import { describe, expect, it } from "vitest";
import { haversineMeters, matchGeofence } from "./haversine";

describe("haversineMeters", () => {
  it("returns zero for same point", () => expect(haversineMeters(
    { latitude: -6.2, longitude: 106.8 },
    { latitude: -6.2, longitude: 106.8 },
  )).toBe(0));

  it("calculates a known Jakarta distance", () => expect(haversineMeters(
    { latitude: -6.1754, longitude: 106.8272 },
    { latitude: -6.2, longitude: 106.8167 },
  )).toBeCloseTo(2972, -1));
});

describe("matchGeofence", () => {
  const locations = [
    { id: "jakarta", latitude: -6.1754, longitude: 106.8272, radius_meters: 100 },
    { id: "bandung", latitude: -6.9175, longitude: 107.6191, radius_meters: 100 },
  ];

  it("accepts a point inside any active location", () => {
    const result = matchGeofence({ latitude: -6.9175, longitude: 107.6191 }, locations);
    expect(result?.location.id).toBe("bandung");
    expect(result?.inside).toBe(true);
  });

  it("prefers a containing geofence even when another office is physically closer", () => {
    const result = matchGeofence(
      { latitude: -6.2, longitude: 106.8 },
      [
        { id: "near-small", latitude: -6.199, longitude: 106.8, radius_meters: 50 },
        { id: "far-wide", latitude: -6.205, longitude: 106.8, radius_meters: 1000 },
      ],
    );
    expect(result?.location.id).toBe("far-wide");
    expect(result?.inside).toBe(true);
  });

  it("returns the nearest location when the point is outside all geofences", () => {
    const result = matchGeofence({ latitude: -7.0, longitude: 107.6 }, locations);
    expect(result?.location.id).toBe("bandung");
    expect(result?.inside).toBe(false);
  });
});
