import {TypedMap} from "@graphprotocol/graph-ts/index";

export const BNA_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

export const BASE_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

export const SV_VIEW = '0xE574beBdDB460e3E0588F1001D24441102339429';
export const SV_VIEW_V2 = '0x37d57E43EDD5AE0F52248693B7AbD3F9ceC01239';

export const USV = '0x6bAD6A9BcFdA3fd60Da6834aCe5F93B8cFed9598';

export const SV_VIEW_BLOCK_NUM = '15515672';
export const SV_VIEW_V2_BLOCK_NUM = '16289792';

export const PHUTURE_PRICE_ORACLE = '0x384ac33558821383fF4fC73D1DEe3539a74bf540';

export const MANAGED_INDEX_FACTORY = '0xb4e85a5BFCd5f247D4BDa1491F57921473dDcE2e';

export let ChainLinkAssetMap = new TypedMap<string, string>();

ChainLinkAssetMap.set('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x8fffffd4afb6115b954bd326cbe7b4ba576818f6');
ChainLinkAssetMap.set('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419');
