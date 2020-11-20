import { Handler } from "express";
import { fromCacheOr } from "../cache";
import { SuggestionsResults } from "./types";

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
