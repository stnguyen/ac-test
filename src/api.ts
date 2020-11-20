import rateLimit from "express-rate-limit";
import { CityDatabase } from "./cities/types";
import { dbMiddleware } from "./db";
import {
  postSuggestionMiddlewareChain,
  preSuggestionMiddlwareChain,
  suggestMiddleware,
} from "./suggestions/api";
import { cachedSuggestMiddleware } from "./suggestions/cache";
import { suggestFromIndex } from "./suggestions/finders/fromIndex";
import { suggestFromList } from "./suggestions/finders/fromList";

// TODO: provide DB as a middleware
export const apiServer = (DB: CityDatabase) => {
  const app = require("express")();
  app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  app.use(dbMiddleware(DB));

  // 50 req/seq from an ip address
  const limiter = rateLimit({
    windowMs: 3 * 1000, // 2 seconds@
    max: 500, // limit each IP to 100 requests per windowMs
  });

  app.get(
    "/suggestions",
    ...preSuggestionMiddlwareChain,
    cachedSuggestMiddleware(suggestMiddleware(suggestFromList)),
    ...postSuggestionMiddlewareChain,
    limiter
  );

  app.get(
    "/suggestions-index",
    ...preSuggestionMiddlwareChain,
    suggestMiddleware(suggestFromIndex),
    ...postSuggestionMiddlewareChain,
    limiter
  );

  return app;
};
