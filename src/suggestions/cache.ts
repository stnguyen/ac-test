import { fromCacheOr } from "../cache";
import { Suggester, SuggestionsResults } from "./types";

export const cachedSuggester = (suggester: Suggester): Suggester => (
  db,
  query
) => {
  const key = JSON.stringify(query);
  return fromCacheOr<SuggestionsResults>(key, suggester.bind(null, db, query))
    .json;
};
