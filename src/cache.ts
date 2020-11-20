import { Transformer } from "./types";

/** we support any specialized serializer */
export type Serializer = Transformer<any, string>;

/** Parse a serialized value */
export type Deserializer<Parsed extends any> = Transformer<string, Parsed>;

/** our in memory simple object storage */
export type CacheData = Record<string, string>;

export interface CachedValue<T> {
  /** the raw value stored in the cache */
  serialized: string;
  json: T;
}

let cache: CacheData = {};

// set a value
export function set<Value extends any>(
  key: string,
  value: Value,
  serializer: Serializer = JSON.stringify
) {
  cache[key] = serializer(value);
}

// get a value
export function get<Value extends any>(
  key: string,
  deserializer: Deserializer<Value> = JSON.parse
): CachedValue<Value> {
  const value = cache[key];
  return {
    serialized: value,
    json: value !== undefined ? deserializer(value) : value,
  };
}

//  clear the cache
export function clear() {
  cache = {};
}

/**
 * retrieves data from cache if the keys exists, otherwise, get it from the operation
 * @param {*} key
 * @param {*} operation
 */
export function fromCacheOr<ValueToStore>(
  key: string,
  operation: (...args: any[]) => ValueToStore,
  serializer = JSON.stringify
): CachedValue<ValueToStore> {
  const cached = get<ValueToStore>(key);
  if (cached.json === undefined) {
    const result = operation();
    set<ValueToStore>(key, result);
    return {
      serialized: serializer(result),
      json: result,
    };
  }
  return cached;
}
