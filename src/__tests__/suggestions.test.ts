import DB from "../../data/db.json";
import { apiServer } from "../api";
import supertest from "supertest";
import { CityDatabase } from "../cities";
import { Suggestion } from "../suggestions/types";

const app = apiServer(DB as CityDatabase);
const request = supertest(app);

describe("GET /suggestions", function () {
  describe("with a non-existent city", function () {
    let response: any;

    beforeAll(function (done) {
      request
        .get("/suggestions?q=SomeRandomCityInTheMiddleOfNowhere")
        .end(function (err, res) {
          response = res;
          response.json = JSON.parse(res.text);
          done(err);
        });
    });

    it("returns a 404", function () {
      expect(response.status).toEqual(404);
    });

    it("returns an empty array of suggestions", function () {
      expect(response.json.suggestions).toBeInstanceOf(Array);
      expect(response.json.suggestions).toHaveLength(0);
    });
  });

  describe("with a valid city", function () {
    let response: any;

    beforeAll(function (done) {
      request.get("/suggestions?q=Montreal").end(function (err, res) {
        response = res;
        response.json = JSON.parse(res.text);
        done(err);
      });
    });

    it("returns a 200", function () {
      expect(response.statusCode).toEqual(200);
    });

    it("returns an array of suggestions", function () {
      expect(response.json.suggestions).toBeInstanceOf(Array);
      expect(response.json.suggestions.length).toBeGreaterThan(0);
    });

    it("contains a match", function () {
      const suggestions = response.json.suggestions;
      expect(
        suggestions.some(function (suggestion: Suggestion) {
          return /montréal/i.test(suggestion.name);
        })
      ).toBeTruthy();
    });

    it("contains latitudes and longitudes", function () {
      const suggestions = response.json.suggestions;
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
      const suggestions = response.json.suggestions;
      expect(
        suggestions.every(function (suggestion: Suggestion) {
          return suggestion.score !== undefined;
        })
      ).toBeTruthy();
    });
  });
});
