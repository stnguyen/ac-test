import { RawCoordinates } from "../geo";

export interface City {
  id: string;
  name: string;
  ascii: string;
  alt_name: string;
  lat: string;
  long: string;
  feat_class: string;
  feat_code: string;
  country: string;
  cc2: string;
  admin1: string;
  admin2: string;
  admin3: string;
  admin4: string;
  population: string;
  elevation: string;
  dem: string;
  tz: string;
  modified_at: string;
}

/** the type used to stored and indexed the cities after pre-processing */
export interface StoredCity extends RawCoordinates {
  id: string;
  name: string;
  canonicalName: string;
  onlyName: string;
}

export interface CityDatabase {
  objects: { [Id: string]: StoredCity };
  cities: StoredCity[];
  index: {
    matches: { [NormalizedName: string]: string };
    partials: { [PartialMatch: string]: string[] };
  };
}
