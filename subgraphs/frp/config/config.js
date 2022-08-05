let defaultPath = './mainnet-fork/';
if (process.env.CONFIG_PATH != null) {
  defaultPath = process.env.CONFIG_PATH;
}

const impAddr = require(defaultPath + 'Addresses.json');
const impBlocks = require(defaultPath + 'Blocks.json');

let data = {
  ...impAddr,
  ...impBlocks,
};

data['network'] = 'mainnet';

module.exports = {
  data,
};
