const test = require('brittle')
const { URL } = require('..')

test('IDNA encodes unicode host to punycode', (t) => {
  const url = new URL('https://exämple.com/')

  t.comment(url.href)
  t.is(url.hostname, 'xn--exmple-cua.com')
  t.is(url.href, 'https://xn--exmple-cua.com/')
})

test('IDNA leaves punycode host untouched', (t) => {
  const url = new URL('https://xn--exmple-cua.com/')

  t.comment(url.href)
  t.is(url.hostname, 'xn--exmple-cua.com')
})

test('IDNA encodes non-latin host', (t) => {
  const url = new URL('https://你好.com/')

  t.comment(url.href)
  t.is(url.hostname, 'xn--6qq79v.com')
})

test('IDNA encodes multi-label host', (t) => {
  const url = new URL('http://日本語.jp/path')

  t.comment(url.href)
  t.is(url.hostname, 'xn--wgv71a119e.jp')
  t.is(url.pathname, '/path')
})

test('IDNA applies mapping to sharp s', (t) => {
  const url = new URL('https://faß.de/')

  t.comment(url.href)
  t.is(url.hostname, 'xn--fa-hia.de')
})

test('IDNA encodes host set via hostname', (t) => {
  const url = new URL('https://example.com/')

  url.hostname = 'exämple.com'

  t.comment(url.href)
  t.is(url.hostname, 'xn--exmple-cua.com')
})

test('IDNA encodes host set via host', (t) => {
  const url = new URL('https://example.com/')

  url.host = 'exämple.com'

  t.comment(url.href)
  t.is(url.hostname, 'xn--exmple-cua.com')
})

test('IDNA does not apply to non-special scheme host', (t) => {
  const url = new URL('scheme://exämple.com/')

  t.comment(url.href)
  t.is(url.hostname, 'ex%C3%A4mple.com')
})
