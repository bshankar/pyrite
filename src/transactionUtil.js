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

module.exports = {
  TransactionInput,
  TransactionOutput,
  computeFee,
  computeBalance
}
