import {TypedMap} from "@graphprotocol/graph-ts/index";

export const FACTORY_ADDRESS = '0xd0ff91311967d8279fdcd0d3fa8c49e07b5f2380';

export const UNI_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
export const UNI_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
export const SUSHI_FACTORY_ADDRESS = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac';
export const SUSHI_ROUTER_ADDRESS = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';

export const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
export const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f';
export const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

export const BASE_ASSETS = ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","0x6B175474E89094C44Da98b954EedeAC495271d0F","0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984","0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"];

export let ChainLinkAssetMap = new TypedMap<string, string>();

ChainLinkAssetMap.set('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x8fffffd4afb6115b954bd326cbe7b4ba576818f6');
ChainLinkAssetMap.set('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419');
