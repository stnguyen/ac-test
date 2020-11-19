type Fn = (...args: any[]) => any;

/** negate a given value */
export const not = (fn: Fn) => (...args: any[]) => !fn(...args);
