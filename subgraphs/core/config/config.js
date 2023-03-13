let defaultPath = './mainnet/';
if (process.env.CONFIG_PATH != null) {
  defaultPath = process.env.CONFIG_PATH;
}

const impAddr = require(defaultPath + 'Addresses.json');
const impBlocks = require(defaultPath + 'Blocks.json');
const impBaseAssets = require(defaultPath + 'BaseAssets.json');
const pairs = require(defaultPath + 'ChainLink.json');
const network = require(defaultPath + 'Network.json');

let data = {
  ...impAddr,
  ...impBlocks,
  ...network,

  BaseAssets: JSON.stringify(
    impBaseAssets.map((a) => {
      return a.toLowerCase();
    }),
  ),
  FeePoolBlockNumber: impBlocks.RegistryBlockNumber,
};

module.exports = {
  data,
  pairs,
};
