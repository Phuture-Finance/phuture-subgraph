import {Vault} from '../../types/SVault/Vault';
import {SVVault} from '../../types/schema';
import {Address, BigInt} from "@graphprotocol/graph-ts";
import {feeInBP} from "../../utils/calc";
import {BNA_ADDRESS, ChainLinkAssetMap} from "../../../consts";
import {loadOrCreateChainLink} from "./ChainLink";

export function loadOrCreateSVVault(addr: Address, ts: BigInt): SVVault {
    let id = addr.toHexString();

    let vault = SVVault.load(id);
    if (!vault) {
        vault = new SVVault(id);

        let sv = Vault.bind(addr);

        let totalAssets = sv.try_totalAssets();
        if (!totalAssets.reverted) {
            vault.totalAssets = totalAssets.value;
        }

        let bFeeBP = sv.try_BURNING_FEE_IN_BP();
        if (!bFeeBP.reverted) {
            vault.feeBurn = bFeeBP.value;
        }

        let mFeeBP = sv.try_MINTING_FEE_IN_BP();
        if (!mFeeBP.reverted) {
            vault.feeMint = mFeeBP.value;
        }

        let aum = sv.try_AUM_SCALED_PER_SECONDS_RATE();
        if (!aum.reverted) {
            vault.feeAUMPercent = feeInBP(aum.value);
        }

        let symbol = sv.try_symbol();
        if (!symbol.reverted) {
            vault.symbol = symbol.value;
        }

        let decimals = sv.try_decimals();
        if (!decimals.reverted) {
            vault.decimals = BigInt.fromI32(decimals.value);
        }

        let name = sv.try_name();
        if (!name.reverted) {
            vault.name = name.value;
        }

        vault.mint = [];
        vault.redeem = [];

        vault.created = ts;

        vault.save();

        // Attach base asset ChainLink aggregator to update vaults prices.
        let chl = loadOrCreateChainLink(Address.fromString(ChainLinkAssetMap.mustGet(BNA_ADDRESS)));

        let vaults  = chl.vaults;
        if (vaults) {
            vaults.push(vault.id);
        } else {
            vaults = [vault.id];
        }
        chl.vaults = vaults;
        chl.save();
    }

    return vault as SVVault;
}
