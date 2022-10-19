import { TypedMap } from '@graphprotocol/graph-ts/index';

export const FACTORY_ADDRESS = '0xb4e85a5bfcd5f247d4bda1491f57921473ddce2e';

export const UNI_FACTORY_ADDRESS = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f';
export const UNI_ROUTER_ADDRESS = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
export const SUSHI_FACTORY_ADDRESS =
  '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac';
export const SUSHI_ROUTER_ADDRESS =
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f';

export const BNA_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

export const SV_VIEW = '0xe574bebddb460e3e0588f1001d24441102339429';

export const BASE_ASSETS = [
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x6b175474e89094c44da98b954eedeac495271d0f',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
];

export let ChainLinkAssetMap = new TypedMap<string, string>();

ChainLinkAssetMap.set(
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0x8fffffd4afb6115b954bd326cbe7b4ba576818f6',
);
ChainLinkAssetMap.set(
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
);
ChainLinkAssetMap.set(
  '0x6b175474e89094c44da98b954eedeac495271d0f',
  '0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9',
);
ChainLinkAssetMap.set(
  '0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5',
  '0x7009033c0d6702fd2dfad3478d2ae4e3b6acb966',
);
ChainLinkAssetMap.set(
  '0xd291e7a03283640fdc51b121ac401383a46cc623',
  '0x1ee7399b07e626a42d8d87dc4a2a0c2d952c1bbb',
);
ChainLinkAssetMap.set(
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  '0x553303d460ee0afb37edff9be42922d8ff63220e',
);
ChainLinkAssetMap.set(
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  '0x547a514d5e3769680ce22b2361c10ea13619e8a9',
);
ChainLinkAssetMap.set(
  '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
  '0x4e844125952d32acdf339be976c98e22f6f318db',
);
ChainLinkAssetMap.set(
  '0xc00e94cb662c3520282e6f5717214004a7f26888',
  '0xdbd020caef83efd542f4de03e3cf0c28a4428bd5',
);
ChainLinkAssetMap.set(
  '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
  '0xa027702dbb89fbd58938e4324ac03b58d812b0e1',
);
ChainLinkAssetMap.set(
  '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
  '0xcc70f09a6cc17553b2e31954cd36e4a2d89501f7',
);
ChainLinkAssetMap.set(
  '0xdbdb4d16eda451d0503b854cf79d55697f90c8df',
  '0xc355e4c0b3ff4ed0b49eaacd55fe29b311f42976',
);
