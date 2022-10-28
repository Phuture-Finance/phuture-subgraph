import {TypedMap} from "@graphprotocol/graph-ts/index";

export const FACTORY_ADDRESS = '0x6d825cE7F220c6cc03fE156F28BE6318e6546Ca8';

export const BNA_ADDRESS = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';

export const SV_VIEW = '';

export const BASE_ASSETS = ["0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e","0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7"];

export let ChainLinkAssetMap = new TypedMap<string, string>();

ChainLinkAssetMap.set('0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', '0x0A77230d17318075983913bC2145DB16C7366156');
