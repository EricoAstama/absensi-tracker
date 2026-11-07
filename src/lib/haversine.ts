const EARTH_RADIUS_METERS = 6_371_000;
const rad = (value: number) => value * Math.PI / 180;

export type GeoPoint = { latitude: number; longitude: number };
export type GeofenceLocation = GeoPoint & { radius_meters: number };

export function haversineMeters(a: GeoPoint, b: GeoPoint) {
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const value = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(value));
}

export function matchGeofence<T extends GeofenceLocation>(point: GeoPoint, locations: readonly T[]) {
  const measured = locations
    .map(location => ({ location, distanceMeters: haversineMeters(point, location) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
  const match = measured.find(item => item.distanceMeters <= item.location.radius_meters) ?? measured[0];

  if (!match) return null;
  return {
    ...match,
    inside: match.distanceMeters <= match.location.radius_meters,
  };
}
