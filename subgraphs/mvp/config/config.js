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
// data['pairs'] = pairs;

let pairsRinkeby = [
  {
    'name': 'USDC',
    'address': '0x91b843dcb637323db7728e59995cfa02abb5111d',
    'aggregatorAddress': '0x4E94A9d221CE5CFE90B976600DaAAc639f936b66',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'WETH',
    'address': '0xc778417e063141139fce010982780140aa0cd5ab',
    'aggregatorAddress': '0x8FAcAE210C796Bcac7afE147b622FFc1064629f6',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'LINK',
    'address': '0xc4188db6106e0c6a5584cbb349fcd0d1e7d4e3b4',
    'aggregatorAddress': '0x63Da64115bb2dF82dDC9Bb4F98F0Cce652c1581a',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'DAI',
    'address': '0xaad94292e6ff68ba21173e048643fcbf26040dfd',
    'aggregatorAddress': '0x0720C40EDf5e88dFA8e8cd015296e4F3eDE5679A',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'WBTC',
    'address': '0x19b61b29fccce4fc1202051c8265cb2eff5ba110',
    'aggregatorAddress': '0xf03511fa3A4B816a400aE2a7D14b1892E14d18d4',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'USDT',
    'address': '0xe9ac343f0de7f14b8774a90de364f2b44db7e460',
    'aggregatorAddress': '0x4E94A9d221CE5CFE90B976600DaAAc639f936b66',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'UNI',
    'address': '0xbf483237e2b8e29360828022ee22eddd59b9becf',
    'aggregatorAddress': '0xECf6936AD6030A1Aa4f2055Df44149B7846628F7',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'COMP',
    'address': '0x682626b232489b494be74940fbed5047792da5fb',
    'aggregatorAddress': '0x2217fE4CE584800131cEFC440B9f2937E50ebf1a',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'SUSHI',
    'address': '0x0b5b4cd52a8e709c61f9cffd8cfb9b47b9bef2f3',
    'aggregatorAddress': '0xC4b4fAD3DC8C08DBa5d639A6e435f116b9282DB0',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'KP3R',
    'address': '0x47cb1858e9a995581714cf04324f1d0151bcab5c',
    'aggregatorAddress': '0xad26BAb8AAB6514AC56f66ae0c1bb9afACCC1d0A',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'MIR',
    'address': '0x30476217214716013698481e53b8980b517e0148',
    'aggregatorAddress': '0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'SNX',
    'address': '0xeee3c51505f033d12a9d2f24aa175c6f40ba5c9b',
    'aggregatorAddress': '0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'PHTR',
    'address': '0x7eace45c46182a70d9a208557250de8d201aa0b2',
    'aggregatorAddress': '0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'mTSLA',
    'address': '0x70498ef4182813507a8e7caae3fd56ea736774b9',
    'aggregatorAddress': '0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'mAMZN',
    'address': '0xd8f27968b5f1d9990038364df9417bde4b4bcc27',
    'aggregatorAddress': '0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'ZRX',
    'address': '0xa1f92487f5ff329b68f892b5ebcb0f46d8c4db10',
    'aggregatorAddress': '0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'AAVE',
    'address': '0x70cd094bfe26931fa9d1d1bf26ce4b00d62ebd59',
    'aggregatorAddress': '0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'mMSFT',
    'address': '0x8853bfbeeb6b044e5db96861d304da92ff655d55',
    'aggregatorAddress': '0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'mAAPL',
    'address': '0x3e55d2d54a60e398283fad37607cdc35a8740c5d',
    'aggregatorAddress': '0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5',
    'block': 9645935,
    'decimals': 8,
  },
  {
    'name': 'YFI',
    'address': '0xbd48ea3a33f80985a5a77a16ff7b0d3ec705b1ab',
    'aggregatorAddress': '0x24959556020AE5D39e5bAEC2bd6Bf12420C25aB5',
    'block': 9645935,
    'decimals': 8,
  },
];

module.exports = {
  data,
  pairs,
};
