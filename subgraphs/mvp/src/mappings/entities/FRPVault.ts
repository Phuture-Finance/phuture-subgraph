import {FRPVault} from '../../types/FRPVault/FRPVault';
import {FrpVault} from '../../types/schema';
import {Address, BigInt} from "@graphprotocol/graph-ts";
import {feeInBP} from "../../utils/calc";

export function loadOrCreateFrpVault(addr: Address, ts: BigInt): FrpVault {
    let id = addr.toHexString();

    let fVault = FrpVault.load(id);
    if (!fVault) {
        fVault = new FrpVault(id);

        let frp = FRPVault.bind(addr);

        let totalAssets = frp.try_totalAssets();
        if (!totalAssets.reverted) {
            fVault.totalAssets = totalAssets.value;
        }

        let bFeeBP = frp.try_BURNING_FEE_IN_BP();
        if (!bFeeBP.reverted) {
            fVault.feeBurn = bFeeBP.value;
        }

        let mFeeBP = frp.try_MINTING_FEE_IN_BP();
        if (!mFeeBP.reverted) {
            fVault.feeMint = mFeeBP.value;
        }

        let aum = frp.try_AUM_SCALED_PER_SECONDS_RATE();
        if (!aum.reverted) {
            fVault.feeAUMPercent = feeInBP(aum.value);
        }

        let symbol = frp.try_symbol();
        if (!symbol.reverted) {
            fVault.symbol = symbol.value;
        }

        let decimals = frp.try_decimals();
        if (!decimals.reverted) {
            fVault.decimals = BigInt.fromI32(decimals.value);
        }

        let name = frp.try_name()
        if (!name.reverted) {
            fVault.name = name.value;
        }

        fVault.mint = [];
        fVault.redeem = [];

        fVault.created = ts;
    }

    fVault.save();

    return fVault as FrpVault;
}