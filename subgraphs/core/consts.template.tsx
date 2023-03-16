import {TypedMap} from "@graphprotocol/graph-ts/index";

export const BNA_ADDRESS = '{{BaseNetworkAsset}}';

export const BASE_ADDRESS = '{{Base}}';

export const SV_VIEW = '{{SVViewV1}}';
export const SV_VIEW_V2 = '{{SVViewV2}}';

export const USV = '{{SVault}}';

export const SV_VIEW_BLOCK_NUM = '{{SVViewV1BlockNumber}}';
export const SV_VIEW_V2_BLOCK_NUM = '{{SVViewV2BlockNumber}}';

export const PHUTURE_PRICE_ORACLE = '{{PhuturePriceOracle}}';

export const MANAGED_INDEX_FACTORY = '{{ManagedIndexFactory}}';

export let ChainLinkAssetMap = new TypedMap<string, string>();

{{#ChainLinkAssetMap}}
ChainLinkAssetMap.set('{{ address }}', '{{ aggregatorAddress }}');
{{/ChainLinkAssetMap}}