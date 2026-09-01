const test = require('brittle')
const { URL } = require('..')

// A setter must not let its value escape into another component. Every
// expectation below is the result the WHATWG algorithm produces.
const injection = [
  ['https://good.com/p?q=1#f', 'protocol', 'http://evil.com', 'http://good.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'protocol', 'http://evil.com/', 'http://good.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'protocol', 'javascript', 'https://good.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'protocol', 'HTTP', 'http://good.com/p?q=1#f'],
  ['foo://good.com/p', 'protocol', 'https', 'foo://good.com/p'],
  ['https://u:p@good.com/', 'protocol', 'file', 'https://u:p@good.com/'],

  ['https://good.com/p?q=1#f', 'username', 'a/b', 'https://a%2Fb@good.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'username', 'a\\b', 'https://a%5Cb@good.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'username', 'a@b', 'https://a%40b@good.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'username', 'a:b', 'https://a%3Ab@good.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'username', 'a?b', 'https://a%3Fb@good.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'username', 'a#b', 'https://a%23b@good.com/p?q=1#f'],
  ['https://:pw@good.com/p', 'username', 'user', 'https://user:pw@good.com/p'],
  ['https://u@good.com/p', 'password', 'a/b', 'https://u:a%2Fb@good.com/p'],
  ['https://good.com/p', 'password', 'a@b', 'https://:a%40b@good.com/p'],

  ['https://good.com/p?q=1#f', 'hostname', 'evil.com/injected', 'https://evil.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'hostname', 'evil.com?x=1', 'https://evil.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'hostname', 'evil.com#frag', 'https://evil.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'hostname', 'evil.com:99', 'https://good.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'hostname', 'a@b', 'https://good.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'host', 'evil.com/injected', 'https://evil.com/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'host', 'evil.com:99', 'https://evil.com:99/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'host', 'a@b', 'https://good.com/p?q=1#f'],
  ['https://good.com:8080/p', 'host', 'evil.com', 'https://evil.com:8080/p'],
  ['https://good.com:8080/p', 'host', 'a:b', 'https://a:8080/p'],
  ['file://host/a', 'hostname', '', 'file:///a'],

  ['https://good.com/p?q=1#f', 'port', '8080/inject', 'https://good.com:8080/p?q=1#f'],
  ['https://good.com/p?q=1#f', 'port', '99999', 'https://good.com/p?q=1#f'],
  ['https://good.com:8080/p', 'port', 'abc', 'https://good.com:8080/p'],
  ['https://good.com:8080/p', 'port', '', 'https://good.com/p'],

  ['https://good.com/p?q=1#f', 'pathname', '/a#b', 'https://good.com/a%23b?q=1#f'],
  ['https://good.com/p?q=1#f', 'pathname', '/a?b=2', 'https://good.com/a%3Fb=2?q=1#f'],
  ['https://good.com/p?q=1#f', 'search', '?a=1#injected', 'https://good.com/p?a=1%23injected#f'],
  ['https://good.com/p?q=1#f', 'search', 'a#b', 'https://good.com/p?a%23b#f'],

  ['https://good.com/p', 'pathname', 'a\tb', 'https://good.com/ab'],
  ['https://good.com/p', 'username', 'a\tb', 'https://a%09b@good.com/p'],
  ['https://good.com/p', 'hostname', 'goo\tgle.com', 'https://google.com/p']
]

for (const [base, setter, value, expected] of injection) {
  test(`set ${setter} to ${JSON.stringify(value)} on ${base}`, (t) => {
    const url = new URL(base)

    url[setter] = value

    t.is(url.href, expected)
  })
}

// ASCII tab and newline are removed from input rather than encoded or rejected.
const stripped = [
  ['https://goo\tgle.com/', 'https://google.com/'],
  ['https://goo\ngle.com/', 'https://google.com/'],
  ['https://goo\rgle.com/', 'https://google.com/'],
  ['ht\ttps://google.com/', 'https://google.com/'],
  ['https://google.com/a\tb?q\t=1#f\tg', 'https://google.com/ab?q=1#fg']
]

for (const [input, expected] of stripped) {
  test(`parse ${JSON.stringify(input)}`, (t) => {
    t.is(new URL(input).href, expected)
  })
}

// Leading and trailing C0 control or space are removed from input too. Delete is
// not a C0 control, and so is encoded rather than removed.
const trimmed = [
  ['  https://good.com/  ', 'https://good.com/'],
  [' https://good.com/', 'https://good.com/'],
  ['https://good.com/ ', 'https://good.com/'],
  ['\u0000https://good.com/', 'https://good.com/'],
  ['https://good.com/\u0000', 'https://good.com/'],
  ['\u0001 \u001fhttps://good.com/', 'https://good.com/'],
  ['https://good.com/\u007f', 'https://good.com/%7F']
]

for (const [input, expected] of trimmed) {
  test(`parse ${JSON.stringify(input)}`, (t) => {
    t.is(new URL(input).href, expected)
  })
}

// A setter's value is not input to a whole URL parse, so a leading or trailing
// C0 control or space in one is encoded rather than removed, even where the
// value lands at the very end of the href.
const edges = [
  ['https://good.com/p?q=1#f', 'hash', 'x ', 'https://good.com/p?q=1#x%20'],
  ['https://good.com/p?q=1#f', 'hash', ' x', 'https://good.com/p?q=1#%20x'],
  ['https://good.com/p?q=1#f', 'hash', 'x\u0001', 'https://good.com/p?q=1#x%01'],
  ['https://good.com/p?q=1', 'search', 'a=1 ', 'https://good.com/p?a=1%20'],
  ['https://good.com/p', 'pathname', '/a ', 'https://good.com/a%20'],
  ['https://good.com/p', 'pathname', '/a\u0001', 'https://good.com/a%01'],
  ['foo://good.com/p', 'pathname', '/a ', 'foo://good.com/a%20'],
  ['https://good.com/p', 'hostname', 'b.com ', 'https://good.com/p'],
  ['https://good.com/p', 'username', 'u ', 'https://u%20@good.com/p']
]

for (const [base, setter, value, expected] of edges) {
  test(`set ${setter} to ${JSON.stringify(value)} at the end of ${base}`, (t) => {
    const url = new URL(base)

    url[setter] = value

    t.is(url.href, expected)
  })
}

test('set href reports a parse failure', (t) => {
  const url = new URL('https://good.com/p')

  t.exception(() => {
    url.href = 'garbage'
  })

  t.is(url.href, 'https://good.com/p')
})

test('search params follow a query moved by another setter', (t) => {
  const url = new URL('https://good.com/p?q=1#f')
  const params = url.searchParams

  t.is(params.get('q'), '1')

  url.pathname = '/a?injected=2'

  t.is(url.href, 'https://good.com/a%3Finjected=2?q=1#f')
  t.is(params.get('q'), '1')
  t.is(params.get('injected'), null)
})

test('search params follow a query replaced by the href setter', (t) => {
  const url = new URL('https://good.com/p?q=1')
  const params = url.searchParams

  url.href = 'https://good.com/p?other=2'

  t.is(params.get('q'), null)
  t.is(params.get('other'), '2')
})

test('search params write back the current query', (t) => {
  const url = new URL('https://good.com/p?q=1#f')
  const params = url.searchParams

  url.hostname = 'other.com'
  params.append('z', '9')

  t.is(url.href, 'https://other.com/p?q=1&z=9#f')
})

test('the URL a search params writes back to is not reachable', (t) => {
  const { URLSearchParams } = require('..')

  t.is(URLSearchParams._urls, undefined)
})
