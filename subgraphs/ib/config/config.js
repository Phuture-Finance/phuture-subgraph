let defaultPath = './mainnet/';
if (process.env.CONFIG_PATH != null) {
  defaultPath = process.env.CONFIG_PATH;
}

const impAddr = require(defaultPath + 'Addresses.json');
const impBlocks = require(defaultPath + 'Blocks.json');
const network = require(defaultPath + 'Network.json');

let data = {
  ...impAddr,
  ...impBlocks,
  ...network,

  IndexBettingBlockNumber: impBlocks.IndexBettingBlockNumber,
};

module.exports = {
  data,
};
