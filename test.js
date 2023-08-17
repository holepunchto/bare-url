const test = require('brittle')
const url = require('.')

test('fileURLToPath', (t) => {
  t.is(url.fileURLToPath('file:///foo/bar'), process.platform === 'win32' ? '\\foo\\bar' : '/foo/bar')
})
