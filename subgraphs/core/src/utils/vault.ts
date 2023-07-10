import { BigDecimal } from '@graphprotocol/graph-ts';
import { Address, BigInt } from '@graphprotocol/graph-ts/index';

import {
  BASE_ADDRESS,
  ChainLinkAssetMap,
  SV_VIEW,
  SV_VIEW_BLOCK_NUM,
  SV_VIEW_V2,
  SV_VIEW_V2_BLOCK_NUM,
} from '../../consts';
import {
  calculateChainLinkPrice,
  convertUSDToETH,
  loadOrCreateChainLink,
} from '../mappings/entities';
import { updateSVDailyStat } from '../mappings/phuture/stats';
import { SVVault } from '../types/schema';
import { Vault } from '../types/SVault/Vault';
import { SVView } from '../types/templates/AggregatorInterface/SVView';

import { convertTokenToDecimal } from './calc';
import { ZERO_ADDRESS } from '@phuture/subgraph-helpers';

// TODO: use decimals from the contract.
const usdcDec = 6;

export function updateVaultTotals(fVault: SVVault): void {
  if (fVault.id == ZERO_ADDRESS) {
    return;
  }
  const vault = Vault.bind(Address.fromString(fVault.id));

  const totalSupply = vault.try_totalSupply();
  if (!totalSupply.reverted) {
    fVault.totalSupply = totalSupply.value;
  }

  let basePrice = calculateChainLinkPrice(
    loadOrCreateChainLink(
      Address.fromString(ChainLinkAssetMap.mustGet(BASE_ADDRESS)),
    ),
  );

  const totalAssets = vault.try_totalAssets();
  if (!totalAssets.reverted) {
    fVault.totalAssets = totalAssets.value;
    fVault.marketCap = basePrice.times(
      convertTokenToDecimal(totalAssets.value, BigInt.fromI32(usdcDec)),
    );
  }
}

export function updateVaultPrice(fVault: SVVault, ts: BigInt): void {
  if (fVault.id == ZERO_ADDRESS) {
    return;
  }

  let basePrice = calculateChainLinkPrice(
    loadOrCreateChainLink(
      Address.fromString(ChainLinkAssetMap.mustGet(BASE_ADDRESS)),
    ),
  );

  if (fVault.decimals && !fVault.totalSupply.isZero()) {
    fVault.basePrice = basePrice.times(
      fVault.totalAssets
        .toBigDecimal()
        .div(convertTokenToDecimal(fVault.totalSupply, BigInt.fromI32(12))),
    );
    fVault.basePriceETH = convertUSDToETH(fVault.basePrice);
  }

  updateSVDailyStat(fVault, ts);
}

export function updateVaultAPY(fVault: SVVault, blockNumber: BigInt): void {
  if (fVault.id == ZERO_ADDRESS) {
    return;
  }
  const viewV2BlockNum = BigInt.fromString(SV_VIEW_V2_BLOCK_NUM);

  if (
    blockNumber.ge(BigInt.fromString(SV_VIEW_BLOCK_NUM)) &&
    blockNumber.lt(viewV2BlockNum)
  ) {
    setVaultAPY(fVault, SV_VIEW);
  } else if (blockNumber.ge(viewV2BlockNum)) {
    setVaultAPY(fVault, SV_VIEW_V2);
  }
}

function setVaultAPY(vault: SVVault, SVViewAddress: string): void {
  const view = SVView.bind(Address.fromString(SVViewAddress));
  const apy = view.try_getAPY(Address.fromString(vault.id));
  if (!apy.reverted) {
    vault.apy = apy.value
      .toBigDecimal()
      .div(BigDecimal.fromString('10_000_000'));
  }
}
