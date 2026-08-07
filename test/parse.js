const test = require('brittle')
const { URL, URLSearchParams } = require('..')

test('basic http: URL parse', (t) => {
  const url = new URL('http://user:pass@example.com:1234/foo/bar?baz#quux')

  t.comment(url)
  t.is(url.href, 'http://user:pass@example.com:1234/foo/bar?baz#quux')
  t.is(url.protocol, 'http:')
  t.is(url.username, 'user')
  t.is(url.password, 'pass')
  t.is(url.host, 'example.com:1234')
  t.is(url.hostname, 'example.com')
  t.is(url.port, '1234')
  t.is(url.pathname, '/foo/bar')
  t.is(url.search, '?baz')
  t.is(url.hash, '#quux')
  t.alike(url.searchParams, new URLSearchParams('baz'))
})

test('parse with base', (t) => {
  const url = new URL('/foo/bar', 'https://example.org')

  t.comment(url.href)
  t.is(url.href, 'https://example.org/foo/bar')
})

test('parse URL instance as input', (t) => {
  const url = new URL(new URL('https://example.org/foo'))

  t.comment(url.href)
  t.is(url.href, 'https://example.org/foo')
})

test('parse URL instance as base', (t) => {
  const url = new URL('/bar', new URL('https://example.org/foo'))

  t.comment(url.href)
  t.is(url.href, 'https://example.org/bar')
})

test('+ in query string', (t) => {
  const url = new URL('http://example.com/?foo=bar+baz')

  t.is(url.searchParams.get('foo'), 'bar baz')
})

test('ipv6 with trailing ::', (t) => {
  const url = new URL('http://[1:2:3:4:5:6:7::]/')

  t.comment(url.href)
  t.is(url.hostname, '[1:2:3:4:5:6:7:0]')
})

test('opaque path', (t) => {
  const url = new URL('mailto:foo@example.com')

  t.comment(url.href)
  t.is(url.protocol, 'mailto:')
  t.is(url.pathname, 'foo@example.com')
  t.is(url.host, '')
})

test('invalid URL', (t) => {
  try {
    new URL('not-a-valid-url')

    t.fail()
  } catch (err) {
    t.comment(err.message)
    t.is(err.code, 'INVALID_URL')
    t.is(err.input, 'not-a-valid-url')
  }
})

test('invalid base URL', (t) => {
  try {
    new URL('/foo/bar', 'not-a-valid-url')

    t.fail()
  } catch (err) {
    t.comment(err.message)
    t.is(err.code, 'INVALID_URL')
  }
})

test('no arguments', (t) => {
  try {
    new URL()

    t.fail()
  } catch (err) {
    t.comment(err.message)
    t.is(err.code, 'INVALID_URL')
  }
})

test('do not throw on invalid URL', (t) => {
  const url = new URL('not-a-valid-url', undefined, { throw: false })

  t.is(url.href, undefined)
})

test('http: URL host is lower-cased', (t) => {
  const url = new URL('https://KEET.io')

  t.comment(url.href)
  t.is(url.href, 'https://keet.io/')
  t.is(url.host, 'keet.io')
  t.is(url.hostname, 'keet.io')
})

test('http: URL host case folding leaves path untouched', (t) => {
  const url = new URL('HTTP://Example.COM/FOO/Bar')

  t.comment(url.href)
  t.is(url.protocol, 'http:')
  t.is(url.host, 'example.com')
  t.is(url.pathname, '/FOO/Bar')
})

test('non-special scheme host preserves case', (t) => {
  const url = new URL('scheme://KEET.io')

  t.comment(url.href)
  t.is(url.host, 'KEET.io')
  t.is(url.hostname, 'KEET.io')
})
