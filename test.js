/* global Bare */
const test = require('brittle')
const url = require('.')
const URL = url.URL

const isWindows = Bare.platform === 'win32'

test('basic http: URL parse', (t) => {
  const url = new URL('http://user:pass@example.com:1234/foo/bar?baz#quux')

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
})

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

test('set http: URL path, no leading slash', (t) => {
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

test('fileURLToPath', (t) => {
  if (isWindows) {
    t.is(url.fileURLToPath('file:///c:/foo/bar'), 'c:\\foo\\bar')
  } else {
    t.is(url.fileURLToPath('file:///foo/bar'), '/foo/bar')
  }
})

test('pathToFileURL', (t) => {
  if (isWindows) {
    t.is(url.pathToFileURL('c:\\foo\\bar').href, 'file:///c:/foo/bar')
  } else {
    t.is(url.pathToFileURL('/foo/bar').href, 'file:///foo/bar')
  }
})
