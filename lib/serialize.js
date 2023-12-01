// https://url.spec.whatwg.org/#url-serializing
module.exports = exports = function serialize (url, excludeFragment = false) {
  let output = url.scheme + ':'

  if (url.host !== null) {
    output += '//'

    if (url.username !== '' || url.password !== '') {
      output += url.username

      if (url.password !== '') {
        output += ':' + url.password
      }

      output += '@'
    }

    output += serializeHost(url.host)

    if (url.port !== null) {
      output += ':' + url.port.toString(10)
    }
  }

  if (
    url.host === null &&
    typeof url.path !== 'string' &&
    url.path.length > 1 &&
    url.path[0] === ''
  ) {
    output += '/.'
  }

  if (typeof url.path === 'string') {
    output += url.path
  } else {
    for (const segment of url.path) output += '/' + segment
  }

  if (url.query !== null) {
    output += '?' + url.query
  }

  if (url.fragment !== null && !excludeFragment) {
    output += '#' + url.fragment
  }

  return output
}

// https://url.spec.whatwg.org/#concept-host-serializer
const serializeHost = exports.host = function serializeHost (host) {
  if (typeof host === 'number') return serializeIPv4(host)

  return host
}

// https://url.spec.whatwg.org/#concept-ipv4-serializer
function serializeIPv4 (address) {
  let output = ''
  let n = address

  for (let i = 1; i <= 4; i++) {
    output = (n % 256).toString(10) + output

    if (i !== 4) output = '.' + output

    n = n / 256 | 0
  }

  return output
}
