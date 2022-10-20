import {Vault} from '../../src/types/SVault/Vault';
import {SVVault} from '../../types/schema';
import {Address, BigInt} from "@graphprotocol/graph-ts";
import {feeInBP} from "../../utils/calc";

export function loadOrCreateSVVault(addr: Address, ts: BigInt): SVVault {
    let id = addr.toHexString();

    let vault = SVVault.load(id);
    if (!vault) {
        vault = new SVVault(id);

        let frp = Vault.bind(addr);

        let totalAssets = frp.try_totalAssets();
        if (!totalAssets.reverted) {
            vault.totalAssets = totalAssets.value;
        }

        let bFeeBP = frp.try_BURNING_FEE_IN_BP();
        if (!bFeeBP.reverted) {
            vault.feeBurn = bFeeBP.value;
        }

        let mFeeBP = frp.try_MINTING_FEE_IN_BP();
        if (!mFeeBP.reverted) {
            vault.feeMint = mFeeBP.value;
        }

        let aum = frp.try_AUM_SCALED_PER_SECONDS_RATE();
        if (!aum.reverted) {
            vault.feeAUMPercent = feeInBP(aum.value);
        }

        let symbol = frp.try_symbol();
        if (!symbol.reverted) {
            vault.symbol = symbol.value;
        }

        let decimals = frp.try_decimals();
        if (!decimals.reverted) {
            vault.decimals = BigInt.fromI32(decimals.value);
        }

        let name = frp.try_name()
        if (!name.reverted) {
            vault.name = name.value;
        }

        vault.mint = [];
        vault.redeem = [];

        vault.created = ts;
    }

    vault.save();

    return vault as SVVault;
}
