import { Handler } from "express";
import { fromCacheOr } from "../cache";
import { Suggester, SuggestionsResults } from "./types";

export const cachedSuggestMiddleware = (suggestHandler: Handler): Handler => (
  req,
  res,
  next
) => {
  // we use the url as our cache key !
  return fromCacheOr<SuggestionsResults>(
    req.url,
    suggestHandler(req, res, next)
  );
};

export const cachedSuggester = (suggester: Suggester): Suggester => (
  db,
  query
) => {
  const key = JSON.stringify(query);
  return fromCacheOr<SuggestionsResults>(key, suggester.bind(null, db, query))
    .json;
};
