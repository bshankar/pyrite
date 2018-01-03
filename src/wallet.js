const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')

class Wallet {
  constructor () {
    // Generate private key
    do {
      this.privateKey = randomBytes(32)
    } while (!secp256k1.privateKeyVerify(this.privateKey))

    // Extract public key from the private key
    this.publicKey = secp256k1.publicKeyCreate(this.privateKey)
  }

  sign (msg) {
    const buf = toBuffer(msg)
    const sigObj = secp256k1.sign(buf, this.privateKey)
    return sigObj
  }
}

function toBuffer (msg) {
  // convert an ascii coded string to a buffer of length 32 bytes
  // (padded with zeros)
  const buf = Buffer.alloc(32)
  for (let i = 0; i < msg.length; ++i) {
    buf[i] = msg.charCodeAt(i)
  }
  return buf
}

function verifySignature (msg, signature, publicKey) {
  return secp256k1.verify(toBuffer(msg), signature, publicKey)
}

module.exports = {Wallet, toBuffer, verifySignature}
