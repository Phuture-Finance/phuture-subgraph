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
ChainLinkAssetMap.set('0x6b175474e89094c44da98b954eedeac495271d0f', '0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9');
ChainLinkAssetMap.set('0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e', '0xa027702dbb89fbd58938e4324ac03b58d812b0e1');
ChainLinkAssetMap.set('0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', '0x553303d460ee0afb37edff9be42922d8ff63220e');
ChainLinkAssetMap.set('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', '0xf4030086522a5beea4988f8ca5b36dbc97bee88c');
ChainLinkAssetMap.set('0x514910771af9ca656af840dff83e8264ecf986ca', '0x2c1d072e956affc0d435cb7ac38ef18d24d9127c');
ChainLinkAssetMap.set('0x6b3595068778dd592e39a122f4f5a5cf09c90fe2', '0x7213536a36094cD8a768a5E45203Ec286Cba2d74');
ChainLinkAssetMap.set('0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', '0x547a514d5e3769680ce22b2361c10ea13619e8a9');
ChainLinkAssetMap.set('0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', '0x908EDc7E1974Ecab1cA7164424BC4Cac287D83Ad');
ChainLinkAssetMap.set('0xc00e94cb662c3520282e6f5717214004a7f26888', '0xdbd020caef83efd542f4de03e3cf0c28a4428bd5');
ChainLinkAssetMap.set('0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', '0xdc3ea94cd0ac27d9a86c180091e7f78c683d3699');
ChainLinkAssetMap.set('0xd533a949740bb3306d119cc777fa900ba034cd52', '0xb4c4a493AB6356497713A78FFA6c60FB53517c63');
ChainLinkAssetMap.set('0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5', '0x7009033C0d6702fd2dfAD3478d2AE4e3b6aCB966');
ChainLinkAssetMap.set('0xd291e7a03283640fdc51b121ac401383a46cc623', '0x1Ee7399b07E626A42D8D87Dc4A2a0C2D952C1BBB');
