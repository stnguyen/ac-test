/** make a database instance available to the rest of the app */

import { Handler, Request } from "express";
import { CityDatabase } from "./cities/types";

/**
 * inject the db down the middleware chain
 * @param DB
 */
export const dbMiddleware = (DB: CityDatabase): Handler => (
  req,
  _res,
  next
) => {
  req.app.locals.db = DB;
  next();
};

/** retrieve the db from the middlware chain */
export const getDb = (req: Request): CityDatabase => {
  return req.app.locals.db;
};
