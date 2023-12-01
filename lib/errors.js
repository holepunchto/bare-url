module.exports = class URLError extends Error {
  constructor (msg, code, fn = URLError) {
    super(`${code}: ${msg}`)
    this.code = code

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, fn)
    }
  }

  get name () {
    return 'URLError'
  }

  static INVALID_URL (msg = 'Invalid URL') {
    return new URLError(msg, 'INVALID_URL', URLError.INVALID_URL)
  }

  static INVALID_URL_SCHEME (msg = 'Invalid URL') {
    return new URLError(msg, 'INVALID_URL_SCHEME', URLError.INVALID_URL_SCHEME)
  }

  // https://url.spec.whatwg.org/#missing-scheme-non-relative-url
  static MISSING_SCHEME_NON_RELATIVE_URL (msg = 'Invalid URL') {
    return new URLError(msg, 'MISSING_SCHEME_NON_RELATIVE_URL', URLError.MISSING_SCHEME_NON_RELATIVE_URL)
  }

  // https://url.spec.whatwg.org/#invalid-credentials
  static INVALID_CREDENTIALS (msg = 'Invalid URL') {
    return new URLError(msg, 'INVALID_CREDENTIALS', URLError.INVALID_CREDENTIALS)
  }

  // https://url.spec.whatwg.org/#host-missing
  static HOST_MISSING (msg = 'Invalid URL') {
    return new URLError(msg, 'HOST_MISSING', URLError.HOST_MISSING)
  }

  // https://url.spec.whatwg.org/#port-out-of-range
  static PORT_OUT_OF_RANGE (msg = 'Invalid URL') {
    return new URLError(msg, 'PORT_OUT_OF_RANGE', URLError.PORT_OUT_OF_RANGE)
  }

  // https://url.spec.whatwg.org/#port-invalid
  static PORT_INVALID (msg = 'Invalid URL') {
    return new URLError(msg, 'PORT_INVALID', URLError.PORT_INVALID)
  }

  // https://url.spec.whatwg.org/#validation-error-domain-to-ascii
  static DOMAIN_TO_ASCII (msg = 'Invalid URL') {
    return new URLError(msg, 'DOMAIN_TO_ASCII', URLError.DOMAIN_TO_ASCII)
  }

  // https://url.spec.whatwg.org/#domain-invalid-code-point
  static DOMAIN_INVALID_CODE_POINT (msg = 'Invalid URL') {
    return new URLError(msg, 'DOMAIN_INVALID_CODE_POINT', URLError.DOMAIN_INVALID_CODE_POINT)
  }

  // https://url.spec.whatwg.org/#host-invalid-code-point
  static HOST_INVALID_CODE_POINT (msg = 'Invalid URL') {
    return new URLError(msg, 'HOST_INVALID_CODE_POINT', URLError.HOST_INVALID_CODE_POINT)
  }
}
