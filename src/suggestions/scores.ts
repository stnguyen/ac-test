import fs from "fs";
import { last, omit } from "lodash";
import { distanceBetween, RawCoordinates } from "../geo";
import { levenshteinDistance } from "../text";
import { sortByNumericalField } from "../sort";
import { twoDecimalsAtMost } from "../numbers";
import { StoredCity } from "../cities";
import { Suggestion } from "./types";
import { Request } from "express";

/** load the index in memory for the sake of example */
export const loadIndexFromFile = (file: string) =>
  JSON.parse(fs.readFileSync(file, "utf-8"));

export function withLevensteinDistanceScore(
  reference: string,
  results: StoredCity[]
): Suggestion[] {
  return results.map((result) => ({
    ...result,
    /**
     * the levenstein distance gets the number of differents char from a reference
     */
    score: twoDecimalsAtMost(
      1 - levenshteinDistance(reference, result.onlyName) / reference.length
    ),
  }));
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
    distanceFromPivot: distanceBetween(reference, {
      latitude: result.latitude,
      longitude: result.longitude,
    }),
  }));

  // sort by distance from pivot
  withDistance = sortByNumericalField("ASC", "distanceFromPivot", withDistance);

  // get closests and furthest to build a linear scale
  //const closestDistance = first(withDistance)?.distanceFromPivot ?? -1;
  const furthestDistance = last(withDistance)?.distanceFromPivot ?? -1;

  // weigh the geolocation according the heuristic priority given as an input
  return withDistance.map((result) => {
    // linear scale here !
    const geoScore = 1 - result.distanceFromPivot / furthestDistance;
    // barycenter of geoScore and actual score, rounded to 2 decimals when necessary
    const newScore = twoDecimalsAtMost(
      (geoPriority * geoScore + (result.score ?? 0)) / (geoPriority + 2)
    );
    return {
      ...omit(result, "distanceFromPivot"),
      // weigh geolocation 2x more than text accuracy
      score: newScore,
    };
  });
}

/** utility function to validate incoming get params in the suggestions endpoint */
export function validateParamsMiddleware(req: Request) {
  const [query, latitude, longitude] = [
    req.query.q,
    req.query.latitude,
    req.query.longitude,
  ];
  const hasQuery = query && query !== "";

  const hasLatitude = !isNaN(parseFloat((latitude as string) ?? ""));
  const hasLongitude = !isNaN(parseFloat((longitude as string) ?? ""));

  const pivotIsDefined = hasLatitude && hasLongitude;

  // TODO: extract pivot
  return hasQuery
    ? {
        query,
        ...(pivotIsDefined
          ? {
              pivot: {
                latitude,
                longitude,
              },
            }
          : {}),
      }
    : null;
}
