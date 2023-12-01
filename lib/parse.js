const tr46 = require('tr46')
const constants = require('./constants')
const errors = require('./errors')
const infra = require('./infra')

// https://url.spec.whatwg.org/#url-parsing
module.exports = function parse (
  input,
  base = null,
  // https://url.spec.whatwg.org/#url-representation
  url = {
    scheme: '',
    username: '',
    password: '',
    host: null,
    port: null,
    path: [],
    query: null,
    fragment: null
  },
  stateOverride = 0
) {
  let state = stateOverride || constants.STATE_SCHEME_START
  let buffer = ''
  let atSignSeen = false
  let insideBrackets = false
  let passwordTokenSeen = false

  for (let pointer = 0; pointer <= input.length; pointer++) {
    const c = pointer < input.length ? input.charCodeAt(pointer) : -1

    switch (state) {
      // https://url.spec.whatwg.org/#scheme-start-state
      case constants.STATE_SCHEME_START:
        if (infra.isASCIIAlpha(c)) {
          buffer += String.fromCharCode(c).toLowerCase()
          state = constants.STATE_SCHEME
        } else if (!stateOverride) {
          state = constants.STATE_NO_SCHEME
          pointer--
        } else {
          throw errors.INVALID_URL()
        }
        break

      // https://url.spec.whatwg.org/#scheme-state
      case constants.STATE_SCHEME:
        if (infra.isASCIIAlphanumeric(c) || c === 0x2b || c === 0x2d || c === 0x2e) {
          buffer += String.fromCharCode(c).toLowerCase()
        } else if (c === 0x3a) {
          if (stateOverride) {
            if (isSpecialScheme(url.scheme) && !isSpecialScheme(buffer)) {
              return
            }

            if (!isSpecialScheme(url.scheme) && isSpecialScheme(buffer)) {
              return
            }

            if ((includesCredentials(url) || url.port !== null) && buffer === 'file') {
              return
            }

            if (url.scheme === 'file' && url.host === '') {
              return
            }
          }

          url.scheme = buffer

          if (stateOverride) {
            if (url.port === defaultPort(url.scheme)) {
              url.port = null
            }

            return
          }

          buffer = ''

          if (url.scheme === 'file') {
            state = constants.STATE_FILE
          } else if (isSpecial(url)) {
            if (base && base.scheme === url.scheme) {
              state = constants.STATE_SPECIAL_RELATIVE_OR_AUTHORITY
            } else {
              state = constants.STATE_SPECIAL_AUTHORITY_SLASHES
            }
          } else if (input.charCodeAt(pointer + 1) === 0x2f) {
            state = constants.STATE_PATH_OR_AUTHORITY
            pointer++
          } else {
            url.path = ''
            state = constants.STATE_OPAQUE_PATH
          }
        } else if (!stateOverride) {
          buffer = ''
          state = constants.STATE_NO_SCHEME
          pointer = -1
        } else {
          throw errors.INVALID_URL()
        }
        break

      // https://url.spec.whatwg.org/#no-scheme-state
      case constants.STATE_NO_SCHEME:
        if (base === null || (hasOpaquePath(base) && c !== 0x23)) {
          throw errors.MISSING_SCHEME_NON_RELATIVE_URL()
        }

        if (hasOpaquePath(base) && c === 0x23) {
          url.scheme = base.scheme
          url.path = base.path
          url.query = base.query
          url.fragment = ''
          state = constants.STATE_FRAGMENT
        } else if (base.sceheme !== 'file') {
          state = constants.STATE_RELATIVE
          pointer--
        } else {
          state = constants.STATE_FILE
          pointer++
        }
        break

      // https://url.spec.whatwg.org/#special-relative-or-authority-state
      case constants.STATE_SPECIAL_RELATIVE_OR_AUTHORITY:
        if (c === 0x2f && input.charCodeAt(pointer + 1) === 0x2f) {
          state = constants.STATE_SPECIAL_AUTHORITY_IGNORE_SLASHES
          pointer++
        } else {
          state = constants.STATE_RELATIVE
          pointer--
        }
        break

      // https://url.spec.whatwg.org/#path-or-authority-state
      case constants.STATE_PATH_OR_AUTHORITY:
        if (c === 0x2f) {
          state = constants.STATE_AUTHORITY
        } else {
          state = constants.STATE_PATH
          pointer--
        }
        break

      // https://url.spec.whatwg.org/#relative-state
      case constants.STATE_RELATIVE:
        url.scheme = base.scheme

        if (c === 0x2f) {
          state = constants.STATE_RELATIVE_SLASH
        } else if (isSpecial(url) && c === 0x5c) {
          state = constants.STATE_RELATIVE_SLASH
        } else {
          url.username = base.username
          url.password = base.password
          url.host = base.host
          url.port = base.port
          url.path = [...base.path]
          url.query = base.query

          if (c === 0x3f) {
            url.query = ''
            state = constants.STATE_QUERY
          } else if (c === 0x23) {
            url.fragment = ''
            state = constants.STATE_FRAGMENT
          } else if (c !== -1) {
            url.query = null
            shortenPath(url)
            state = constants.STATE_PATH
            pointer--
          }
        }
        break

      // https://url.spec.whatwg.org/#relative-slash-state
      case constants.STATE_RELATIVE_SLASH:
        if (isSpecial(url) && (c === 0x2f || c === 0x5c)) {
          state = constants.STATE_SPECIAL_AUTHORITY_IGNORE_SLASHES
        } else if (c === 0x2f) {
          state = constants.STATE_AUTHORITY
        } else {
          url.username = base.username
          url.password = base.password
          url.host = base.host
          url.port = base.port
          state = constants.STATE_PATH
          pointer--
        }
        break

      // https://url.spec.whatwg.org/#special-authority-slashes-state
      case constants.STATE_SPECIAL_AUTHORITY_SLASHES:
        if (c === 0x2f && input.charCodeAt(pointer + 1) === 0x2f) {
          state = constants.STATE_SPECIAL_AUTHORITY_IGNORE_SLASHES
          pointer++
        } else {
          state = constants.STATE_SPECIAL_AUTHORITY_IGNORE_SLASHES
          pointer--
        }
        break

      // https://url.spec.whatwg.org/#special-authority-ignore-slashes-state
      case constants.STATE_SPECIAL_AUTHORITY_IGNORE_SLASHES:
        if (c !== 0x2f && c !== 0x5c) {
          state = constants.STATE_AUTHORITY
          pointer--
        }
        break

      // https://url.spec.whatwg.org/#authority-state
      case constants.STATE_AUTHORITY:
        if (c === 0x40) {
          if (atSignSeen) buffer = '%40' + buffer

          atSignSeen = true

          for (let i = 0, n = buffer.length; i < n; i++) {
            const c = buffer.charCodeAt(i)

            if (c === 0x3a && !passwordTokenSeen) {
              passwordTokenSeen = true
              continue
            }

            const encodedCodePoints = UTF8PercentEncode(buffer[i], userinfoPercentEncodeSet)

            if (passwordTokenSeen) {
              url.password += encodedCodePoints
            } else {
              url.username += encodedCodePoints
            }
          }

          buffer = ''
        } else if (
          (c === -1 || c === 0x2f || c === 0x3f || c === 0x23) ||
          (isSpecial(url) && c === 0x5c)
        ) {
          if (atSignSeen && buffer === '') {
            throw errors.INVALID_CREDENTIALS()
          }

          pointer -= buffer.length + 1
          buffer = ''
          state = constants.STATE_HOST
        } else {
          buffer += String.fromCharCode(c)
        }
        break

      // https://url.spec.whatwg.org/#host-state
      // https://url.spec.whatwg.org/#hostname-state
      case constants.STATE_HOST:
      case constants.STATE_HOSTNAME:
        if (stateOverride && url.scheme === 'file') {
          pointer--
          state = constants.STATE_FILE_HOST
        } else if (c === 0x3a && !insideBrackets) {
          if (buffer === '') {
            throw errors.HOST_MISSING()
          }

          if (stateOverride === constants.STATE_HOSTNAME) return

          url.host = parseHost(buffer, !isSpecial(url))

          buffer = ''
          state = constants.STATE_PORT
        } else if (
          (c === -1 || c === 0x2f || c === 0x3f || c === 0x23) ||
          (isSpecial(url) && c === 0x5c)
        ) {
          pointer--

          if (isSpecial(url) && buffer === '') {
            throw errors.HOST_MISSING()
          }

          if (stateOverride && buffer === '' && (includesCredentials(url) || url.port !== null)) {
            return
          }

          url.host = parseHost(buffer, !isSpecial(url))

          buffer = ''
          state = constants.STATE_PATH_START

          if (stateOverride) return
        } else {
          if (c === 0x5b) insideBrackets = true
          else if (c === 0x5d) insideBrackets = false

          buffer += String.fromCharCode(c)
        }
        break

      // https://url.spec.whatwg.org/#port-state
      case constants.STATE_PORT:
        if (infra.isASCIIDigit(c)) {
          buffer += String.fromCharCode(c)
        } else if (
          (c === -1 || c === 0x2f || c === 0x3f || c === 0x23) ||
          (isSpecial(url) && c === 0x5c) ||
          stateOverride
        ) {
          if (buffer) {
            const port = parseInt(buffer, 10)

            if (port > 2 ** 16 - 1) {
              throw errors.PORT_OUT_OF_RANGE()
            }

            url.port = port === defaultPort(url.scheme) ? null : port

            buffer = ''
          }

          if (stateOverride) return

          state = constants.STATE_PATH_START
          pointer--
        } else {
          throw errors.PORT_INVALID()
        }
        break

      // https://url.spec.whatwg.org/#file-state
      case constants.STATE_FILE:
        url.scheme = 'file'
        url.host = ''

        if (c === 0x2f || c === 0x5c) {
          state = constants.STATE_FILE_SLASH
        } else if (base && base.scheme === 'file') {
          url.host = base.host
          url.path = [...base.path]
          url.query = base.query

          if (c === 0x3f) {
            url.query = ''
            state = constants.STATE_QUERY
          } else if (c === 0x23) {
            url.fragment = ''
            state = constants.STATE_FRAGMENT
          } else if (c !== -1) {
            url.query = null

            if (!startsWithWindowsDriveLetter(input.substring(pointer))) {
              shortenPath(url)
            } else {
              url.path = []
            }

            state = constants.STATE_PATH
            pointer--
          }
        } else {
          state = constants.STATE_PATH
          pointer--
        }
        break

      // https://url.spec.whatwg.org/#file-slash-state
      case constants.STATE_FILE_SLASH:
        if (c === 0x2f || c === 0x5c) {
          state = constants.STATE_FILE_HOST
        } else {
          if (base && base.scheme === 'file') {
            url.host = base.host

            if (!startsWithWindowsDriveLetter(input.substring(pointer)) && isNormalizedWindowsDriveLetter(base.path[0])) {
              url.path.push(base.path[0])
            }
          }

          state = constants.STATE_PATH
          pointer--
        }
        break

      // https://url.spec.whatwg.org/#file-host-state
      case constants.STATE_FILE_HOST:
        if (c === -1 || c === 0x2f || c === 0x5c || c === 0x3f || c === 0x23) {
          pointer--

          if (!stateOverride && isWindowsDriveLetter(buffer)) {
            state = constants.STATE_PATH
          } else if (buffer === '') {
            url.host = ''

            if (stateOverride) return

            state = constants.STATE_PATH_START
          } else {
            let host = parseHost(buffer, !isSpecial(url))
            if (host === 'localhost') host = ''

            url.host = host

            if (stateOverride) return

            buffer = ''
            state = constants.STATE_PATH_START
          }
        } else {
          buffer += String.fromCharCode(c)
        }
        break

      // https://url.spec.whatwg.org/#path-start-state
      case constants.STATE_PATH_START:
        if (isSpecial(url)) {
          state = constants.STATE_PATH

          if (c !== 0x2f && c !== 0x5c) pointer--
        } else if (!stateOverride && c === 0x3f) {
          url.query = ''
          state = constants.STATE_QUERY
        } else if (!stateOverride && c === 0x23) {
          url.fragment = ''
          state = constants.STATE_FRAGMENT
        } else if (c !== -1) {
          state = constants.STATE_PATH

          if (c !== 0x2f) pointer--
        } else if (stateOverride && url.host === null) {
          url.path.push('')
        }
        break

      // https://url.spec.whatwg.org/#path-state
      case constants.STATE_PATH:
        if (
          (c === -1 || c === 0x2f) ||
          (isSpecial(url) && c === 0x5c) ||
          (!stateOverride && (c === 0x3f || c === 0x23))
        ) {
          if (isDoubleDotPathSegment(buffer)) {
            shortenPath(url)

            if (c !== 0x2f && !isSpecial(url) && c === 0x5c) {
              url.path.push('')
            }
          } else if (isSingleDotPathSegment(buffer)) {
            if (c !== 0x2f && !isSpecial(url) && c === 0x5c) {
              url.path.push('')
            }
          } else {
            if (url.scheme === 'file' && url.path.length === 0 && isWindowsDriveLetter(buffer)) {
              buffer[1] = ':'
            }

            url.path.push(buffer)
          }

          buffer = ''

          if (c === 0x3f) {
            url.query = ''
            state = constants.STATE_QUERY
          } else if (c === 0x23) {
            url.fragment = ''
            state = constants.STATE_FRAGMENT
          }
        } else {
          buffer += UTF8PercentEncode(String.fromCharCode(c), pathPercentEncodeSet)
        }
        break

      // https://url.spec.whatwg.org/#cannot-be-a-base-url-path-state
      case constants.STATE_OPAQUE_PATH:
        if (c === 0x3f) {
          url.query = ''
          state = constants.STATE_QUERY
        } else if (c === 0x23) {
          url.fragment = ''
          state = constants.STATE_FRAGMENT
        } else {
          if (c !== -1) {
            url.path += UTF8PercentEncode(String.fromCharCode(c), c0ControlPercentEncodeSet)
          }
        }
        break

      // https://url.spec.whatwg.org/#query-state
      case constants.STATE_QUERY:
        if ((!stateOverride && c === 0x23) || c === -1) {
          const percentEncodeSet = isSpecial(url) ? specialQueryPercentEncodeSet : queryPercentEncodeSet

          url.query += UTF8PercentEncode(buffer, percentEncodeSet)
          buffer = ''

          if (c === 0x23) {
            url.fragment = ''
            state = constants.STATE_FRAGMENT
          }
        } else if (c !== -1) {
          buffer += String.fromCharCode(c)
        }
        break

      // https://url.spec.whatwg.org/#fragment-state
      case constants.STATE_FRAGMENT:
        if (c !== -1) {
          url.fragment += UTF8PercentEncode(String.fromCharCode(c), fragmentPercentEncodeSet)
        }
    }
  }

  return url
}

// https://url.spec.whatwg.org/#concept-host-parser
function parseHost (input, isOpaque = false) {
  if (input.charCodeAt(0) === 0x5b) {
    if (input.charCodeAt(input.length - 1) !== 0x5d) throw errors.IPV6_UNCLOSED()

    return parseIPv6(input.substring(1, input.length - 1))
  }

  if (isOpaque) return parseOpaqueHost(input)

  const domain = percentDecode(Buffer.from(input, 'utf8'))

  const asciiDomain = domainToASCII(domain.toString('utf8'), false)

  for (const codePoint of asciiDomain) {
    if (isForbiddenDomainCodePoint(codePoint.codePointAt(0))) {
      throw errors.DOMAIN_INVALID_CODE_POINT()
    }
  }

  if (endsInANumber(asciiDomain)) return parseIPv4(asciiDomain)

  return asciiDomain
}

// https://url.spec.whatwg.org/#ends-in-a-number-checker
function endsInANumber (input) {
  const parts = input.split('.')

  const last = parts[parts.length - 1]

  if (last === '') {
    if (parts.length === 1) return false
    parts.pop()
  }

  try {
    parseIPv4Number(last)

    return true
  } catch {
    return false
  }
}

// https://url.spec.whatwg.org/#concept-ipv4-parser
function parseIPv4 (input) {
  const parts = input.split('.')

  if (parts[parts.length - 1] === '') {
    if (parts.length > 1) parts.pop()
  }

  if (parts.length > 4) throw errors.IPV4_TOO_MANY_PARTS()

  const numbers = []

  for (const part of parts) {
    numbers.push(parseIPv4Number(part))
  }

  for (let i = 0, n = numbers.length - 1; i < n; i++) {
    if (numbers[i] > 255) {
      throw errors.IPV4_OUT_OF_RANGE_PART()
    }
  }

  if (numbers[numbers.length - 1] > 256 ** (5 - numbers.length)) {
    throw errors.IPV4_OUT_OF_RANGE_PART()
  }

  let ipv4 = numbers.pop()
  let counter = 0

  for (const n of numbers) ipv4 += n * 256 ** (3 - counter++)

  return ipv4
}

// https://url.spec.whatwg.org/#ipv4-number-parser
function parseIPv4Number (input) {
  if (input === '') throw errors.IPV4_NON_NUMERIC_PART()

  input = input.toLowerCase()

  let R = 10

  if (input.length >= 2) {
    if (input[0] === '0') {
      if (input[1] === 'x') {
        input.substring(2)
        R = 16
      } else {
        input.substring(1)
        R = 8
      }
    }
  }

  if (input === '') return 0

  const n = parseInt(input, R)

  if (n.toString(R) !== input) throw errors.IPV4_NON_NUMERIC_PART()

  return n
}

// https://url.spec.whatwg.org/#concept-ipv6-parser
function parseIPv6 (input) {
  const address = [0, 0, 0, 0, 0, 0, 0, 0]
  let pieceIndex = 0
  let compress = null
  let pointer = 0

  if (input.charCodeAt(pointer) === 0x3a) {
    if (input.charCodeAt(pointer + 1) !== 0x3a) {
      throw errors.IPV6_INVALID_COMPRESSION()
    }

    pointer += 2
    compress = ++pieceIndex
  }

  while (pointer < input.length) {
    if (pieceIndex === 8) throw errors.IPV6_TOO_MANY_PIECES()

    if (input.charCodeAt(pointer) === 0x3a) {
      if (compress !== null) throw errors.IPV6_MULTIPLE_COMPRESSION()

      pointer++
      compress = ++pieceIndex
      continue
    }

    let value = 0
    let length = 0

    while (length < 4 && infra.isASCIIHexDigit(input.charCodeAt(pointer))) {
      value = value * 0x10 + parseInt(input[pointer], 16)

      pointer++
      length++
    }

    if (input.charCodeAt(pointer) === 0x2e) {
      if (length === 0) throw errors.IPV4_IN_IPV6_INVALID_CODE_POINT()

      pointer -= length

      if (pieceIndex > 6) throw errors.IPV4_IN_IPV6_TOO_MANY_PIECES()

      let numbersSeen = 0

      while (pointer < input.length) {
        let ipv4Piece = null

        if (numbersSeen > 0) {
          if (input.charCodeAt(pointer) === 0x2e && numbersSeen < 4) {
            pointer++
          } else {
            throw errors.IPV4_IN_IPV6_INVALID_CODE_POINT()
          }
        }

        if (!infra.isASCIIDigit(input.charCodeAt(pointer))) {
          throw errors.IPV4_IN_IPV6_INVALID_CODE_POINT()
        }

        while (infra.isASCIIDigit(input.charCodeAt(pointer))) {
          const number = parseInt(input[pointer], 10)

          if (ipv4Piece === null) {
            ipv4Piece = number
          } else if (ipv4Piece === 0) {
            throw errors.IPV4_IN_IPV6_INVALID_CODE_POINT()
          } else {
            ipv4Piece = ipv4Piece * 10 + number
          }

          if (ipv4Piece > 255) throw errors.IPV4_IN_IPV6_OUT_OF_RANGE_PART()

          pointer++
        }

        address[pieceIndex] = address[pieceIndex] * 0x100 + ipv4Piece

        numbersSeen++

        if (numbersSeen === 2 || numbersSeen === 4) pieceIndex++
      }

      if (numbersSeen !== 4) throw errors.IPV4_IN_IPV6_TOO_FEW_PARTS()

      break
    }

    if (input.charCodeAt(pointer) === 0x3a) {
      pointer++

      if (pointer === input.length) {
        throw errors.IPV6_INVALID_CODE_POINT()
      }
    } else if (pointer !== input.length) {
      throw errors.IPV6_INVALID_CODE_POINT()
    }

    address[pieceIndex++] = value
  }

  if (compress !== null) {
    let swaps = pieceIndex - compress

    pieceIndex = 7

    while (pieceIndex !== 0 && swaps > 0) {
      [address[pieceIndex], address[compress + swaps - 1]] = [address[compress + swaps - 1], address[pieceIndex]]

      pieceIndex--
      swaps--
    }
  } else if (pieceIndex !== 8) {
    throw errors.IPV6_TOO_FEW_PIECES()
  }

  return address
}

// https://url.spec.whatwg.org/#concept-opaque-host-parser
function parseOpaqueHost (input) {
  const bytes = Buffer.from(input, 'utf8')

  if (bytes.some(isForbiddenHostCodePoint)) throw errors.HOST_INVALID_CODE_POINT()

  return percentEncodeAfterEncoding(bytes, c0ControlPercentEncodeSet)
}

// https://url.spec.whatwg.org/#special-scheme
function isSpecialScheme (scheme) {
  switch (scheme) {
    case 'ftp':
    case 'file':
    case 'http':
    case 'https':
    case 'ws':
    case 'wss':
      return true
    default:
      return false
  }
}

// https://url.spec.whatwg.org/#default-port
function defaultPort (scheme) {
  switch (scheme) {
    case 'ftp': return 21
    case 'file': return null
    case 'http': return 80
    case 'https': return 443
    case 'ws': return 80
    case 'wss': return 443
    default: return null
  }
}

// https://url.spec.whatwg.org/#is-special
function isSpecial (url) {
  return isSpecialScheme(url.scheme)
}

// https://url.spec.whatwg.org/#include-credentials
function includesCredentials (url) {
  return url.username !== '' && url.password !== ''
}

// https://url.spec.whatwg.org/#url-opaque-path
function hasOpaquePath (url) {
  return typeof url.path === 'string'
}

// https://url.spec.whatwg.org/#windows-drive-letter
function isWindowsDriveLetter (input) {
  return input.length >= 2 && infra.isASCIIAlpha(input.charCodeAt(0)) && (
    input.charCodeAt(1) === 0x3a ||
    input.charCodeAt(1) === 0x7c
  )
}

// https://url.spec.whatwg.org/#normalized-windows-drive-letter
function isNormalizedWindowsDriveLetter (input) {
  return input.length >= 2 && infra.isASCIIAlpha(input.charCodeAt(0)) && input.charCodeAt(1) === 0x3a
}

// https://url.spec.whatwg.org/#start-with-a-windows-drive-letter
function startsWithWindowsDriveLetter (input) {
  return input.length >= 2 && isWindowsDriveLetter(input) && (
    input.length === 2 ||
    input.charCodeAt(2) === 0x2f ||
    input.charCodeAt(2) === 0x5c ||
    input.charCodeAt(2) === 0x3f ||
    input.charCodeAt(2) === 0x23
  )
}

// https://url.spec.whatwg.org/#shorten-a-urls-path
function shortenPath (url) {
  const path = url.path

  if (url.scheme === 'file' && path.length === 1 && isNormalizedWindowsDriveLetter(path[0])) {
    return
  }

  path.pop()
}

// https://url.spec.whatwg.org/#single-dot-path-segment
function isSingleDotPathSegment (segment) {
  return segment === '.' || decodeURIComponent(segment) === '.'
}

// https://url.spec.whatwg.org/#double-dot-path-segment
function isDoubleDotPathSegment (segment) {
  return segment === '..' || decodeURIComponent(segment) === '..'
}

// https://url.spec.whatwg.org/#forbidden-host-code-point
function isForbiddenHostCodePoint (c) {
  return c === 0x0 || c === 0x9 || c === 0xa || c === 0xd || c === 0x20 || c === 0x23 || c === 0x2f || c === 0x3a || c === 0x3c || c === 0x3e || c === 0x3f || c === 0x40 || c === 0x5b || c === 0x5c || c === 0x5d || c === 0x5e || c === 0x7c
}

// https://url.spec.whatwg.org/#forbidden-domain-code-point
function isForbiddenDomainCodePoint (c) {
  return isForbiddenHostCodePoint(c) || c <= 0x1f || c === 0x25 || c === 0x7f
}

// https://url.spec.whatwg.org/#concept-domain-to-ascii
function domainToASCII (domain, beStrict) {
  const result = tr46.toASCII(domain, {
    checkHyphens: false,
    checkBidi: true,
    checkJoiners: true,
    useSTD3ASCIIRules: beStrict,
    verifyDNSLength: beStrict
  })

  if (result === null || result === '') throw errors.DOMAIN_TO_ASCII()

  return result
}

// https://url.spec.whatwg.org/#percent-encode
function percentEncode (byte) {
  return `%${byte.toString(16).toUpperCase().padStart(2, '0')}`
}

// https://url.spec.whatwg.org/#string-percent-encode-after-encoding
function percentEncodeAfterEncoding (bytes, percentEncodeSet) {
  let output = ''

  for (const byte of bytes) {
    if (percentEncodeSet(byte)) {
      output += percentEncode(byte)
    } else {
      output += String.fromCharCode(byte)
    }
  }

  return output
}

// https://url.spec.whatwg.org/#percent-decode
function percentDecode (input) {
  const output = Buffer.alloc(input.byteLength)
  let outputIndex = 0

  for (let i = 0, n = input.byteLength; i < n; i++) {
    const byte = input[i]

    if (byte !== 0x25) {
      output[outputIndex++] = byte
    } else if (byte === 0x25 && (!infra.isASCIIHexDigit(input[i + 1]) || !infra.isASCIIHexDigit(input[i + 2]))) {
      output[outputIndex++] = byte
    } else {
      const bytePoint = parseInt(String.fromCodePoint(input[i + 1], input[i + 2]), 16)
      output[outputIndex++] = bytePoint
      i += 2
    }
  }

  return output.subarray(0, outputIndex)
}

// https://url.spec.whatwg.org/#string-utf-8-percent-encode
function UTF8PercentEncode (input, percentEncodeSet) {
  return percentEncodeAfterEncoding(Buffer.from(input, 'utf8'), percentEncodeSet)
}

// https://url.spec.whatwg.org/#c0-control-percent-encode-set
function c0ControlPercentEncodeSet (c) {
  return c <= 0x1f || c > 0x7e
}

// https://url.spec.whatwg.org/#fragment-percent-encode-set
function fragmentPercentEncodeSet (c) {
  return c0ControlPercentEncodeSet(c) || c === 0x20 || c === 0x22 || c === 0x3c || c === 0x3e || c === 0x60
}

// https://url.spec.whatwg.org/#query-percent-encode-set
function queryPercentEncodeSet (c) {
  return c0ControlPercentEncodeSet(c) || c === 0x20 || c === 0x22 || c === 0x23 || c === 0x3c || c === 0x3e
}

// https://url.spec.whatwg.org/#special-query-percent-encode-set
function specialQueryPercentEncodeSet (c) {
  return queryPercentEncodeSet(c) || c === 0x27
}

// https://url.spec.whatwg.org/#path-percent-encode-set
function pathPercentEncodeSet (c) {
  return queryPercentEncodeSet(c) || c === 0x3f || c === 0x60 || c === 0x7b || c === 0x7d
}

// https://url.spec.whatwg.org/#userinfo-percent-encode-set
function userinfoPercentEncodeSet (c) {
  return pathPercentEncodeSet(c) || c === 0x2f || c === 0x3a || c === 0x3b || c === 0x3d || c === 0x40 || c === 0x5b || c === 0x5c || c === 0x5d || c === 0x5e || c === 0x7c
}
