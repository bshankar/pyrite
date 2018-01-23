const {secureHash} = require('../util')
const {Wallet} = require('../wallet')
const {GenesisBlock, Block} = require('../block')
const {verifyBlock, collectTransactions} = require('../block_util')
const {Transaction} = require('../transaction')
const {
  TransactionInput,
  TransactionOutput,
  computeBalance
} = require('../transaction_util')
const {BlockChain} = require('../blockchain')

const alice = new Wallet()
const bob = new Wallet()
const walter = new Wallet()

// Alice mines the genesis block A + 25
const genesisBlock = new GenesisBlock(alice.address)
console.log('genesis block : ' + genesisBlock.hash + ' with fee=' + genesisBlock.fee())

const t1 = genesisBlock.transactions[0]

// Alice --> Bob 5
// Alice --> Walter 5
const t2 = new Transaction(
  alice,
  [new TransactionInput(t1, 0)],
  [new TransactionOutput(bob.address, 5.0),
   new TransactionOutput(alice.address, 15.0),
   new TransactionOutput(walter.address, 5.0)]
)

// Walter --> Bob 5
const t3 = new Transaction(
  walter,
  [new TransactionInput(t2, 2)],
  [new TransactionOutput(bob.address, 5.0)])

// Bob --> Walter 8
const t4 = new Transaction(
  bob,
  [new TransactionInput(t2, 0), new TransactionInput(t3, 0)],
  [new TransactionOutput(walter.address, 8.0), new TransactionOutput(bob.address, 1.0)]
)

const block1 = new Block([t2], genesisBlock, walter.address)
console.log('block1        : ' + block1.hash + ' with fee=' + block1.fee())

const block2 = new Block([t3, t4], block1, walter.address)
console.log('block2        : ' + block2.hash + ' with fee=' + block2.fee())

console.log('Validity of block1')
console.log(verifyBlock(block1, genesisBlock))
console.log('Validity of block2')
console.log(verifyBlock(block2, genesisBlock))

const transactions = collectTransactions(block2, genesisBlock)
console.log('Alice has ' + computeBalance(alice.address, transactions) + ' pyrites')
console.log('Bob has ' + computeBalance(bob.address, transactions) + ' pyrites')
console.log('Walter has ' + computeBalance(walter.address, transactions) + ' pyrites')

const bc = new BlockChain([genesisBlock, block1, block2])
console.log('verifying blockchain\'s integrity')
console.log(bc.verify())
console.log(bc.leaves)
const block1Hash = secureHash(JSON.stringify(block1.toObject()))
const auditTrail = bc.auditProof(block1Hash)
console.log(auditTrail)
console.log('Verifying audit proof on merkle tree')
console.log(bc.verifyAuditProof(bc.rootNode.hash, block1Hash, auditTrail))

// Attacks

// Walter tries to spend Bob's money
let tx = new Transaction(
  walter,
  [new TransactionInput(t4, 1)],
  [new TransactionOutput(walter.address, 1.0)]
)

// Walter disables checks in his Block constructor
// And tries to spend someone else's money
let block = new Block([tx], block2, walter.address, true)
console.log('Validity of a block while spending someone else\'s money:')
console.log(verifyBlock(block, genesisBlock))

// Walter tries to tamper a transaction
// This is a transaction signed by bob
tx = new Transaction(
  bob,
  [new TransactionInput(t2, 0), new TransactionInput(t3, 0)],
  [new TransactionOutput(walter.address, 8.0), new TransactionOutput(bob.address, 1.0)]
)
// And modified by the miner
tx.outputs[0].amount += 4
block = new Block([t3, tx], block1, walter.address, true)
console.log('Validity of a tampered block')
console.log(verifyBlock(block, genesisBlock))

// Bob tries to use a transaction twice
block = new Block([t3, t3, t4], block1, bob.address, true)
console.log('Validity of a block with repeated transaction')
console.log(verifyBlock(block, genesisBlock))
