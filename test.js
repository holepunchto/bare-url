const test = require('brittle')
const os = require('bare-os')
const url = require('.')

test('fileURLToPath', (t) => {
  t.is(url.fileURLToPath('file:///foo/bar'), os.platform() === 'win32' ? '\\foo\\bar' : '/foo/bar')
})
