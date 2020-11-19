import { CityDatabase } from "../cities";
import { abstractSuggest } from "./abstract";
import { sanitizeString } from "../text";

/**
 * search all list item without index
 */
export function findMatchesInList(db: CityDatabase, query: string) {
  const canonicalQuery = sanitizeString(query);
  return db.cities.filter((city) => {
    return new RegExp(canonicalQuery).test(city.canonicalName);
  });
}

export const suggestFromList = abstractSuggest(findMatchesInList);
