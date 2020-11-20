import { get, set, clear, fromCacheOr } from "./cache";

describe("Cache", () => {
  beforeAll(() => {
    clear();
  });
  it("should set a value", () => {
    set("key", { a: 1 });
    expect(get("key")).toEqual({ json: { a: 1 }, serialized: '{"a":1}' });
  });

  it("set should support a custom serializer", () => {
    set("key2", { a: 2 }, (value) => value.a * 2 + "");
    expect(get("key2")).toEqual({ json: 4, serialized: "4" });
    clear();
    expect(get("key")).toMatchSnapshot();
  });

  it("should cache a given operation or execute it the first time", () => {
    const op = jest.fn(() => ({ a: 1 }));
    fromCacheOr("key", op);
    expect(op).toBeCalledTimes(1);

    const result = fromCacheOr("key", op);
    expect(op).toBeCalledTimes(1);
    expect(result).toEqual({ json: { a: 1 }, serialized: '{"a":1}' });
  });
});
