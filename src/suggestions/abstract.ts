import { withGeoDistanceScore, withLevensteinDistanceScore } from "./scores";
import { CityDatabase } from "../cities";
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
  pivot: RawCoordinates | null = null
): SuggestionsResults => {
  if (query !== "") {
    // sanitized version of the query
    let matches = finder(db, query);
    if (matches.length === 0) return noMatch;

    matches = withLevensteinDistanceScore(query, matches);

    // weight by geolocation
    if (pivot) {
      matches = withGeoDistanceScore(pivot, matches);
    }
    // sort by score
    matches = sortByNumericalField("DSC", "score", matches);
    return {
      suggestions: matches,
    };
  }

  return noMatch;
};
