/**
 * return the number with at most 2 decimals
 * @param {number} number
 */
export function twoDecimalsAtMost(number: number) {
  return +Number(number).toFixed(2);
}
