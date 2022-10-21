import { BigDecimal } from '@graphprotocol/graph-ts';
import { Address, BigInt } from '@graphprotocol/graph-ts/index';

import { SV_VIEW } from '../../consts';
import { convertUSDToETH } from '../mappings/entities';
import {
  updateSVDailyCapitalisation,
  updateSVDailyStat,
} from '../mappings/phuture/stats';
import { SVVault } from '../types/schema';
import { Vault } from '../types/SVault/Vault';
import { SVView } from '../types/templates/AggregatorInterface/SVView';

import { convertTokenToDecimal } from './calc';

// TODO: use decimals from the contract.
const usdcDec = 6;

export function updateVaultTotals(fVault: SVVault): void {
  const vault = Vault.bind(Address.fromString(fVault.id));

  const totalSupply = vault.try_totalSupply();
  if (!totalSupply.reverted) {
    fVault.totalSupply = totalSupply.value;
  }

  const totalAssets = vault.try_totalAssets();
  if (!totalAssets.reverted) {
    fVault.totalAssets = totalAssets.value;
    fVault.marketCap = convertTokenToDecimal(
      totalAssets.value,
      BigInt.fromI32(usdcDec),
    );
  }
}

export function updateVaultPrice(fVault: SVVault, ts: BigInt): void {
  if (fVault.decimals && !fVault.totalSupply.isZero()) {
    fVault.basePrice = fVault.totalAssets
      .toBigDecimal()
      .div(convertTokenToDecimal(fVault.totalSupply, BigInt.fromI32(12)));
    fVault.basePriceETH = convertUSDToETH(fVault.basePrice);
  }

  updateSVDailyCapitalisation(fVault, ts);
  updateSVDailyStat(fVault, ts);
}

export function updateVaultAPY(fVault: SVVault): void {
  const view = SVView.bind(Address.fromString(SV_VIEW));

  const apy = view.try_getAPY(Address.fromString(fVault.id));
  if (!apy.reverted) {
    fVault.apy = apy.value
      .toBigDecimal()
      .div(BigDecimal.fromString('10_000_000'));
  }
}
