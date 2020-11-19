import { levenshteinDistance, prefixRegex, sanitizeString } from "./text";

describe("text/levenshtein", () => {
  it("should compute the lev. distance between two strings", () => {
    expect(levenshteinDistance("back", "book")).toBe(2);
  });
});

describe("text/regexp/sanitize", () => {
  it("should remove white space, - and _", () => {
    expect(sanitizeString("a a a")).toEqual("aaa");
  });

  it("should transform common accented chars to their root", () => {
    expect(sanitizeString("éèêëàâäïìîûüùúūôòö")).toEqual("eeeeaaaiiiuuuuuooo");
  });
});

describe("text/regexp/prefixRegex", () => {
  it("should transform a floating regexp to one that match from the start of the string", () => {
    expect(prefixRegex("a{3}")).toEqual("^a{3}");
  });
});
