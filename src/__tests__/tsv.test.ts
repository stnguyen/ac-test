import { lineToMap } from "../tsv";

describe("TSV utils", () => {
  it("lineToMap should transform a line to an object according to the headers list, the input transformer, and a delimiter", () => {
    const headers = ["id", "a", "b"];
    const line = "00001  valueOfA\tvalueOfb";
    const twoSpacesToTab = (feat: string) => feat.replace(/ {2}/g, "\t");
    expect(lineToMap("\t")(twoSpacesToTab, headers)(line)).toEqual({
      id: "00001",
      a: "valueOfA",
      b: "valueOfb",
    });
  });
});
