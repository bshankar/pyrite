const cryptoJS = require('crypto-js')

function validObject (valid, message) {
  return {valid: valid, message: message}
}

function secureHash (msg) {
  return cryptoJS.SHA256(msg).toString(cryptoJS.enc.Hex)
}

function mine (msg, difficulty = 1) {
  let n = 0
  const prefix = '1'.repeat(difficulty)
  while (true) {
    if (secureHash(msg + n).slice(0, difficulty) === prefix) {
      return n
    }
    n += 1
  }
}

module.exports = {validObject, secureHash, mine}
