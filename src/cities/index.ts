import lineReader from "line-reader";
import { set, get, identity } from "lodash";
import { tsvLineToMap } from "../tsv";
import { sanitizeString } from "../text";
import provinceFips from "../../data/provinceFips.json";
import { City, CityDatabase, StoredCity } from "./types";

// constants
const POPULATION_THRESHOLD = 5000;

/** Business-aware utilities to construct the town index */
/** create object with these keys from a line */
export const cityLineMapper = tsvLineToMap(identity, [
  "id",
  "name",
  "ascii",
  "alt_name",
  "lat",
  "long",
  "feat_class",
  "feat_code",
  "country",
  "cc2",
  "admin1",
  "admin2",
  "admin3",
  "admin4",
  "population",
  "elevation",
  "dem",
  "tz",
  "modified_at",
]);

/** is a given city valid in our search */
export function isCityValid(city: City, threshold: number): boolean {
  const population = parseInt(city.population);
  if (isNaN(population)) return false;
  return population > threshold;
}

/**
 * main function to index all the cities
 * This should be run ONCE, ahead of time.
 */
export function indexCities(filePath: string) {
  return new Promise((resolve) => {
    const db: CityDatabase = {
      objects: {},
      cities: [],
      index: {
        matches: {},
        partials: {},
      },
    };
    let first = true;
    lineReader.eachLine(filePath, (line, last) => {
      // skip first line
      if (first) {
        first = false;
        return true;
      }
      const lineObject = cityLineMapper<City>(line);
      // the city is big enough
      if (isCityValid(lineObject, POPULATION_THRESHOLD)) {
        // get the province or state code
        const stateCode =
          (provinceFips as Record<string, string>)[lineObject.admin1] ||
          lineObject.admin1;

        const object = {
          id: lineObject.id,
          latitude: lineObject.lat,
          longitude: lineObject.long,
          name: `${lineObject.name}, ${stateCode}, ${lineObject.country}`,
          canonicalName: sanitizeString(lineObject.name),
          onlyName: lineObject.name,
        };
        // buid a text index
        buildTextIndex(db, object);
        db.objects[lineObject.id] = object;
        db.cities.push(object);
      }
      if (last) {
        resolve(db);
        return false;
      }
    });
  });
}

/**
 * build a text index with direct matches and partial matches with ids list
 */
export function buildTextIndex(
  db: CityDatabase = {
    index: { matches: {}, partials: {} },
    objects: {},
    cities: [],
  },
  city: StoredCity
) {
  const id = city.id;
  const chars = city.canonicalName.split("");
  let path = "";

  // register the direct match
  db.index.matches[city.canonicalName] = id;
  // redirect partial matches
  for (let char of chars) {
    // we construct the partial char by char
    path += char;
    const ids = get(db.index.partials, path) || [];
    // we provide direct access to matching ids.
    ids.push(id);
    set(db.index.partials, path, ids);
  }
  return db;
}
