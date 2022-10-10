import {TypedMap} from "@graphprotocol/graph-ts/index";

export const FACTORY_ADDRESS = '{{ManagedIndexFactory}}';

export const UNI_FACTORY_ADDRESS = '{{UniswapV2Factory}}';
export const UNI_ROUTER_ADDRESS = '{{UniswapV2Router}}';
export const SUSHI_FACTORY_ADDRESS = '{{SushiV2Factory}}';
export const SUSHI_ROUTER_ADDRESS = '{{SushiswapV2Router}}';

export const USDC_ADDRESS = '{{Base}}';
export const BNA_ADDRESS = '{{BaseNetworkAsset}}';

export const SV_VIEW = '{{SVView}}';

export const BASE_ASSETS = {{{BaseAssets}}};

export let ChainLinkAssetMap = new TypedMap<string, string>();

{{#ChainLinkAssetMap}}
ChainLinkAssetMap.set('{{ address }}', '{{ aggregatorAddress }}');
{{/ChainLinkAssetMap}}