const {secureHash, mine} = require('../util')

const msg = 'Hello World!'
console.log('Trying to mine with message: "' + msg + '"')
let nonce = 0
console.log('h(' + msg + nonce + ') ' + secureHash(msg + nonce))
console.log('mining for a hash with 3 ones in the beginning ...')
nonce = mine(msg, 3)
console.log('Found nonce=', nonce)
console.log('h(' + msg + nonce + ') ' + secureHash(msg + nonce))
