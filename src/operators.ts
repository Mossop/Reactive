import { Observable } from "./types";
import { derive, join } from "./derived";

/**
 * Template string function to generate an observable string including the
 * observed values of the template parts.
 */
export function os(
  [...parts]: TemplateStringsArray,
  ...params: unknown[]
): Observable<string> {
  let joined: unknown[] = [];
  while (parts.length) {
    joined.push(parts.shift());
    if (params.length) {
      joined.push(params.shift());
    }
  }

  while (params.length) {
    joined.push(params.shift());
  }

  return derive(join(...joined), (strs: unknown[]): string => strs.join(""));
}
