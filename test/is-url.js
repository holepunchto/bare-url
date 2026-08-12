const test = require('brittle')
const { URL } = require('..')

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
