const path = require('bare-path')
const os = require('bare-os')
const constants = require('./lib/constants')
const errors = require('./lib/errors')
const parse = require('./lib/parse')
const serialize = require('./lib/serialize')

const URL = exports.URL = class URL {
  constructor (href, base) {
    if (typeof base === 'string') {
      try {
        base = new URL(base)
      } catch (err) {
        err.message = 'Invalid base URL'
        throw err
      }
    }

    this._url = parse(href, base ? base._url : null)
  }

  // https://url.spec.whatwg.org/#dom-url-href

  get href () {
    return serialize(this._url)
  }

  set href (value) {
    this._url = parse(value)
  }

  // https://url.spec.whatwg.org/#dom-url-protocol

  get protocol () {
    return `${this._url.scheme}:`
  }

  set protocol (value) {
    parse(`${value}:`, null, this._url, constants.STATE_SCHEME_START)
  }

  // https://url.spec.whatwg.org/#dom-url-username

  get username () {
    return this._url.username
  }

  set username (value) {
    if (this._url.host === null || this._url.host === '' || this._url.scheme === 'file') {
      return
    }

    this._url.username = encodeURIComponent(value)
  }

  // https://url.spec.whatwg.org/#dom-url-password

  get password () {
    return this._url.password
  }

  set password (value) {
    if (this._url.host === null || this._url.host === '' || this._url.scheme === 'file') {
      return
    }

    this._url.password = encodeURIComponent(value)
  }

  // https://url.spec.whatwg.org/#dom-url-host

  get host () {
    if (this._url.host === null) return ''
    if (this._url.port === null) return this._url.host

    return `${this._url.host}:${this._url.port}`
  }

  set host (value) {
    if (typeof this._url.path === 'string') return

    parse(value, null, this._url, constants.STATE_HOST)
  }

  // https://url.spec.whatwg.org/#dom-url-hostname

  get hostname () {
    if (this._url.host === null) return ''

    return this._url.host
  }

  set hostname (value) {
    if (typeof this._url.path === 'string') return

    parse(value, null, this._url, constants.STATE_HOSTNAME)
  }

  // https://url.spec.whatwg.org/#dom-url-port

  get port () {
    if (this._url.port === null) return ''

    return `${this._url.port}`
  }

  set port (value) {
    if (this._url.host === null || this._url.host === '' || this._url.scheme === 'file') {
      return
    }

    if (value === '') {
      this._url.port = null
    } else {
      parse(value, null, this._url, constants.STATE_PORT)
    }
  }

  // https://url.spec.whatwg.org/#dom-url-pathname

  get pathname () {
    if (typeof this._url.path === 'string') return this._url.path

    let output = ''

    for (const segment of this._url.path) output += `/${segment}`

    return output
  }

  set pathname (value) {
    if (typeof this._url.path === 'string') return

    this._url.path = []

    parse(value, null, this._url, constants.STATE_PATH_START)
  }

  // https://url.spec.whatwg.org/#dom-url-search

  get search () {
    if (this._url.query === null || this._url.query === '') return ''

    return `?${this._url.query}`
  }

  set search (value) {
    if (value === '') {
      this._url.query = null

      return
    }

    if (value.charCodeAt(0) === 0x3f) {
      value = value.substring(1)
    }

    this._url.query = ''

    parse(value, null, this._url, constants.STATE_QUERY)
  }

  // https://url.spec.whatwg.org/#dom-url-hash

  get hash () {
    if (this._url.fragment === null || this._url.fragment === '') return ''

    return `#${this._url.fragment}`
  }

  set hash (value) {
    if (value === '') {
      this._url.fragment = null

      return
    }

    if (value.charCodeAt(0) === 0x23) {
      value = value.substring(1)
    }

    this._url.fragment = ''

    parse(value, null, this._url, constants.STATE_FRAGMENT)
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
    if (url.hostname) return `\\\\${url.hostname}${pathname}`

    return pathname.slice(1)
  }

  return pathname
}
