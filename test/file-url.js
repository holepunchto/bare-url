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

test('pathToFileURL handles UNC paths', { skip: !isWindows }, (t) => {
  t.is(URL.pathToFileURL(String.raw`\\server\share\foo`).href, 'file://server/share/foo')
  t.is(URL.pathToFileURL('\\\\server\\share\\foo\\').href, 'file://server/share/foo/')
  t.is(URL.pathToFileURL(String.raw`\\SERVER\share\foo`).href, 'file://server/share/foo')
  t.is(URL.pathToFileURL(String.raw`\\server\share\a#b`).href, 'file://server/share/a%23b')
  t.is(URL.pathToFileURL(String.raw`\\.\C:\foo`).href, 'file://./C:/foo')
})

test('pathToFileURL rejects invalid UNC paths', { skip: !isWindows }, (t) => {
  t.exception(() => URL.pathToFileURL(String.raw`\\server`), /INVALID_ARG_VALUE/)
  t.exception(() => URL.pathToFileURL(String.raw`\\\share\foo`), /INVALID_ARG_VALUE/)
  t.exception(() => URL.pathToFileURL(String.raw`\\a b\share`), /INVALID_URL/)
})

test('pathToFileURL handles namespaced drive paths', { skip: !isWindows }, (t) => {
  t.is(URL.pathToFileURL(String.raw`\\?\C:\foo\bar`).href, 'file:///C:/foo/bar')
  t.is(URL.pathToFileURL('\\\\?\\C:\\foo\\bar\\').href, 'file:///C:/foo/bar/')
  t.is(URL.pathToFileURL(String.raw`\\?\C:\foo\a#b`).href, 'file:///C:/foo/a%23b')
  t.is(URL.pathToFileURL(String.raw`\\?\C:\..\foo`).href, 'file:///C:/foo')
  t.is(URL.pathToFileURL(String.raw`\\?\C:`).href, 'file:///C:')
})

test('pathToFileURL handles namespaced UNC paths', { skip: !isWindows }, (t) => {
  t.is(URL.pathToFileURL(String.raw`\\?\UNC\server\share\foo`).href, 'file://server/share/foo')
  t.is(URL.pathToFileURL('\\\\?\\UNC\\server\\share\\foo\\').href, 'file://server/share/foo/')
  t.is(URL.pathToFileURL('\\\\?\\UNC\\server\\').href, 'file://server/')
  t.is(URL.pathToFileURL(String.raw`\\?\UNC\\share`).href, 'file:///share')
})

test('pathToFileURL rejects invalid namespaced UNC paths', { skip: !isWindows }, (t) => {
  t.exception(() => URL.pathToFileURL(String.raw`\\?\UNC\server`), /INVALID_ARG_VALUE/)
})

test('pathToFileURL handles other namespaced paths', { skip: !isWindows }, (t) => {
  t.is(URL.pathToFileURL(String.raw`\\?\unc\server\share\foo`).href, 'file:///unc/server/share/foo')
  t.is(URL.pathToFileURL(String.raw`\\?\Volume{abc}\foo`).href, 'file:///Volume%7Babc%7D/foo')
})
