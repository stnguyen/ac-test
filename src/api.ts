import { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { fromCacheOr } from "./cache";

import { validateParamsMiddleware } from "./suggestions/transformers";
import { suggestFromList } from "./suggestions/fromList";
import { suggestFromIndex } from "./suggestions/fromIndex";
import { CityDatabase } from "./cities";
import { Suggester, Suggestion, SuggestionsResults } from "./suggestions/types";

/** the main process of computing suggestions */
function suggestionBaseEndpoint(
  DB: CityDatabase,
  suggest: Suggester,
  cache = true
) {
  return (req: Request, res: Response) => {
    const params = validateParamsMiddleware(req);
    // params are not well formatted
    if (!params) return res.status(422).end('{error: "malformed request"}');
    // get the results

    let suggested: SuggestionsResults;

    if (cache) {
      suggested = fromCacheOr<SuggestionsResults>(req.url, () =>
        suggest(DB, params.query as string)
      ).json;
    } else {
      suggested = suggest(DB, params.query as string);
    }

    // no results there
    if (suggested.suggestions.length === 0)
      return res.status(404).end(suggested);
    // we got results yeah !
    return res.json(suggested);
  };
}

// TODO: provide DB as a middleware
export const apiServer = (DB: CityDatabase) => {
  const app = require("express")();
  app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

  // 50 req/seq from an ip address
  const limiter = rateLimit({
    windowMs: 3 * 1000, // 2 seconds@
    max: 500, // limit each IP to 100 requests per windowMs
  });

  app.get("/suggestions", suggestionBaseEndpoint(DB, suggestFromList), limiter);
  app.get("/suggestions-nolimit", suggestionBaseEndpoint(DB, suggestFromList));
  app.get(
    "/suggestions-nolimit-nocache",
    suggestionBaseEndpoint(DB, suggestFromList)
  );
  app.get("/suggestions-index", suggestionBaseEndpoint(DB, suggestFromIndex));
  app.get(
    "/suggestions-index-nocache",
    suggestionBaseEndpoint(DB, suggestFromIndex, false)
  );

  return app;
};
