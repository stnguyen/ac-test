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

/**
 * compute a linear scale based on a reference point and a max point (the furthest value in the provided sorted array)
 * @param min
 * @param key
 * @param reverse
 */
export const computeLinearScaleScore = <T extends { score?: number }>(
  min: number,
  key: keyof T,
  reverse: boolean = false
) => (objects: T[]) => {
  // the array is sorted, so we get the last element
  const max = (objects[objects.length - 1][key] as unknown) as number;

  return objects.map((object) => {
    const currentValue = (object[key] as unknown) as number;
    //we get the current score as a ratio in the scale (min, max)
    const score = Math.abs(currentValue - min) / (max - min);
    const withComplement = reverse ? Math.abs(score - 1) : score;
    //we merge back with the object
    const res = { ...object, score: withComplement };
    return res;
  });
};

/** we compute a inverse linear scale based on the levenstein distance (0 means the furthest, 1 is an exact match)  */
export function withLevensteinDistanceScore(
  reference: string,
  results: StoredCity[]
): Suggestion[] {
  return flow(
    map((result: StoredCity) => {
      return {
        ...result,
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
export const withGeoDistanceScore = (
  reference: RawCoordinates,
  results: Suggestion[]
): Suggestion[] => {
  return flow(
    map((result: Suggestion) => ({
      ...result,
      distance: distanceBetween(reference, {
        latitude: result.latitude,
        longitude: result.longitude,
      }),
    })),
    sortBy<SuggestionWithDistance>(["distance"]),
    computeLinearScaleScore<SuggestionWithDistance>(0, "distance", true),
    map((suggestion) => ({
      ...suggestion,
      score: twoDecimalsAtMost(suggestion.score),
    })),
    map(
      flow(
        omit<SuggestionWithDistance, "distance">(["distance"])
      )
    )
  )(results);
};
