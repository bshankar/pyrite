const {verifySignature} = require('./wallet')
const {validObject} = require('./util')

class TransactionInput {
  constructor (transaction, outputIndex) {
    // points to the output of another transaction
    this.transaction = transaction
    this.outputIndex = outputIndex
    this.parentOutput = transaction.outputs[outputIndex]
  }

  toObject () {
    return {
      transaction: this.transaction.hash(),
      outputIndex: this.outputIndex
    }
  }
}

class TransactionOutput {
  constructor (recipientAddress, amount) {
    this.recipientAddress = recipientAddress
    this.amount = amount
  }

  toObject () {
    return {
      recipientAddress: this.recipientAddress,
      amount: this.amount
    }
  }
}

function computeFee (inputs, outputs) {
  return inputs.reduce((a, i) => a + i.transaction.outputs[i.outputIndex].amount, 0) -
    outputs.reduce((a, o) => a + o.amount, 0)
}

function computeBalance (walletAddress, transactions) {
  return transactions.reduce((a, t) => a -
    t.inputs.filter(tin => tin.parentOutput !== undefined &&
      tin.parentOutput.recipientAddress === walletAddress)
      .reduce((i, tin) => i + tin.parentOutput.amount, 0) +
    t.outputs.filter(tout => tout.recipientAddress === walletAddress)
      .reduce((o, tout) => o + tout.amount, 0), 0)
}

function isGenesisTransaction(transaction) {
  return transaction.inputs.length === 0
}

function verifyTransaction (transaction) {
  // all the inputs must belong to the same wallet
  // Transaction must be signed by the owner of the said wallet
  if (isGenesisTransaction(transaction) === true) {
    return validObject(true, 'genesis')
  }
  if (transaction.inputs.every(i => verifyTransaction(i.transaction)) === false) {
    return validObject(false, 'Invalid parent transaction')
  }
  const firstInputAddress = transaction.inputs[0].parentOutput.recipientAddress
  if (transaction.inputs.every(i => i.parentOutput.recipientAddress === firstInputAddress) === false) {
    return validObject(false, 'Transaction belongs to multiple wallets')
  }
  const transactionMessage = JSON.stringify(transaction.toObject(false))
  if (verifySignature(transactionMessage, transaction.signature.signature, firstInputAddress) === false) {
    return validObject(false, 'Transaction signature is invalid. Trying to spend someone else\'s money?')
  }
  if (computeFee(transaction.inputs, transaction.outputs) < 0) {
    return validObject(false, 'Transaction fee cannot be negative')
  }
  return validObject(true, 'Normal transaction')
}

module.exports = {
  TransactionInput,
  TransactionOutput,
  computeFee,
  computeBalance,
  isGenesisTransaction,
  verifyTransaction
}
