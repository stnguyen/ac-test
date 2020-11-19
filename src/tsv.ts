import { Transformer } from "./types";

/** a standard tsv limiter */
const TSV_DELIMITER = /\t/;

/** transform a tsv line to object with each key mapping the header name */
export const lineToMap = (delimiter: string | RegExp) => (
  tranformer: Transformer,
  headersArray: string[]
) => <ProducedRecord extends {}>(line: string): ProducedRecord => {
  const splitted = tranformer(line).split(delimiter);
  return headersArray.reduce((object, headerLabel, index) => {
    object[headerLabel] = splitted[index];
    return object;
  }, {} as Record<string, string>) as ProducedRecord;
};

export const tsvLineToMap = lineToMap(TSV_DELIMITER);
