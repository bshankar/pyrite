const {validObject} = require('./util')
const {isGenesisTransaction, verifyTransaction, computeFee} = require('./transaction_util')

// We give 25 pyrites to someone who helped to verify a block
const blockIncentive = 25
const difficulty = 2

function computeTotalFee (transactions) {
  return transactions.reduce((a, t) => a + computeFee(t.inputs, t.outputs), 0)
}

function hashStartsWithPrefix (block) {
  // verify that hash starts prefix
  const prefix = '1'.repeat(difficulty)
  if (block.hash.startsWith(prefix) === false) {
    return validObject(false, 'Block hash doesn\'t start with ' + prefix)
  }
}

function transactionsValid (block) {
  // verify that transactions in the block are valid
  if (block.transactions.every(t => verifyTransaction(t).valid === true) === false) {
    return validObject(false, 'Block contains some invalid transactions')
  }
}

function noSpentTransactions (block, usedOutputs) {
  // verify that transaction outputs don\'t contain spent transactions
  if (block.transactions.every(t => t.inputs
    .every(i => usedOutputs[t.parentOutput] === undefined)) === false) {
    return validObject(false, 'Some transactions contain spent transactions')
  }
}

function firstTransactionMinerReward (block) {
  const tx = block.transactions[0]
  if (isGenesisTransaction(tx) === false) {
    return validObject(false, 'Transaction 0 is not a Genesis transaction')
  }

  if (tx.outputs.length !== 1) {
    return validObject(false, 'Transaction 0\'s outputs are not equal to 1')
  }

  const reward = computeTotalFee(block.transactions.slice(1, block.transactions.length)) + blockIncentive
  if (tx.outputs[0].amount !== reward) {
    return validObject(false, 'Transaction 0 has invalid amount')
  }
}

function onlyFirstTransactionGenesis (block) {
  if (block.transactions.slice(1, block.transactions.length)
    .every(t => isGenesisTransaction(t) !== true) === false) {
    return validObject(false, 'Genesis transaction at a non-zero index')
  }
}

function verifyBlock (block, genesisBlock, usedOutputs = {}) {
  const checked = hashStartsWithPrefix(block) || transactionsValid(block) ||
        noSpentTransactions(block, usedOutputs) || firstTransactionMinerReward(block) ||
        onlyFirstTransactionGenesis(block)
  if (checked !== undefined) return checked

  // verify ancestors upto genesisBlock
  if (block.hash !== genesisBlock.hash &&
      verifyBlock(block.ancestor, genesisBlock, usedOutputs) === false) {
    return validObject(false, 'An ancestor block is not valid')
  }
  return validObject(true, 'Verified block')
}

function collectTransactions (block, genesisBlock) {
  let transactions = block.transactions
  if (block.hash !== genesisBlock.hash) {
    transactions = transactions.concat(collectTransactions(block.ancestor, genesisBlock))
  }
  return transactions
}

module.exports = {
  verifyBlock,
  computeTotalFee,
  blockIncentive,
  difficulty,
  collectTransactions
}
