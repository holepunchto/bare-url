const test = require('brittle')
const { URL } = require('..')

test('parse', (t) => {
  t.alike(URL.parse('https://example.org'), new URL('https://example.org'))
  t.is(URL.parse('/foo/bar'), null)
  t.alike(URL.parse('/foo/bar', 'https://example.org'), new URL('https://example.org/foo/bar'))
})

test('parse, invalid base', (t) => {
  t.is(URL.parse('/foo/bar', 'not-a-valid-url'), null)
})

test('canParse', (t) => {
  t.is(URL.canParse('https://example.org'), true)
  t.is(URL.canParse('/foo/bar'), false)
  t.is(URL.canParse('/foo/bar', 'https://example.org'), true)
  t.is(URL.canParse('/foo/bar', new URL('https://example.org')), true)
})

test('canParse, invalid base', (t) => {
  t.is(URL.canParse('/foo/bar', 'not-a-valid-url'), false)
})
