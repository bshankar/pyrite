const {Wallet} = require('../wallet')
const {Transaction, GenesisTransaction} = require('../transaction')
const {TransactionInput, TransactionOutput, computeBalance} = require('../transactionUtil')

const alice = new Wallet()
const bob = new Wallet()
const walter = new Wallet()

// Alice mines and gets 25 pyrites
const t1 = new GenesisTransaction(alice.address)

// Alice sends
// 5 --> bob
// 5 --> walter
// 15 --> Alice
const t2 = new Transaction(
  alice,
  [new TransactionInput(t1, 0)],
  [new TransactionOutput(bob.address, 5.0),
    new TransactionOutput(alice.address, 15.0),
    new TransactionOutput(walter.address, 5.0)]
)

// Walter -- 5 --> Bob
const t3 = new Transaction(
  walter,
  [new TransactionInput(t2, 2)],
  [new TransactionOutput(bob.address, 5.0)])

// Bob -- 8 --> Walter
//     -- 1 --> Bob
//        1 fee
const t4 = new Transaction(
  bob,
  [new TransactionInput(t2, 0), new TransactionInput(t3, 0)],
  [new TransactionOutput(walter.address, 8.0), new TransactionOutput(bob.address, 1.0)]
)

const transactions = [t1, t2, t3, t4]

console.log('Alice has ' + computeBalance(alice.address, transactions) + ' pyrites')
console.log('Bob has ' + computeBalance(bob.address, transactions) + ' pyrites')
console.log('Walter has ' + computeBalance(walter.address, transactions) + ' pyrites')
