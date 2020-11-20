import { Handler } from "express";
import { getDb } from "../db";
import { Suggester, SuggestionsResults } from "./types";
import { getParamsFromRequest, validationMiddleware } from "./validations";

/** middleware that prepare the appropriate response from the suggestions result */
export const prepareResult: Handler = (req, res) => {
  const result: SuggestionsResults = req.app.locals.result;
  // no results there
  if (result.suggestions.length === 0) return res.status(404).json(result);
  // we got results yeah !
  return res.json(result);
};

/** a middlware that fetch the data from the database using the given suggester */
export const suggestMiddleware = (suggester: Suggester): Handler => (
  req,
  _res,
  next
) => {
  const suggestionQuery = getParamsFromRequest(req);
  const db = getDb(req);
  const suggested = suggester(db, suggestionQuery.query);
  req.app.locals.result = suggested;
  next();
};

export const preSuggestionMiddlwareChain = [validationMiddleware];
export const postSuggestionMiddlewareChain = [prepareResult];
