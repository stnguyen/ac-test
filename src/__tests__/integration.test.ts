import DB from "../../data/db.json";
import { apiServer } from "../api";
import supertest, { Response } from "supertest";
import { CityDatabase } from "../cities/types";
import { Suggestion } from "../suggestions/types";

const app = apiServer(DB as CityDatabase);
const request = supertest(app);

describe("[integrations] GET /suggestions", function () {
  describe("with a non-existent city", function () {
    let response: Response;

    beforeAll(async () => {
      response = await request
        .get("/suggestions?q=SomeRandomCityInTheMiddleOfNowhere")
        .catch((e) => {
          console.error(e);
          return e;
        });
    });
    it("returns a 404", function () {
      expect(response.status).toEqual(404);
    });

    it("returns an empty array of suggestions", function () {
      expect(response.body.suggestions).toBeInstanceOf(Array);
      expect(response.body.suggestions).toHaveLength(0);
    });
  });

  describe("with a valid city", function () {
    let response: Response;

    beforeAll(async () => {
      response = await request.get("/suggestions?q=Montréal").catch((e) => e);
    });

    it("returns a 200", function () {
      expect(response.status).toEqual(200);
    });

    it("returns an array of suggestions", function () {
      expect(response.body.suggestions).toBeInstanceOf(Array);
      expect(response.body.suggestions.length).toBeGreaterThan(0);
    });

    it("contains a match", function () {
      const suggestions = response.body.suggestions;
      expect(
        suggestions.some(function (suggestion: Suggestion) {
          return /montréal/i.test(suggestion.name);
        })
      ).toBeTruthy();
    });

    it("contains latitudes and longitudes", function () {
      const suggestions = response.body.suggestions;
      expect(
        suggestions.every(function (suggestion: Suggestion) {
          // warning to type coercions here !
          // if('') console.log('true') => never executed
          return [suggestion.latitude, suggestion.longitude].every(
            (field) => field !== undefined && field !== ""
          );
        })
      ).toBeTruthy();
    });

    it("contains scores", function () {
      const suggestions = response.body.suggestions;
      expect(
        suggestions.every(function (suggestion: Suggestion) {
          return suggestion.score !== undefined;
        })
      ).toBeTruthy();
    });
  });

  describe("with a valid city and a geo-center", function () {
    let response: Response;

    beforeAll(async () => {
      response = await request
        .get("/suggestions?q=Montréal&latitude=45.508888&longitude=-73.561668")
        .catch((e) => e);
    });

    it("returns a 200", function () {
      expect(response.status).toEqual(200);
    });

    it("returns an array of suggestions", function () {
      expect(response.body.suggestions).toBeInstanceOf(Array);
      expect(response.body.suggestions.length).toBeGreaterThan(0);
    });

    it("contains a match", function () {
      const suggestions = response.body.suggestions;
      expect(
        suggestions.some(function (suggestion: Suggestion) {
          return /montréal/i.test(suggestion.name);
        })
      ).toBeTruthy();
    });

    it("contains latitudes and longitudes", function () {
      const suggestions = response.body.suggestions;
      expect(
        suggestions.every(function (suggestion: Suggestion) {
          // warning to type coercions here !
          // if('') console.log('true') => never executed
          return [suggestion.latitude, suggestion.longitude].every(
            (field) => field !== undefined && field !== ""
          );
        })
      ).toBeTruthy();
    });

    it("contains scores", function () {
      const suggestions = response.body.suggestions;
      expect(
        suggestions.every(function (suggestion: Suggestion) {
          return suggestion.score !== undefined;
        })
      ).toBeTruthy();
    });
  });
});
