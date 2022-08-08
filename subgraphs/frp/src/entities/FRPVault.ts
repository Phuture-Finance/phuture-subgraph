import {FRPVault} from '../types/FRPVault/FRPVault';
import {FrpVault} from "../types/schema";
import {Address, BigInt} from "@graphprotocol/graph-ts";
import {convertTokenToDecimal} from "@phuture/mvp-subgraph/src/utils/calc";

export function loadOrCreateFrpVault(addr: Address): FrpVault {
    let id = addr.toHexString();

    let fVault = FrpVault.load(id);
    if (!fVault) {
        fVault = new FrpVault(id);

        let frp = FRPVault.bind(addr);

        let totalAssets = frp.try_totalAssets();
        if (!totalAssets.reverted) {
            fVault.totalAssets = totalAssets.value;
        }

        let totalSupply = frp.try_totalSupply();
        if (!totalSupply.reverted) {
            fVault.totalSupply = totalSupply.value;
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

        if (fVault.totalSupply && fVault.decimals) {
            fVault.price = fVault.totalAssets.toBigDecimal().div(convertTokenToDecimal(fVault.totalSupply, BigInt.fromI32(12)));
        }

        fVault.mint = [];
        fVault.redeem = [];
    }

    fVault.save();

    return fVault as FrpVault;
}