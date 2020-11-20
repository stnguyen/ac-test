import { Handler, Request } from "express";
import { flow } from "lodash";
import { SuggestionsQuery } from "./types";

const hasQuery = (query?: string) => query && query !== "";

export const getParams = (req: Request): Partial<SuggestionsQuery> => {
  return {
    query: req.query.q as string | undefined,
    center: {
      latitude: req.query.latitude as string,
      longitude: req.query.longitude as string,
    },
  };
};

export const queryMustBePresent = (
  query: Partial<SuggestionsQuery>
): SuggestionsQuery => {
  if (!hasQuery(query.query)) throw new Error("query is required");
  return query as SuggestionsQuery;
};

export const withGeoCenter = (query: SuggestionsQuery): SuggestionsQuery => {
  const hasLatitude = !isNaN(parseFloat(query.center?.latitude ?? ""));
  const hasLongitude = !isNaN(parseFloat(query.center?.longitude ?? ""));
  const centerIsDefined = hasLatitude && hasLongitude;

  if (centerIsDefined) return query;

  return { query: query.query };
};

/** utility function to validate incoming get params in the suggestions endpoint */
export const normalizeParams = flow(
  getParams,
  queryMustBePresent,
  withGeoCenter
);

export const validationMiddleware: Handler = (req, res, next) => {
  // validation middleware
  try {
    const params = normalizeParams(req);
    req.app.locals.params = params;
  } catch (e) {
    // params are not well formatted
    return res.status(422).end('{error: "malformed request"}');
  }
  next();
};

export const getParamsFromRequest = (req: Request): SuggestionsQuery => {
  return req.app.locals.params;
};
