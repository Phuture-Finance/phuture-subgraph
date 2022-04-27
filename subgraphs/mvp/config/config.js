let defaultPath = './mainnet-fork/';
if (process.env.CONFIG_PATH != null) {
  defaultPath = process.env.CONFIG_PATH;
}

const impAddr = require(defaultPath + 'Addresses.json');
const impBlocks = require(defaultPath + 'Blocks.json');
const impBaseAssets = require(defaultPath + 'BaseAssets.json');
const pairs = require(defaultPath + 'ChainLink.json');

let data = {
  ...impAddr,
  ...impBlocks,

  BaseAssets: JSON.stringify(impBaseAssets),

  SushiswapV2Factory: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
  SushiV2FactoryBlockNumber:impBlocks.RegistryBlockNumber,

  TrackedIndexFactory: '0x3a6fef3a4bb4ec3bce7fa7f2c53cf0f82c49fe36',
  TrackedIndexFactoryBlockNumber: impBlocks.RegistryBlockNumber,

  UniswapV2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  UniswapV2RouterBlockNumber: impBlocks.RegistryBlockNumber,

  SushiswapV2Router: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
  SushiswapV2RouterBlockNumber: impBlocks.RegistryBlockNumber,

  FeePoolBlockNumber: impBlocks.RegistryBlockNumber,
  RebalancingCredit: '0xea51c983a2209d16a597d219d472204a9666972c',
};

data['swapFactories'] = [
  {
    "name": "SushiswapFactory",
    "factoryAddress": data.SushiV2Factory,
    "startBlock": data.SushiV2FactoryBlockNumber
  },
  {
    'name': 'UniswapFactory',
    'factoryAddress': data.UniswapV2Factory,
    'startBlock': data.UniswapV2FactoryBlockNumber,
  },
];

data['network'] = 'mainnet';

module.exports = {
  data,
  pairs,
};
