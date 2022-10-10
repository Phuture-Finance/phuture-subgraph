import {SVVault} from "../types/schema";
import {Vault} from "../types/SVault/Vault";
import {Address, BigInt} from "@graphprotocol/graph-ts/index";
import {convertTokenToDecimal} from "./calc";
import {convertUSDToETH} from "../mappings/entities";
import {updateSVDailyCapitalisation, updateSVDailyStat} from "../mappings/phuture/stats";
import {SVView} from "../types/templates/AggregatorInterface/SVView";
import {SV_VIEW} from "../../consts";
import {BigDecimal} from "@graphprotocol/graph-ts";

const usdcDec = 6;

export function updateVaultTotals(fVault: SVVault): void {
    let vault = Vault.bind(Address.fromString(fVault.id));

    let totalSupply = vault.try_totalSupply();
    if (!totalSupply.reverted) {
        fVault.totalSupply = totalSupply.value;
    }

    let totalAssets = vault.try_totalAssets();
    if (!totalAssets.reverted) {
        fVault.totalAssets = totalAssets.value;
        fVault.marketCap = convertTokenToDecimal(totalAssets.value, BigInt.fromI32(usdcDec));
    }
}

export function updateVaultPrice(fVault: SVVault, ts: BigInt): void {
    if (!fVault.totalSupply.isZero() && fVault.decimals) {
        fVault.basePrice = fVault.totalAssets.toBigDecimal().div(convertTokenToDecimal(fVault.totalSupply, BigInt.fromI32(12)));
        fVault.basePriceETH = convertUSDToETH(fVault.basePrice);
    }

    updateSVDailyCapitalisation(fVault, ts);
    updateSVDailyStat(fVault, ts);
}

export function updateVaultAPY(fVault: SVVault): void {
    let view = SVView.bind(Address.fromString(SV_VIEW));

    let apy = view.try_getAPY(Address.fromString(fVault.id));
    if (!apy.reverted) {
        fVault.apy = apy.value.toBigDecimal().div(BigDecimal.fromString('10000000'));
    }
}
