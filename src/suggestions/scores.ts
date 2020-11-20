import { flow, last, omit as normalOmit } from "lodash";
import { distanceBetween, RawCoordinates } from "../geo";
import { levenshteinDistance } from "../text";
import { sortByNumericalField } from "../sort";
import { twoDecimalsAtMost } from "../numbers";
import { StoredCity } from "../cities/types";
import { Suggestion } from "./types";
import { map, sortBy, omit } from "lodash/fp";

type SuggestionWithDistance = Suggestion & {
  distance: number;
};

export const computeLinearScaleScore = <T extends { score?: number }>(
  min: number,
  key: keyof T,
  reverse: boolean = false
) => (objects: T[]) => {
  const max = (objects[objects.length - 1][key] as unknown) as number;
  return objects.map((object) => {
    const currentValue = (object[key] as unknown) as number;
    const score = (currentValue - min) / (max - min);
    const res = { ...object, score: reverse ? 1 - score : score };
    return res;
  });
};

export function withLevensteinDistanceScore(
  reference: string,
  results: StoredCity[]
): Suggestion[] {
  return flow(
    map((result: StoredCity) => {
      return {
        ...result,
        /**
         * the levenstein distance gets the number of differents char from a reference
         */
        distance: levenshteinDistance(reference, result.onlyName),
      };
    }),
    sortBy<SuggestionWithDistance>(["distance"]),
    computeLinearScaleScore<SuggestionWithDistance>(0, "distance", true),
    map(
      flow(
        omit<SuggestionWithDistance, "distance">(["distance"])
      )
    )
  )(results);
}

/**
 * weigh similar results depending on the distance to a given point
 * the scores must in order to produce a scale
 */
export function withGeoDistanceScore(
  reference: RawCoordinates,
  results: Suggestion[],
  geoPriority: number = 2
): Suggestion[] {
  // enrich with distance
  let withDistance = results.map((result) => ({
    ...result,
    distanceFromGeoCenter: distanceBetween(reference, {
      latitude: result.latitude,
      longitude: result.longitude,
    }),
  }));

  // sort by distance from the provided reference
  withDistance = sortByNumericalField(
    "ASC",
    "distanceFromGeoCenter",
    withDistance
  );

  // get the furthest from the reference to build a linear scale
  const furthestDistance = last(withDistance)?.distanceFromGeoCenter ?? -1;

  //weigh the geolocation according the heuristic priority given as an input
  return withDistance.map((result) => {
    // linear scale here !
    const geoScore = 1 - result.distanceFromGeoCenter / furthestDistance;
    // barycenter of geoScore and actual score, rounded to 2 decimals when necessary
    const newScore = twoDecimalsAtMost(
      (geoPriority * geoScore + (result.score ?? 0)) / (geoPriority + 2)
    );
    return {
      ...normalOmit(result, "distanceFromGeoCenter"),
      // weigh geolocation 2x more than text accuracy
      score: newScore,
    } as Suggestion;
  });
}
