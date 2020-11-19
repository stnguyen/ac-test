import { CityDatabase, StoredCity } from "../cities";
export type CityFinder = (db: CityDatabase, query: string) => StoredCity[];

export interface Suggestion extends StoredCity {
  score?: number;
}

export interface SuggestionsResults {
  suggestions: Suggestion[];
}

export type Suggester = (
  DB: CityDatabase,
  query: string,
  ...options: any[]
) => SuggestionsResults;
