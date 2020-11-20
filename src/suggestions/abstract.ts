import { withGeoDistanceScore, withLevensteinDistanceScore } from "./scores";
import { CityDatabase } from "../cities/types";
import { CityFinder, Suggester, SuggestionsResults } from "./types";
import { sortByNumericalField } from "../sort";
import { RawCoordinates } from "../geo";

const noMatch: SuggestionsResults = {
  suggestions: [],
};

/**
 * generic suggest method, find matches, and weigh them by levenstein distance and geo distance
 */
// FIXME
export const abstractSuggest = (finder: CityFinder): Suggester => (
  db: CityDatabase,
  query: string,
  geocenter: RawCoordinates | null = null
): SuggestionsResults => {
  if (query !== "") {
    // sanitized version of the query
    const matches = finder(db, query);
    if (matches.length === 0) return noMatch;

    let matchesWithScores = withLevensteinDistanceScore(query, matches);

    // weight by geolocation
    if (geocenter) {
      matchesWithScores = withGeoDistanceScore(geocenter, matchesWithScores);
    }

    // sort by score
    matchesWithScores = sortByNumericalField("DSC", "score", matchesWithScores);
    return {
      suggestions: matchesWithScores,
    };
  }

  return noMatch;
};
