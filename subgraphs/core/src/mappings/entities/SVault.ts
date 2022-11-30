import { Address, BigInt } from '@graphprotocol/graph-ts';

import { BNA_ADDRESS, ChainLinkAssetMap } from '../../../consts';
import { SVVault } from '../../types/schema';
import { Vault } from '../../types/SVault/Vault';
import { feeInBP } from '../../utils/calc';

import { loadOrCreateChainLink } from './ChainLink';

export function loadOrCreateSVVault(addr: Address, ts: BigInt): SVVault {
  let id = addr.toHexString();

  let vault = SVVault.load(id);
  if (!vault) {
    vault = new SVVault(id);

    let vaultContract = Vault.bind(addr);

    let totalAssets = vaultContract.try_totalAssets();
    if (!totalAssets.reverted) {
      vault.totalAssets = totalAssets.value;
    }

    let burningFeeInBP = vaultContract.try_BURNING_FEE_IN_BP();
    if (!burningFeeInBP.reverted) {
      vault.feeBurn = burningFeeInBP.value;
    }

    let mintingFeeInBP = vaultContract.try_MINTING_FEE_IN_BP();
    if (!mintingFeeInBP.reverted) {
      vault.feeMint = mintingFeeInBP.value;
    }

    let aumFee = vaultContract.try_AUM_SCALED_PER_SECONDS_RATE();
    if (!aumFee.reverted) {
      vault.feeAUMPercent = feeInBP(aumFee.value);
    }

    let symbol = vaultContract.try_symbol();
    if (!symbol.reverted) {
      vault.symbol = symbol.value;
    }

    let decimals = vaultContract.try_decimals();
    if (!decimals.reverted) {
      vault.decimals = BigInt.fromI32(decimals.value);
    }

    let name = vaultContract.try_name();
    if (!name.reverted) {
      vault.name = name.value;
    }

    vault.created = ts;

    vault.save();

    // Attach base asset ChainLink aggregator to update vaults prices.
    let aggregator = loadOrCreateChainLink(
      Address.fromString(ChainLinkAssetMap.mustGet(BNA_ADDRESS)),
    );

    let vaults = aggregator.vaults;
    if (vaults) {
      vaults.push(vault.id);
    } else {
      vaults = [vault.id];
    }
    aggregator.vaults = vaults;

    aggregator.save();
  }

  return vault;
}
