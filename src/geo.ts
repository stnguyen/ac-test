import distance from "@turf/distance";
import { point } from "@turf/helpers";

export type RawCoordinates = {
  latitude: string;
  longitude: string;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * is the coordinate object valid
 */
export const numericalCoordinate = (
  coord: RawCoordinates
): Coordinates | null => {
  const latitude = parseFloat(coord.latitude as string);
  const longitude = parseFloat(coord.longitude as string);
  return [latitude, longitude].every((feat) => !isNaN(feat))
    ? { latitude, longitude }
    : null;
};

/**
 * compute distance in km for two points
 */
export const distanceBetween = (
  cityA: RawCoordinates,
  cityB: RawCoordinates
): number => {
  const cityANumerical = numericalCoordinate(cityA);
  const cityBNumerical = numericalCoordinate(cityB);

  // if inputs are not valid; return -1
  if (!cityANumerical || !cityBNumerical) return -1;

  return distance(
    point([cityANumerical.latitude, cityANumerical!.longitude]),
    point([cityBNumerical.latitude, cityBNumerical!.longitude])
  );
};

/** sort cities list by ascending distance */
export function sortByDistance(
  pivot: RawCoordinates,
  cities: RawCoordinates[]
) {
  return cities.sort((a, b) => {
    return distanceBetween(pivot, a) - distanceBetween(pivot, b);
  });
}
