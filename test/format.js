const test = require('brittle')
const { format } = require('..')

test('format with query object', (t) => {
  t.is(
    format({
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

test('format with auth, host, search and hash', (t) => {
  t.is(
    format({
      protocol: 'https',
      auth: 'user:pass',
      host: 'example.com:1234',
      pathname: 'path',
      search: 'a=1',
      hash: 'frag'
    }),
    'https://user:pass@example.com:1234/path?a=1#frag'
  )
})

test('format with hostname and port', (t) => {
  t.is(
    format({ protocol: 'https:', hostname: 'example.com', port: 1234 }),
    'https://example.com:1234'
  )
})

test('format with slashes for non-special scheme', (t) => {
  t.is(format({ protocol: 'custom', slashes: true, hostname: 'h' }), 'custom://h')
})

test('format without slashes for non-special scheme', (t) => {
  t.is(format({ protocol: 'custom', hostname: 'h' }), 'custom:h')
})

test('format with leading punctuation already present', (t) => {
  t.is(
    format({ protocol: 'https:', hostname: 'example.com', search: '?x=1', hash: '#h' }),
    'https://example.com?x=1#h'
  )
})

test('format without protocol', (t) => {
  t.is(format({ hostname: 'example.com' }), 'example.com')
})
