// https://url.spec.whatwg.org/#url-serializing
module.exports = function serialize (url, excludeFragment = false) {
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

    output += url.host

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
