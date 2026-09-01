const test = require('brittle')
const { URL, URLSearchParams } = require('..')

test('construct from string', (t) => {
  const params = new URLSearchParams('foo=1&bar=2')

  t.is(params.get('foo'), '1')
  t.is(params.get('bar'), '2')
})

test('construct from leading ?', (t) => {
  const params = new URLSearchParams('?foo=1')

  t.is(params.get('foo'), '1')
})

test('construct from empty string', (t) => {
  t.is(new URLSearchParams('').size, 0)
  t.is(new URLSearchParams('?').size, 0)
})

test('construct from string, percent decodes', (t) => {
  const params = new URLSearchParams('foo%20bar=baz%26quux&a%3Db=c%3Dd')

  t.is(params.get('foo bar'), 'baz&quux')
  t.is(params.get('a=b'), 'c=d')
})

test('construct from string, percent decodes non-ASCII', (t) => {
  const params = new URLSearchParams('n%C3%A6vn=v%C3%A6rdi')

  t.is(params.get('n\u00e6vn'), 'v\u00e6rdi')
})

test('construct from string, decodes + as space', (t) => {
  const params = new URLSearchParams('foo+bar=baz+quux')

  t.is(params.get('foo bar'), 'baz quux')
})

test('construct from string, decodes + and percent together', (t) => {
  const params = new URLSearchParams('a+b%2Bc=d+e%2Bf')

  t.is(params.get('a b+c'), 'd e+f')
})

test('construct from string, value containing =', (t) => {
  const params = new URLSearchParams('foo=bar=baz')

  t.is(params.get('foo'), 'bar=baz')
})

test('construct from string, name without value', (t) => {
  const params = new URLSearchParams('foo&bar=1')

  t.is(params.get('foo'), '')
  t.is(params.get('bar'), '1')
})

test('construct from string, empty value', (t) => {
  t.is(new URLSearchParams('foo=').get('foo'), '')
})

test('construct from string, skips empty sequences', (t) => {
  const params = new URLSearchParams('&foo=1&&bar=2&')

  t.is(params.size, 2)
  t.is(params.get('foo'), '1')
  t.is(params.get('bar'), '2')
})

test('construct from object', (t) => {
  const params = new URLSearchParams({ foo: '1', bar: '2' })

  t.is(params.get('foo'), '1')
  t.is(params.get('bar'), '2')
})

test('construct from entries', (t) => {
  const params = new URLSearchParams([
    ['foo', '1'],
    ['bar', '2']
  ])

  t.is(params.get('foo'), '1')
  t.is(params.get('bar'), '2')
})

test('size', (t) => {
  const params = new URLSearchParams('foo=1&bar=2&foo=3')

  t.is(params.size, 3)
})

test('size, empty', (t) => {
  t.is(new URLSearchParams().size, 0)
})

test('append', (t) => {
  const params = new URLSearchParams()

  params.append('foo', '1')
  params.append('foo', '2')

  t.alike(params.getAll('foo'), ['1', '2'])
})

test('append, no value', (t) => {
  const params = new URLSearchParams()

  params.append('foo')

  t.is(params.has('foo'), false)
})

test('get, missing', (t) => {
  t.is(new URLSearchParams().get('foo'), null)
})

test('getAll', (t) => {
  const params = new URLSearchParams('foo=1&foo=2')

  t.alike(params.getAll('foo'), ['1', '2'])
})

test('getAll, missing', (t) => {
  t.alike(new URLSearchParams().getAll('foo'), [])
})

test('has', (t) => {
  const params = new URLSearchParams('foo=1&foo=2')

  t.is(params.has('foo'), true)
  t.is(params.has('bar'), false)
  t.is(params.has('foo', '1'), true)
  t.is(params.has('foo', '3'), false)
})

test('set', (t) => {
  const params = new URLSearchParams('foo=1&foo=2')

  params.set('foo', '3')

  t.alike(params.getAll('foo'), ['3'])
})

test('set, no value', (t) => {
  const params = new URLSearchParams('foo=1')

  params.set('foo')

  t.is(params.has('foo'), false)
})

test('delete', (t) => {
  const params = new URLSearchParams('foo=1&bar=2')

  params.delete('foo')

  t.is(params.has('foo'), false)
  t.is(params.has('bar'), true)
})

test('delete, by value', (t) => {
  const params = new URLSearchParams('foo=1&foo=2')

  params.delete('foo', '1')

  t.alike(params.getAll('foo'), ['2'])
})

test('delete, by value, last value', (t) => {
  const params = new URLSearchParams('foo=1')

  params.delete('foo', '1')

  t.is(params.has('foo'), false)
})

test('delete, by value, missing name', (t) => {
  const params = new URLSearchParams('foo=1')

  params.delete('bar', '1')

  t.is(params.has('foo'), true)
})

test('iterator', (t) => {
  const params = new URLSearchParams('foo=1&bar=2&foo=3')

  t.alike(
    [...params],
    [
      ['foo', '1'],
      ['foo', '3'],
      ['bar', '2']
    ]
  )
})

test('toString', (t) => {
  const params = new URLSearchParams('foo=1&bar=2')

  t.is(params.toString(), 'foo=1&bar=2')
})

test('toString, encodes', (t) => {
  const params = new URLSearchParams()

  params.append('foo bar', 'baz&quux')

  t.is(params.toString(), 'foo+bar=baz%26quux')
})

test('toString, encodes the urlencoded byte set', (t) => {
  const params = new URLSearchParams()

  // Everything except alphanumerics and `*-._` is percent-encoded, and a space
  // becomes `+`, per the application/x-www-form-urlencoded serializer.
  params.append("a b!'()~*-._", '')

  t.is(params.toString(), 'a+b%21%27%28%29%7E*-._=')
})

test('toString, encodes non-ASCII as UTF-8', (t) => {
  const params = new URLSearchParams()

  params.append('n\u00e6vn', 'v\u00e6rdi')
  params.append('emoji', '\u{1f600}')

  t.is(params.toString(), 'n%C3%A6vn=v%C3%A6rdi&emoji=%F0%9F%98%80')
})

test('toString, replaces lone surrogates', (t) => {
  const params = new URLSearchParams()

  // A surrogate that is not part of a pair encodes no scalar value, so the UTF-8
  // encoder substitutes U+FFFD for it.
  params.append('\ud800', 'a\udfffb')

  t.is(params.toString(), '%EF%BF%BD=a%EF%BF%BDb')
})

test('toString, keeps surrogate pairs intact', (t) => {
  const params = new URLSearchParams()

  // Only unpaired surrogates are substituted; a pair either side of one is
  // still a scalar value and must survive.
  params.append('\ud800\udc00', 'a\ud800\udc00\udfffb')

  t.is(params.toString(), '%F0%90%80%80=a%F0%90%80%80%EF%BF%BDb')
})

test('toString, round trips through the parser', (t) => {
  const input = 'a+b=c%26d&n%C3%A6vn=v%C3%A6rdi&plain=1'

  t.is(new URLSearchParams(new URLSearchParams(input).toString()).toString(), input)
})

test('toJSON', (t) => {
  const params = new URLSearchParams('foo=1&bar=2')

  t.alike(params.toJSON(), [
    ['foo', '1'],
    ['bar', '2']
  ])
})

test('mutation updates URL search', (t) => {
  const url = new URL('http://example.com/')

  url.searchParams.append('foo', '1')

  t.comment(url.href)
  t.is(url.search, '?foo=1')

  url.searchParams.set('foo', '2')

  t.comment(url.href)
  t.is(url.search, '?foo=2')

  url.searchParams.delete('foo')

  t.comment(url.href)
  t.is(url.search, '')
})

test('isURLSearchParams', (t) => {
  t.ok(URL.isURLSearchParams(new URLSearchParams('foo')))

  t.absent(URL.isURLSearchParams('foo'))

  t.absent(URL.isURLSearchParams())
  t.absent(URL.isURLSearchParams(null))
  t.absent(URL.isURLSearchParams({}))

  class MyURLSearchParams extends URLSearchParams {}

  t.ok(URL.isURLSearchParams(new MyURLSearchParams('foo')))

  t.unlike(URLSearchParams, global.URLSearchParams)
  t.ok(URL.isURLSearchParams(new global.URLSearchParams('foo')))
})
