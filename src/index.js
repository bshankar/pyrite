const cryptoJS = require('crypto-js')

function secureHash (msg) {
  return cryptoJS.sha256(msg).toString(cryptoJS.enc.Hex)
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
