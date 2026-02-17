/** Matches Cache-Control directives and their optional values (RFC 9111 §5.2) */
const HEADER_REGEXP = /([a-zA-Z][a-zA-Z_-]*)\s*(?:=(?:"([^"]*)"|([^ \t",;]*)))?/g

/** RFC 9110 §5.6.2: token = 1*tchar */
const TOKEN_REGEXP = /^[!#$%&'*+\-.^_`|~\w]+$/

/**
 * Represents the possible values of a `Cache-Control` HTTP header.
 *
 * All properties are optional, allowing partial objects to be passed to {@link format}.
 */
export interface CacheControlValue {
  maxAge?: number | null
  sharedMaxAge?: number | null
  maxStale?: boolean | null
  maxStaleDuration?: number | null
  minFresh?: number | null
  immutable?: boolean | null
  mustRevalidate?: boolean | null
  mustUnderstand?: boolean | null
  noCache?: boolean | null
  noCacheFields?: string[] | null
  noStore?: boolean | null
  noTransform?: boolean | null
  onlyIfCached?: boolean | null
  private?: boolean | null
  privateFields?: string[] | null
  proxyRevalidate?: boolean | null
  public?: boolean | null
  staleWhileRevalidate?: number | null
  staleIfError?: number | null
}

const STRINGS = {
  maxAge: 'max-age',
  sharedMaxAge: 's-maxage',
  maxStale: 'max-stale',
  minFresh: 'min-fresh',
  immutable: 'immutable',
  mustRevalidate: 'must-revalidate',
  mustUnderstand: 'must-understand',
  noCache: 'no-cache',
  noStore: 'no-store',
  noTransform: 'no-transform',
  onlyIfCached: 'only-if-cached',
  private: 'private',
  proxyRevalidate: 'proxy-revalidate',
  public: 'public',
  staleWhileRevalidate: 'stale-while-revalidate',
  staleIfError: 'stale-if-error',
}

function parseBooleanOnly(value: string | null) {
  return value === null
}

function parseFieldNames(value: string): string[] | null {
  const fields = value
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean)
  return fields.length > 0 ? fields : null
}

function formatDuration(tokens: string[], name: string, value: number | null | undefined) {
  if (typeof value === 'number') {
    tokens.push(`${name}=${value}`)
  }
}

function formatBoolean(tokens: string[], name: string, value: boolean | null | undefined) {
  if (value) {
    tokens.push(name)
  }
}

function formatFieldNames(
  tokens: string[],
  name: string,
  value: boolean | null | undefined,
  fields: string[] | null | undefined,
) {
  if (value) {
    const valid = fields?.map((f) => f.trim()).filter((f) => TOKEN_REGEXP.test(f))
    if (valid && valid.length > 0) {
      tokens.push(`${name}="${valid.join(', ')}"`)
    } else {
      tokens.push(name)
    }
  }
}

function parseDuration(value: string | null) {
  if (!value) {
    return null
  }

  const duration: number = Number.parseInt(value, 10)

  if (!Number.isFinite(duration) || duration < 0) {
    return null
  }

  return duration
}

/**
 * A parsed `Cache-Control` HTTP header.
 *
 * Properties are initialized to `null` (unset). After calling {@link CacheControl.parse},
 * boolean directives that were absent in the header are set to `false`,
 * while duration directives that were absent remain `null`.
 */
export class CacheControl implements CacheControlValue {
  maxAge: number | null
  sharedMaxAge: number | null
  maxStale: boolean | null
  maxStaleDuration: number | null
  minFresh: number | null
  immutable: boolean | null
  mustRevalidate: boolean | null
  mustUnderstand: boolean | null
  noCache: boolean | null
  noCacheFields: string[] | null
  noStore: boolean | null
  noTransform: boolean | null
  onlyIfCached: boolean | null
  private: boolean | null
  privateFields: string[] | null
  proxyRevalidate: boolean | null
  public: boolean | null
  staleWhileRevalidate: number | null
  staleIfError: number | null

  constructor() {
    this.maxAge = null
    this.sharedMaxAge = null
    this.maxStale = null
    this.maxStaleDuration = null
    this.minFresh = null
    this.immutable = null
    this.mustRevalidate = null
    this.mustUnderstand = null
    this.noCache = null
    this.noCacheFields = null
    this.noStore = null
    this.noTransform = null
    this.onlyIfCached = null
    this.private = null
    this.privateFields = null
    this.proxyRevalidate = null
    this.public = null
    this.staleWhileRevalidate = null
    this.staleIfError = null
  }

  parse(header: string | undefined): this {
    if (!header || header.length === 0) {
      return this
    }

    const values: Record<string, string | null> = {}

    for (const match of header.matchAll(HEADER_REGEXP)) {
      values[match[1].toLowerCase()] = match[2] ?? match[3] ?? null
    }

    this.maxAge = parseDuration(values[STRINGS.maxAge])
    this.sharedMaxAge = parseDuration(values[STRINGS.sharedMaxAge])

    this.maxStale = parseBooleanOnly(values[STRINGS.maxStale])
    this.maxStaleDuration = parseDuration(values[STRINGS.maxStale])
    if (this.maxStaleDuration !== null) {
      this.maxStale = true
    }

    this.minFresh = parseDuration(values[STRINGS.minFresh])

    // NOTE: RFC 8246 says immutable arguments MUST be ignored, meaning
    // immutable=foo should still parse as true. We intentionally treat it
    // as false for consistency with the other boolean directives.
    this.immutable = parseBooleanOnly(values[STRINGS.immutable])
    this.mustRevalidate = parseBooleanOnly(values[STRINGS.mustRevalidate])
    this.mustUnderstand = parseBooleanOnly(values[STRINGS.mustUnderstand])

    if (STRINGS.noCache in values) {
      this.noCache = true
      const v = values[STRINGS.noCache]
      this.noCacheFields = v ? parseFieldNames(v) : null
    } else {
      this.noCache = false
      this.noCacheFields = null
    }

    this.noStore = parseBooleanOnly(values[STRINGS.noStore])
    this.noTransform = parseBooleanOnly(values[STRINGS.noTransform])
    this.onlyIfCached = parseBooleanOnly(values[STRINGS.onlyIfCached])

    if (STRINGS.private in values) {
      this.private = true
      const v = values[STRINGS.private]
      this.privateFields = v ? parseFieldNames(v) : null
    } else {
      this.private = false
      this.privateFields = null
    }

    this.proxyRevalidate = parseBooleanOnly(values[STRINGS.proxyRevalidate])
    this.public = parseBooleanOnly(values[STRINGS.public])
    this.staleWhileRevalidate = parseDuration(values[STRINGS.staleWhileRevalidate])
    this.staleIfError = parseDuration(values[STRINGS.staleIfError])

    return this
  }

  format(): string {
    const tokens: string[] = []

    formatDuration(tokens, STRINGS.maxAge, this.maxAge)
    formatDuration(tokens, STRINGS.sharedMaxAge, this.sharedMaxAge)

    if (this.maxStale) {
      if (typeof this.maxStaleDuration === 'number') {
        tokens.push(`${STRINGS.maxStale}=${this.maxStaleDuration}`)
      } else {
        tokens.push(STRINGS.maxStale)
      }
    }

    formatDuration(tokens, STRINGS.minFresh, this.minFresh)
    formatBoolean(tokens, STRINGS.immutable, this.immutable)
    formatBoolean(tokens, STRINGS.mustRevalidate, this.mustRevalidate)
    formatBoolean(tokens, STRINGS.mustUnderstand, this.mustUnderstand)
    formatFieldNames(tokens, STRINGS.noCache, this.noCache, this.noCacheFields)
    formatBoolean(tokens, STRINGS.noStore, this.noStore)
    formatBoolean(tokens, STRINGS.noTransform, this.noTransform)
    formatBoolean(tokens, STRINGS.onlyIfCached, this.onlyIfCached)
    formatFieldNames(tokens, STRINGS.private, this.private, this.privateFields)
    formatBoolean(tokens, STRINGS.proxyRevalidate, this.proxyRevalidate)
    formatBoolean(tokens, STRINGS.public, this.public)
    formatDuration(tokens, STRINGS.staleWhileRevalidate, this.staleWhileRevalidate)
    formatDuration(tokens, STRINGS.staleIfError, this.staleIfError)

    return tokens.join(', ')
  }
}

/**
 * Parses a `Cache-Control` HTTP header value into a {@link CacheControl} instance.
 *
 * @param header - The raw header string (e.g. `"public, max-age=31536000"`).
 *   If `undefined` or empty, all properties remain `null` (unset).
 * @returns A {@link CacheControl} instance with the parsed directive values.
 */
export function parse(header?: string): CacheControl {
  const cc = new CacheControl()
  return cc.parse(header)
}

/**
 * Formats a {@link CacheControlValue} object into a `Cache-Control` HTTP header string.
 *
 * @param cc - An object (or {@link CacheControl} instance) with directive values.
 *   Only truthy booleans and non-null numbers are included in the output.
 * @returns The formatted header string (e.g. `"public, max-age=31536000"`),
 *   or an empty string if no directives are set.
 */
export function format(cc: CacheControlValue): string {
  if (!(cc instanceof CacheControl)) {
    return CacheControl.prototype.format.call(cc)
  }

  return cc.format()
}
