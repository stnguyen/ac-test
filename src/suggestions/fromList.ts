import { CityDatabase } from "../cities";
import { abstractSuggest } from "./abstract";
import { prefixRegex, sanitizeString } from "../text";

/**
 * search all list item without index
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
