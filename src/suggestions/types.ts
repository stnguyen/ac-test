import { CityDatabase, StoredCity } from "../cities/types";
import { RawCoordinates } from "../geo";
export type CityFinder = (db: CityDatabase, query: string) => StoredCity[];

export interface Suggestion extends StoredCity {
  score?: number;
}

export interface SuggestionsResults {
  suggestions: Suggestion[];
}

export type Suggester = (
  db: CityDatabase,
  query: string,
  ...options: any[]
) => SuggestionsResults;

export interface SuggestionsQuery {
  query: string;
  center?: RawCoordinates;
}
