const test = require('brittle')
const { URL } = require('..')

test('IDNA encodes unicode host to punycode', (t) => {
  const url = new URL('https://ex\u00e4mple.com/')

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
  const url = new URL('https://\u4f60\u597d.com/')

  t.comment(url.href)
  t.is(url.hostname, 'xn--6qq79v.com')
})

test('IDNA encodes multi-label host', (t) => {
  const url = new URL('http://\u65e5\u672c\u8a9e.jp/path')

  t.comment(url.href)
  t.is(url.hostname, 'xn--wgv71a119e.jp')
  t.is(url.pathname, '/path')
})

test('IDNA applies mapping to sharp s', (t) => {
  const url = new URL('https://fa\u00df.de/')

  t.comment(url.href)
  t.is(url.hostname, 'xn--fa-hia.de')
})

test('IDNA encodes host set via hostname', (t) => {
  const url = new URL('https://example.com/')

  url.hostname = 'ex\u00e4mple.com'

  t.comment(url.href)
  t.is(url.hostname, 'xn--exmple-cua.com')
})

test('IDNA encodes host set via host', (t) => {
  const url = new URL('https://example.com/')

  url.host = 'ex\u00e4mple.com'

  t.comment(url.href)
  t.is(url.hostname, 'xn--exmple-cua.com')
})

test('IDNA does not apply to non-special scheme host', (t) => {
  const url = new URL('scheme://ex\u00e4mple.com/')

  t.comment(url.href)
  t.is(url.hostname, 'ex%C3%A4mple.com')
})
