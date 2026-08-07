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
