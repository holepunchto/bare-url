const test = require('brittle')
const { URL } = require('..')

const isWindows = Bare.platform === 'win32'

test('fileURLToPath', (t) => {
  if (isWindows) {
    t.is(URL.fileURLToPath('file:///c:/foo/bar'), 'c:\\foo\\bar')
  } else {
    t.is(URL.fileURLToPath('file:///foo/bar'), '/foo/bar')
  }
})

test('fileURLToPath accepts a URL', (t) => {
  const prefix = isWindows ? 'file:///c:' : 'file://'

  t.is(URL.fileURLToPath(new URL(prefix + '/foo/bar')), isWindows ? 'c:\\foo\\bar' : '/foo/bar')
})

test('fileURLToPath rejects non-file: protocol', (t) => {
  t.exception(() => URL.fileURLToPath('https://example.com/foo'), /INVALID_URL_SCHEME/)
})

test('fileURLToPath rejects encoded /', (t) => {
  const prefix = isWindows ? 'file:///c:' : 'file://'

  t.exception(() => URL.fileURLToPath(prefix + '/foo%2fbar'), /INVALID_FILE_URL_PATH/)
})

test('fileURLToPath rejects encoded NUL', (t) => {
  const prefix = isWindows ? 'file:///c:' : 'file://'

  t.exception(() => URL.fileURLToPath(prefix + '/etc/passwd%00.png'), /INVALID_FILE_URL_PATH/)
  t.exception(() => URL.fileURLToPath(prefix + '/foo%00bar'), /INVALID_FILE_URL_PATH/)
  // Literal NUL is percent-encoded by the URL parser, so this exercises the same path
  t.exception(() => URL.fileURLToPath(prefix + '/foo\x00bar'), /INVALID_FILE_URL_PATH/)
})

test('fileURLToPath rejects host', { skip: isWindows }, (t) => {
  t.exception(() => URL.fileURLToPath('file://host/foo/bar'), /INVALID_FILE_URL_HOST/)
})

test('pathToFileURL', (t) => {
  if (isWindows) {
    t.is(URL.pathToFileURL('c:\\foo\\bar').href, 'file:///c:/foo/bar')
  } else {
    t.is(URL.pathToFileURL('/foo/bar').href, 'file:///foo/bar')
  }
})

test('pathToFileURL preserves trailing separator', { skip: isWindows }, (t) => {
  t.is(URL.pathToFileURL('/foo/bar/').href, 'file:///foo/bar/')
})

test('pathToFileURL encodes special characters', { skip: isWindows }, (t) => {
  t.is(URL.pathToFileURL('/foo/a#b?c').href, 'file:///foo/a%23b%3fc')
  t.is(URL.pathToFileURL('/foo/a%b').href, 'file:///foo/a%25b')
  t.is(URL.pathToFileURL('/foo/a\nb').href, 'file:///foo/a%0ab')
})
