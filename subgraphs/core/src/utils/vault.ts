import { BigDecimal } from '@graphprotocol/graph-ts';
import { Address, BigInt } from '@graphprotocol/graph-ts/index';

import {
  SV_VIEW,
  SV_VIEW_BLOCK_NUM,
  SV_VIEW_V2,
  SV_VIEW_V2_BLOCK_NUM,
} from '../../consts';
import { convertUSDToETH } from '../mappings/entities';
import { updateSVDailyStat } from '../mappings/phuture/stats';
import { SVVault } from '../types/schema';
import { Vault } from '../types/SVault/Vault';
import { SVView } from '../types/SVault/SVView';

import { convertTokenToDecimal } from './calc';
import { ZERO_ADDRESS } from '@phuture/subgraph-helpers';

// TODO: use decimals from the contract.
const usdcDec = 6;

export function updateVaultTotals(
  svVault: SVVault,
  basePrice: BigDecimal,
): void {
  if (svVault.id == ZERO_ADDRESS) {
    return;
  }
  const vault = Vault.bind(Address.fromString(svVault.id));

  const totalSupply = vault.try_totalSupply();
  if (!totalSupply.reverted) {
    svVault.totalSupply = totalSupply.value;
  }

  const totalAssets = vault.try_totalAssets();
  if (!totalAssets.reverted) {
    svVault.totalAssets = totalAssets.value;
    svVault.marketCap = basePrice.times(
      convertTokenToDecimal(totalAssets.value, BigInt.fromI32(usdcDec)),
    );
  }
}

export function updateVaultPrice(
  svVault: SVVault,
  basePrice: BigDecimal,
  ts: BigInt,
): void {
  if (svVault.id == ZERO_ADDRESS) {
    return;
  }

  if (svVault.decimals && !svVault.totalSupply.isZero()) {
    svVault.basePrice = basePrice.times(
      svVault.totalAssets
        .toBigDecimal()
        .div(convertTokenToDecimal(svVault.totalSupply, BigInt.fromI32(12))),
    );
    svVault.basePriceETH = convertUSDToETH(svVault.basePrice);
  }

  updateSVDailyStat(svVault, ts);
}

export function updateVaultAPY(svVault: SVVault, blockNumber: BigInt): void {
  if (svVault.id == ZERO_ADDRESS) {
    return;
  }
  const viewV2BlockNum = BigInt.fromString(SV_VIEW_V2_BLOCK_NUM);

  if (
    blockNumber.ge(BigInt.fromString(SV_VIEW_BLOCK_NUM)) &&
    blockNumber.lt(viewV2BlockNum)
  ) {
    setVaultAPY(svVault, SV_VIEW);
  } else if (blockNumber.ge(viewV2BlockNum)) {
    setVaultAPY(svVault, SV_VIEW_V2);
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
