const HEADER_REGEXP = /([a-zA-Z][a-zA-Z_-]*)\s*(?:=(?:"([^"]*)"|([^ \t",;]*)))?/g

const STRINGS = {
  maxAge: 'max-age',
  sharedMaxAge: 's-maxage',
  maxStale: 'max-stale',
  minFresh: 'min-fresh',
  immutable: 'immutable',
  mustRevalidate: 'must-revalidate',
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

function parseBooleanOnly(value) {
  return value === null
}

function parseDuration(value) {
  if (!value) {
    return null
  }

  const duration = Number.parseInt(value, 10)

  if (!Number.isFinite(duration) || duration < 0) {
    return null
  }

  return duration
}

class CacheControl {
  constructor() {
    this.maxAge = null
    this.sharedMaxAge = null
    this.maxStale = null
    this.maxStaleDuration = null
    this.minFresh = null
    this.immutable = null
    this.mustRevalidate = null
    this.noCache = null
    this.noStore = null
    this.noTransform = null
    this.onlyIfCached = null
    this.private = null
    this.proxyRevalidate = null
    this.public = null
    this.staleWhileRevalidate = null
    this.staleIfError = null
  }

  parse(header) {
    if (!header || header.length === 0) {
      return this
    }

    const values = {}
    const matches = header.match(HEADER_REGEXP) || []

    Array.prototype.forEach.call(matches, match => {
      const tokens = match.split('=', 2)

      const [key] = tokens
      let value = null

      if (tokens.length > 1) {
        value = tokens[1].trim()
      }

      values[key.toLowerCase()] = value
    })

    this.maxAge = parseDuration(values[STRINGS.maxAge])
    this.sharedMaxAge = parseDuration(values[STRINGS.sharedMaxAge])

    this.maxStale = parseBooleanOnly(values[STRINGS.maxStale])
    this.maxStaleDuration = parseDuration(values[STRINGS.maxStale])
    if (this.maxStaleDuration) {
      this.maxStale = true
    }

    this.minFresh = parseDuration(values[STRINGS.minFresh])

    this.immutable = parseBooleanOnly(values[STRINGS.immutable])
    this.mustRevalidate = parseBooleanOnly(values[STRINGS.mustRevalidate])
    this.noCache = parseBooleanOnly(values[STRINGS.noCache])
    this.noStore = parseBooleanOnly(values[STRINGS.noStore])
    this.noTransform = parseBooleanOnly(values[STRINGS.noTransform])
    this.onlyIfCached = parseBooleanOnly(values[STRINGS.onlyIfCached])
    this.private = parseBooleanOnly(values[STRINGS.private])
    this.proxyRevalidate = parseBooleanOnly(values[STRINGS.proxyRevalidate])
    this.public = parseBooleanOnly(values[STRINGS.public])
    this.staleWhileRevalidate = parseDuration(values[STRINGS.staleWhileRevalidate])
    this.staleIfError = parseDuration(values[STRINGS.staleIfError])

    return this
  }

  format() {
    const tokens = []

    if (typeof this.maxAge === 'number') {
      tokens.push(`${STRINGS.maxAge}=${this.maxAge}`)
    }

    if (typeof this.sharedMaxAge === 'number') {
      tokens.push(`${STRINGS.sharedMaxAge}=${this.sharedMaxAge}`)
    }

    if (this.maxStale) {
      if (typeof this.maxStaleDuration === 'number') {
        tokens.push(`${STRINGS.maxStale}=${this.maxStaleDuration}`)
      } else {
        tokens.push(STRINGS.maxStale)
      }
    }

    if (typeof this.minFresh === 'number') {
      tokens.push(`${STRINGS.minFresh}=${this.minFresh}`)
    }

    if (this.immutable) {
      tokens.push(STRINGS.immutable)
    }

    if (this.mustRevalidate) {
      tokens.push(STRINGS.mustRevalidate)
    }

    if (this.noCache) {
      tokens.push(STRINGS.noCache)
    }

    if (this.noStore) {
      tokens.push(STRINGS.noStore)
    }

    if (this.noTransform) {
      tokens.push(STRINGS.noTransform)
    }

    if (this.onlyIfCached) {
      tokens.push(STRINGS.onlyIfCached)
    }

    if (this.private) {
      tokens.push(STRINGS.private)
    }

    if (this.proxyRevalidate) {
      tokens.push(STRINGS.proxyRevalidate)
    }

    if (this.public) {
      tokens.push(STRINGS.public)
    }

    if (typeof this.staleWhileRevalidate === 'number') {
      tokens.push(`${STRINGS.staleWhileRevalidate}=${this.staleWhileRevalidate}`)
    }

    if (typeof this.staleIfError === 'number') {
      tokens.push(`${STRINGS.staleIfError}=${this.staleIfError}`)
    }

    return tokens.join(', ')
  }
}

function parse(header) {
  const cc = new CacheControl()
  return cc.parse(header)
}

function format(cc) {
  if (!(cc instanceof CacheControl)) {
    return CacheControl.prototype.format.call(cc)
  }

  return cc.format()
}

module.exports = {
  CacheControl,
  parse,
  format,
}
