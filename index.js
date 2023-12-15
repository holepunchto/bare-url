const path = require('bare-path')
const os = require('bare-os')
const safetyCatch = require('safety-catch')
const binding = require('./binding')
const errors = require('./lib/errors')

const URL = exports.URL = class URL {
  constructor (href, base) {
    if (typeof href !== 'string') throw errors.INVALID_URL()

    if (typeof base === 'string') {
      try {
        base = new URL(base)
      } catch (err) {
        err.message = 'Invalid base URL'
        throw err
      }
    }

    this._parse(href, base)
  }

  // https://url.spec.whatwg.org/#dom-url-href

  get href () {
    return this._href
  }

  set href (value) {
    this._update(value)
  }

  // https://url.spec.whatwg.org/#dom-url-protocol

  get protocol () {
    return this._slice(0, this._components[0]) + ':'
  }

  set protocol (value) {
    this._update(this._replace(value.replace(/:+$/, ''), 0, this._components[0]))
  }

  // https://url.spec.whatwg.org/#dom-url-username

  get username () {
    return this._slice(this._components[0] + 3 /* :// */, this._components[1])
  }

  set username (value) {
    if (cannotHaveCredentialsOrPort(this)) {
      return
    }

    if (this.username === '') value += '@'

    this._update(this._replace(value, this._components[0] + 3 /* :// */, this._components[1]))
  }

  // https://url.spec.whatwg.org/#dom-url-password

  get password () {
    return this._href.slice(this._components[1] + 1 /* : */, this._components[2] - 1 /* @ */)
  }

  set password (value) {
    if (cannotHaveCredentialsOrPort(this)) {
      return
    }

    let start = this._components[1] + 1 /* : */
    let end = this._components[2] - 1 /* @ */

    if (this.password === '') {
      value = ':' + value
      start--
    }

    if (this.username === '') {
      value += '@'
      end++
    }

    this._update(this._replace(value, start, end))
  }

  // https://url.spec.whatwg.org/#dom-url-host

  get host () {
    return this._slice(this._components[2], this._components[5])
  }

  set host (value) {
  }

  // https://url.spec.whatwg.org/#dom-url-hostname

  get hostname () {
    return this._slice(this._components[2], this._components[3])
  }

  set hostname (value) {
  }

  // https://url.spec.whatwg.org/#dom-url-port

  get port () {
    return this._slice(this._components[3] + 1 /* : */, this._components[5])
  }

  set port (value) {
  }

  // https://url.spec.whatwg.org/#dom-url-pathname

  get pathname () {
    return this._slice(this._components[5], this._components[6] - 1 /* ? */)
  }

  set pathname (value) {
    if (this._flags & binding.constants.HAS_OPAQUE_PATH) return

    if (value[0] !== '/' && value[0] !== '\\') {
      value = '/' + value
    }

    this._update(this._replace(value, this._components[5], this._components[6] - 1 /* ? */))
  }

  // https://url.spec.whatwg.org/#dom-url-search

  get search () {
    return this._slice(this._components[6] - 1 /* ? */, this._components[7] - 1 /* # */)
  }

  set search (value) {
  }

  // https://url.spec.whatwg.org/#dom-url-hash

  get hash () {
    return this._slice(this._components[7] - 1 /* # */)
  }

  set hash (value) {
  }

  [Symbol.for('bare.inspect')] () {
    return {
      __proto__: { constructor: URL },

      href: this.href,
      protocol: this.protocol,
      username: this.username,
      password: this.password,
      host: this.host,
      hostname: this.hostname,
      port: this.port,
      pathname: this.pathname,
      search: this.search,
      hash: this.hash
    }
  }

  _slice (start, end) {
    return this._href.slice(start, end)
  }

  _replace (replacement, start, end) {
    return this._slice(0, start) + replacement + this._slice(end)
  }

  _parse (href, base) {
    try {
      const result = binding.parse(href, base ? base._handle : null)

      this._handle = result.handle
      this._flags = result.flags
      this._type = result.type
      this._href = result.href
      this._components = result.components
    } catch (err) {
      safetyCatch(err)

      throw errors.INVALID_URL()
    }
  }

  _update (href) {
    try {
      this._parse(href, null)
    } catch (err) {
      safetyCatch(err)
    }
  }
}

// https://url.spec.whatwg.org/#cannot-have-a-username-password-port
function cannotHaveCredentialsOrPort (url) {
  return url.hostname === '' || url.protocol === 'file:'
}

exports.fileURLToPath = function fileURLToPath (url) {
  if (typeof url === 'string') {
    url = new URL(url)
  }

  if (url.protocol !== 'file:') {
    throw errors.INVALID_URL_SCHEME('The URL must use the file: protocol')
  }

  const pathname = path.normalize(decodeURIComponent(url.pathname))

  if (os.platform() === 'win32') {
    if (url.hostname) return '\\\\' + url.hostname + pathname

    return pathname.slice(1)
  }

  return pathname
}

exports.pathToFileURL = function pathToFileURL (pathname) {
  let resolved = path.resolve(pathname)

  if (pathname[pathname.length - 1] === '/') {
    resolved += '/'
  } else if (os.platform() === 'win32' && pathname[pathname.length - 1 === '\\']) {
    resolved += '\\'
  }

  resolved = resolved
    .replaceAll('%', '%25') // Must be first
    .replaceAll('#', '%23')
    .replaceAll('?', '%3f')
    .replaceAll('\n', '%0a')
    .replaceAll('\r', '%0d')
    .replaceAll('\t', '%09')

  if (os.platform() !== 'win32') {
    resolved = resolved.replaceAll('\\', '%5c')
  }

  return new URL('file:' + resolved)
}
