const { MerkleTree } = require('./merkle/src/merkle_tree')
const { verifyBlock } = require('./block_util')

class BlockChain extends MerkleTree {
  constructor (blocks) {
    super()
    this.blocks = blocks
    blocks.forEach(b => this.appendLeaf(JSON.stringify(b.toObject())))
    this.buildTree()
  }

  verify () {
    // verify starting from the last block to the genesis block
    return verifyBlock(this.blocks[this.blocks.length - 1], this.blocks[0])
  }
}

module.exports = { BlockChain }
