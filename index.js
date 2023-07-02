const path = require('path')

exports.fileURLToPath = fileURLToPath

function fileURLToPath (u) {
  if (u.startsWith('file://')) u = u.slice(7)
  return path.normalize(u)
}
