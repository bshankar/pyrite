const {
  TransactionInput,
  TransactionOutput,
  computeFee,
  computeBalance
} = require('./transactionUtil')

const {Wallet} = require('./wallet')
const { secureHash } = require('./util')

class Transaction {
  constructor (wallet, inputs, outputs) {
    this.inputs = inputs
    this.outputs = outputs
    this.fee = computeFee(inputs, outputs)
    this.signature = wallet.sign(JSON.stringify(this.toObject(false)))
  }

  toObject (includeSignature = true) {
    const transaction = {
      inputs: this.inputs,
      outputs: this.outputs,
      fee: this.fees
    }
    if (includeSignature === true) transaction.signature = this.signature
    return transaction
  }

  hash () {
    return secureHash(JSON.stringify(this.toObject()))
  }
}

class GenesisTransaction {
  constructor (recipientAddress, amount = 25) {
    this.inputs = []
    this.outputs = [new TransactionOutput(recipientAddress, amount)]
    this.fee = 0
    this.signature = 'genesis'
  }

  toObject (includeSignature = false) {
    // genesis transactions must be signed by some public key?
    return super.toObject(false)
  }
}

module.exports = {Transaction, GenesisTransaction}
