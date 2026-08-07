const test = require('brittle')
const { URL, URLSearchParams } = require('..')

test('set http: URL protocol', (t) => {
  const url = new URL('http://example.com')

  url.protocol = 'https:'

  t.comment(url.href)
  t.is(url.protocol, 'https:')
})

test('set http: URL username', (t) => {
  const url = new URL('http://example.com')

  url.username = 'username'

  t.comment(url.href)
  t.is(url.username, 'username')
})

test('set http: URL username, has username', (t) => {
  const url = new URL('http://user@example.com')

  url.username = 'username'

  t.comment(url.href)
  t.is(url.username, 'username')
})

test('set http: URL username, has username and password', (t) => {
  const url = new URL('http://user:pass@example.com')

  url.username = 'username'

  t.comment(url.href)
  t.is(url.username, 'username')
})

test('set http: URL username, cannot have credentials', (t) => {
  const url = new URL('file:///foo')

  url.username = 'username'

  t.comment(url.href)
  t.is(url.username, '')
})

test('set http: URL password', (t) => {
  const url = new URL('http://example.com')

  url.password = 'password'

  t.comment(url.href)
  t.is(url.password, 'password')
})

test('set http: URL password, has username', (t) => {
  const url = new URL('http://user@example.com')

  url.password = 'password'

  t.comment(url.href)
  t.is(url.password, 'password')
})

test('set http: URL password, has password', (t) => {
  const url = new URL('http://:pass@example.com')

  url.password = 'password'

  t.comment(url.href)
  t.is(url.password, 'password')
})

test('set http: URL password, has username and password', (t) => {
  const url = new URL('http://user:pass@example.com')

  url.password = 'password'

  t.comment(url.href)
  t.is(url.password, 'password')
})

test('set http: URL password, cannot have credentials', (t) => {
  const url = new URL('file:///foo')

  url.password = 'password'

  t.comment(url.href)
  t.is(url.password, '')
})

test('set http: URL host without port', (t) => {
  const url = new URL('http://example.com')

  url.host = 'example.org'

  t.comment(url.href)
  t.is(url.host, 'example.org')
})

test('set http: URL host with port', (t) => {
  const url = new URL('http://example.com')

  url.host = 'example.org:1234'

  t.comment(url.href)
  t.is(url.host, 'example.org:1234')
})

test('set http: URL host without port, has port', (t) => {
  const url = new URL('http://example.com:1234')

  url.host = 'example.org'

  t.comment(url.href)
  t.is(url.host, 'example.org:1234')
})

test('set http: URL host with port, has port', (t) => {
  const url = new URL('http://example.com:1234')

  url.host = 'example.org:5678'

  t.comment(url.href)
  t.is(url.host, 'example.org:5678')
})

test('set http: URL host, opaque path', (t) => {
  const url = new URL('mailto:foo@example.com')

  url.host = 'example.org'

  t.comment(url.href)
  t.is(url.host, '')
})

test('set http: URL hostname', (t) => {
  const url = new URL('http://example.com')

  url.hostname = 'example.org'

  t.comment(url.href)
  t.is(url.hostname, 'example.org')
})

test('set http: URL hostname, opaque path', (t) => {
  const url = new URL('mailto:foo@example.com')

  url.hostname = 'example.org'

  t.comment(url.href)
  t.is(url.hostname, '')
})

test('set http: URL port', (t) => {
  const url = new URL('http://example.com')

  url.port = '1234'

  t.comment(url.href)
  t.is(url.port, '1234')
})

test('set http: URL port, has port', (t) => {
  const url = new URL('http://example.com:1234')

  url.port = '5678'

  t.comment(url.href)
  t.is(url.port, '5678')
})

test('set http: URL port, empty', (t) => {
  const url = new URL('http://example.com:1234')

  url.port = ''

  t.comment(url.href)
  t.is(url.port, '')
})

test('set http: URL port, cannot have port', (t) => {
  const url = new URL('file:///foo')

  url.port = '1234'

  t.comment(url.href)
  t.is(url.port, '')
})

test('set http: URL path', (t) => {
  const url = new URL('http://example.com')

  url.pathname = '/foo/bar'

  t.comment(url.href)
  t.is(url.pathname, '/foo/bar')
})

test('set http: URL path, has path', (t) => {
  const url = new URL('http://example.com/foo/bar')

  url.pathname = '/baz/quux'

  t.comment(url.href)
  t.is(url.pathname, '/baz/quux')
})

test('set http: URL path, no leading /', (t) => {
  const url = new URL('http://example.com/foo/bar')

  url.pathname = 'baz/quux'

  t.comment(url.href)
  t.is(url.pathname, '/baz/quux')
})

test('set http: URL path, empty', (t) => {
  const url = new URL('http://example.com/foo/bar')

  url.pathname = ''

  t.comment(url.href)
  t.is(url.pathname, '/')
})

test('set http: URL path, opaque path', (t) => {
  const url = new URL('mailto:foo@example.com')

  url.pathname = '/foo/bar'

  t.comment(url.href)
  t.is(url.pathname, 'foo@example.com')
})

test('set file: URL path', (t) => {
  const url = new URL('file:///')

  url.pathname = '/foo/bar'

  t.comment(url.href)
  t.is(url.pathname, '/foo/bar')
})

test('set file: URL path, empty', (t) => {
  const url = new URL('file:///foo/bar')

  url.pathname = ''

  t.comment(url.href)
  t.is(url.pathname, '/')
})

test('set http: URL search', (t) => {
  const url = new URL('http://example.com')

  url.search = '?foo'

  t.comment(url.href)
  t.is(url.search, '?foo')
  t.alike(url.searchParams, new URLSearchParams('foo'))
})

test('set http: URL search, no leading ?', (t) => {
  const url = new URL('http://example.com')

  url.search = 'foo'

  t.comment(url.href)
  t.is(url.search, '?foo')
  t.alike(url.searchParams, new URLSearchParams('foo'))
})

test('set http: URL search, has search', (t) => {
  const url = new URL('http://example.com/?foo')

  url.search = '?bar'

  t.comment(url.href)
  t.is(url.search, '?bar')
  t.alike(url.searchParams, new URLSearchParams('bar'))
})

test('set http: URL search, has hash', (t) => {
  const url = new URL('http://example.com/#foo')

  url.search = '?bar'

  t.comment(url.href)
  t.is(url.search, '?bar')
  t.alike(url.searchParams, new URLSearchParams('bar'))
})

test('set http: URL search, has search and hash', (t) => {
  const url = new URL('http://example.com/?foo#bar')

  url.search = '?baz'

  t.comment(url.href)
  t.is(url.search, '?baz')
  t.alike(url.searchParams, new URLSearchParams('baz'))
})

test('set http: URL search, empty', (t) => {
  const url = new URL('http://example.com/?foo')

  url.search = ''

  t.comment(url.href)
  t.is(url.search, '')
  t.alike(url.searchParams, new URLSearchParams())
})

test('set http: URL hash', (t) => {
  const url = new URL('http://example.com')

  url.hash = '#foo'

  t.comment(url.href)
  t.is(url.hash, '#foo')
})

test('set http: URL hash, no leading #', (t) => {
  const url = new URL('http://example.com')

  url.hash = 'foo'

  t.comment(url.href)
  t.is(url.hash, '#foo')
})

test('set http: URL hash, has hash', (t) => {
  const url = new URL('http://example.com/#foo')

  url.hash = '#bar'

  t.comment(url.href)
  t.is(url.hash, '#bar')
})

test('set http: URL hash, empty', (t) => {
  const url = new URL('http://example.com/#foo')

  url.hash = ''

  t.comment(url.href)
  t.is(url.hash, '')
})

test('set http: URL href', (t) => {
  const url = new URL('http://example.com/?foo#bar')

  url.href = 'https://example.org/baz?quux#corge'

  t.comment(url.href)
  t.is(url.href, 'https://example.org/baz?quux#corge')
  t.alike(url.searchParams, new URLSearchParams('quux'))
})
