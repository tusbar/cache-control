declare interface ICacheControl {
  maxAge?: number | null;
  sharedMaxAge?: number | null;
  maxStale?: boolean | null;
  maxStaleDuration?: number | null;
  minFresh?: number | null;
  immutable?: boolean | null;
  mustRevalidate?: boolean | null;
  noCache?: boolean | null;
  noStore?: boolean | null;
  noTransform?: boolean | null;
  onlyIfCached?: boolean | null;
  private?: boolean | null;
  proxyRevalidate?: boolean | null;
  public?: boolean | null;
  staleWhileRevalidate?: number | null;
  staleIfError?: number | null;
}

/**
 * Parses a Cache Control Header, constructing the JavaScript object
 * by the string.
 * @param header The string to parse
 * @returns The JavaScript value or object described
 */
declare function parse(header: string): ICacheControl

/**
 * Formats a Cache Control Header, constructing string from JavaScript object
 * by the string.
 * @param header The string to parse
 * @returns The JavaScript value or object described
 */
declare function format(cc: ICacheControl): string

export { parse, format }