const test = require('brittle')
const { URL } = require('..')

test('toString', (t) => {
  const url = new URL('file:///foo/bar')

  t.is(`${url}`, 'file:///foo/bar')
})

test('toJSON', (t) => {
  const url = new URL('file:///foo/bar')

  t.is(JSON.stringify(url), '"file:///foo/bar"')
})
