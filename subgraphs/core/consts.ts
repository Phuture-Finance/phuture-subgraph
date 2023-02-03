import { TypedMap } from '@graphprotocol/graph-ts/index';

export const FACTORY_ADDRESS = '0x55ece44c7fb23ef796aed22bb5894a5ab5878780';

export const UNI_ROUTER_ADDRESS = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
export const SUSHI_ROUTER_ADDRESS =
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f';

export const BNA_ADDRESS = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';

export const SV_VIEW = '0x0000000000000000000000000000000000000000';

export const BASE_ASSETS = [
  '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
  '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
];

export let ChainLinkAssetMap = new TypedMap<string, string>();

ChainLinkAssetMap.set(
  '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
  '0x0a77230d17318075983913bc2145db16c7366156',
);
