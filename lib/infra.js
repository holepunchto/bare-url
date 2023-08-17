// https://infra.spec.whatwg.org/#ascii-digit
exports.isASCIIDigit = function isASCIIDigit (c) {
  return c >= 0x30 && c <= 0x39
}

// https://infra.spec.whatwg.org/#ascii-upper-hex-digit
exports.isASCIIUpperHexDigit = function isASCIIUpperHexDigit (c) {
  return exports.isASCIIDigit(c) || (c >= 0x41 && c <= 0x46)
}

// https://infra.spec.whatwg.org/#ascii-lower-hex-digit
exports.isASCIILowerHexDigit = function isASCIILowerHexDigit (c) {
  return exports.isASCIIDigit(c) || (c >= 0x61 && c <= 0x66)
}

// https://infra.spec.whatwg.org/#ascii-hex-digit
exports.isASCIIHexDigit = function isASCIIHexDigit (c) {
  return exports.isASCIIDigit(c) || (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66)
}

// https://infra.spec.whatwg.org/#ascii-upper-alpha
exports.isASCIIUpperAlpha = function isASCIIUpperAlpha (c) {
  return c >= 0x41 && c <= 0x5a
}

// https://infra.spec.whatwg.org/#ascii-lower-alpha
exports.isASCIILowerAlpha = function isASCIILowerAlpha (c) {
  return c >= 0x61 && c <= 0x7a
}

// https://infra.spec.whatwg.org/#ascii-alpha
exports.isASCIIAlpha = function isASCIIAlpha (c) {
  return exports.isASCIIUpperAlpha(c) || exports.isASCIILowerAlpha(c)
}

// https://infra.spec.whatwg.org/#ascii-alphanumeric
exports.isASCIIAlphanumeric = function isASCIIAlphanumeric (c) {
  return exports.isASCIIDigit(c) || exports.isASCIIAlpha(c)
}
