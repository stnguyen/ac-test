import levenshtein from "fast-levenshtein";

// TODO: have it in one pass
/** predictable and testable sanitized version of a given string */
export const sanitizeString = (str: string) =>
  str
    .toLowerCase()
    .replace(/[\s-_]+/g, "")
    .replace(/[éèêë]/g, "e")
    .replace(/[àâä]/g, "a")
    .replace(/[ïìî]/g, "i")
    .replace(/[üûù]/g, "u")
    .replace(/[ôòö]/g, "o");

/**
 * return the distance between two strings, useful for fuzzy matching
 */
export function levenshteinDistance(text1: string, text2: string) {
  return levenshtein.get(text1, text2);
}
