const {Wallet} = require('../wallet')
const {Transaction, GenesisTransaction} = require('../transaction')
const {
  TransactionInput,
  TransactionOutput,
  verifyTransaction
} = require('../transactionUtil')
const util = require('util')

const alice = new Wallet()
const bob = new Wallet()
const walter = new Wallet()

const t1 = new GenesisTransaction(alice.address)
// This is an invalid transaction because bob is trying to spend alice's money
// (alice was the recipient of the input - t1)
const t2 = new Transaction(
  bob,
  [new TransactionInput(t1, 0)],
  [new TransactionOutput(walter.address, 10.0)]
)

// This is valid, alice is spending her own money
const t3 = new Transaction(
  alice,
  [new TransactionInput(t1, 0)],
  [new TransactionOutput(walter.address, 10.0)]
)

const transactions = [t1, t2, t3]
transactions.forEach(t => console.log(verifyTransaction(t)))
