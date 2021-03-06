const { computeFee, verifyTransaction } = require('./transaction_util')
const { GenesisTransaction } = require('./transaction')
const { secureHash, mine } = require('./util')
const { blockIncentive, difficulty, computeTotalFee } = require('./block_util')
const assert = require('assert')

class Block {
  constructor (transactions, ancestor, minerAddress, skipVerify = false) {
    const reward = blockIncentive + computeTotalFee(transactions)
    this.transactions = [new GenesisTransaction(minerAddress, reward), ...transactions]
    this.ancestor = ancestor

    if (skipVerify === false) {
      assert(transactions.every(t => verifyTransaction(t).valid === true),
        'some transactions in the block are invalid')
    }

    const jsonBlock = JSON.stringify(this.toObject(false))
    this.nonce = mine(jsonBlock, difficulty)
    this.hash = secureHash(jsonBlock + this.nonce)
  }

  fee () {
    return computeTotalFee(this.transactions)
  }

  toObject (includeHash = true) {
    const block = {
      transactions: this.transactions.map(t => t.toObject()),
      previousBlock: this.ancestor
    }
    if (includeHash === true) {
      block.nonce = this.nonce
      block.hash = this.hash
    }
    return block
  }
}

class GenesisBlock extends Block {
  constructor (minerAddress) {
    super([], null, minerAddress, true)
  }

  toObject (includeHash = true) {
    const block = {
      transactions: [],
      genesisBlock: true
    }

    if (includeHash === true) {
      block.nonce = this.nonce
      block.hash = this.hash
    }
    return block
  }
}

module.exports = {Block, GenesisBlock, blockIncentive, difficulty}
