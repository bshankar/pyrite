const {Wallet} = require('../wallet')
const {GenesisBlock, Block} = require('../block')
const {Transaction} = require('../transaction')
const {
  TransactionInput,
  TransactionOutput
} = require('../transaction_util')

const alice = new Wallet()
const bob = new Wallet()
const walter = new Wallet()

const genesisBlock = new GenesisBlock(alice.address)
console.log('genesis block : ' + genesisBlock.hash + ' with fee=' + genesisBlock.fee())

const t1 = genesisBlock.transactions[0]
const t2 = new Transaction(
  alice,
  [new TransactionInput(t1, 0)],
  [new TransactionOutput(bob.address, 5.0),
    new TransactionOutput(alice.address, 15.0),
    new TransactionOutput(walter.address, 5.0)]
)
const t3 = new Transaction(
  walter,
  [new TransactionInput(t2, 2)],
  [new TransactionOutput(bob.address, 5.0)])

const t4 = new Transaction(
  bob,
  [new TransactionInput(t2, 0), new TransactionInput(t3, 0)],
  [new TransactionOutput(walter.address, 8.0), new TransactionOutput(bob.address, 1.0)]
)

const block1 = new Block([], genesisBlock, walter.address)
console.log('block1        : ' + block1.hash + ' with fee=' + block1.fee())

const block2 = new Block([t3, t4], block1, walter.address)
console.log('block2        : ' + block2.hash + ' with fee=' + block2.fee())
