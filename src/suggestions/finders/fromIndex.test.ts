import omit from "lodash/fp/omit";
import { CityDatabase } from "../../cities/types";
import { suggestFromIndex } from "./fromIndex";
import { suggestFromList } from "./fromList";

const sampleDb: Partial<CityDatabase> = {
  objects: {
    "4046272": {
      id: "4046274",
      latitude: "0",
      longitude: "0",
      name: "Not relevant, TX, US",
      canonicalName: "notrelevant",
      onlyName: "Not relevant",
    },
    "4046273": {
      id: "4046274",
      latitude: "28.97851",
      longitude: "-96.64603",
      name: "Edna, TX, US",
      canonicalName: "edna",
      onlyName: "Edna",
    },
    "4046274": {
      id: "4046274",
      latitude: "28.97854",
      longitude: "-96.64603",
      name: "Edna-az, TX, US",
      canonicalName: "ednaaz",
      onlyName: "Edna-az",
    },
  },
  index: {
    matches: { edna: "4046273", ednaaz: "4046274" },
    partials: {
      e: ["4046273", "4046274"],
      ed: ["4046273", "4046274"],
      edn: ["4046273", "4046274"],
      edna: ["4046273", "4046274"],
      ednaa: ["4046274"],
    },
  },
};

describe("Suggestions with an index", () => {
  it("should return cities matching the begin of the query, sorted by levenstein and no geo reference involved", () => {
    const suggestions = suggestFromIndex(sampleDb as CityDatabase, "Ed")
      .suggestions;
    const scores = suggestions.map((suggestion) => suggestion.score);

    expect(scores).toEqual([0.6, 0]);
    expect(suggestions.map(omit("score"))).toEqual([
      {
        id: "4046274",
        latitude: "28.97851",
        longitude: "-96.64603",
        name: "Edna, TX, US",
        canonicalName: "edna",
        onlyName: "Edna",
      },
      {
        id: "4046274",
        latitude: "28.97854",
        longitude: "-96.64603",
        name: "Edna-az, TX, US",
        canonicalName: "ednaaz",
        onlyName: "Edna-az",
      },
    ]);
  });
});
