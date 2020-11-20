import { CityDatabase } from "../../cities/types";
import { abstractSuggest } from "../abstract";
import { prefixRegex, sanitizeString } from "../../text";

/**
 * search in the all without index
 * This is the naive approach, that can be compared to a table fullscan
 */
export function findMatchesInList(db: CityDatabase, query: string) {
  const canonicalQuery = sanitizeString(query);
  const fromStart = prefixRegex(canonicalQuery);
  const expression = new RegExp(fromStart);

  return db.cities.filter((city) => {
    return expression.test(city.canonicalName);
  });
}

export const suggestFromList = abstractSuggest(findMatchesInList);
