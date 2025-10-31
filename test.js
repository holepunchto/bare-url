const test = require('brittle')
const { URL, URLSearchParams } = require('.')

const isWindows = Bare.platform === 'win32'

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

test('toString', (t) => {
  const url = new URL('file:///foo/bar')

  t.is(`${url}`, 'file:///foo/bar')
})

test('toJSON', (t) => {
  const url = new URL('file:///foo/bar')

  t.is(JSON.stringify(url), '"file:///foo/bar"')
})

test('isURL', (t) => {
  t.ok(URL.isURL(new URL('https://example.org')))

  t.absent(URL.isURL('https://example.org'))

  t.absent(URL.isURL())
  t.absent(URL.isURL(null))
  t.absent(URL.isURL({}))

  class MyURL extends URL {}

  t.ok(URL.isURL(new MyURL('https://example.org')))

  t.unlike(URL, global.URL)
  t.ok(URL.isURL(new global.URL('https://example.org')))
})

test('parse', (t) => {
  t.alike(URL.parse('https://example.org'), new URL('https://example.org'))
  t.is(URL.parse('/foo/bar'), null)
  t.alike(URL.parse('/foo/bar', 'https://example.org'), new URL('https://example.org/foo/bar'))
})

test('canParse', (t) => {
  t.is(URL.canParse('https://example.org'), true)
  t.is(URL.canParse('/foo/bar'), false)
  t.is(URL.canParse('/foo/bar', 'https://example.org'), true)
  t.is(URL.canParse('/foo/bar', new URL('https://example.org')), true)
})

test('fileURLToPath', (t) => {
  if (isWindows) {
    t.is(URL.fileURLToPath('file:///c:/foo/bar'), 'c:\\foo\\bar')
  } else {
    t.is(URL.fileURLToPath('file:///foo/bar'), '/foo/bar')
  }
})

test('pathToFileURL', (t) => {
  if (isWindows) {
    t.is(URL.pathToFileURL('c:\\foo\\bar').href, 'file:///c:/foo/bar')
  } else {
    t.is(URL.pathToFileURL('/foo/bar').href, 'file:///foo/bar')
  }
})

test('format', (t) => {
  t.is(
    URL.format({
      protocol: 'https',
      hostname: 'example.com',
      pathname: '/some/path',
      query: {
        page: 1,
        format: 'json'
      }
    }),
    'https://example.com/some/path?page=1&format=json'
  )
})
