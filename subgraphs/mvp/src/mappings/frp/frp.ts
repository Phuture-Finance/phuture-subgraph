import {wfCashBase} from '../../types/FRPVault/wfCashBase';

import {
    FCashMinted as FCashMintedEvent,
    FCashRedeemed as FCashRedeemedEvent,
    Transfer as TransferEvent,
    Deposit as DepositEvent,
    Withdraw as WithdrawEvent, FRPVault
} from '../../types/FRPVault/FRPVault';
import {FCash, FrpTransfer, UserVault} from '../../types/schema';
import {Address, BigDecimal, BigInt} from "@graphprotocol/graph-ts";
import {convertDecimals, convertTokenToDecimal} from "../../../src/utils/calc";
import {loadOrCreateFrpVault} from "../entities/FRPVault";
import {loadOrCreateAccount} from "../entities/Account";

const fCashDec = 8;
const usdcDec = 6;

const threeMonthSecond = BigInt.fromI32(60 * 60 * 24 * 30 * 3);
const sixMonthSecond = BigInt.fromI32(60 * 60 * 24 * 30 * 6);
const oneYearSecond = BigInt.fromI32(60 * 60 * 24 * 365);


// sync event

export function handleTransfer(event: TransferEvent): void {
    let fVault = loadOrCreateFrpVault(event.address);

    if (!fVault.totalSupply.isZero() && fVault.decimals) {
        fVault.price = fVault.totalAssets.toBigDecimal().div(convertTokenToDecimal(fVault.totalSupply, BigInt.fromI32(12)));
    }

    loadOrCreateAccount(event.params.from);
    loadOrCreateAccount(event.params.to);

    let transferType: string;
    if (event.params.from.equals(Address.zero())) {
        fVault.totalSupply = fVault.totalSupply.plus(event.params.value);
        transferType = 'Mint';
    } else if (event.params.to.equals(Address.zero())) {
        fVault.totalSupply = fVault.totalSupply.minus(event.params.value);
        transferType = 'Burn';
    } else {
        transferType = 'Send';
    }

    if (!event.params.from.equals(Address.zero())) {
        let fromUserId = event.params.from.toHexString().concat('-').concat(event.address.toHexString());
        let fromUser = UserVault.load(fromUserId);
        if (!fromUser) {
            fromUser = new UserVault(fromUserId);
            fromUser.frp = event.address.toHexString();
            fromUser.user = event.params.from.toHexString();
            fromUser.balance = BigDecimal.zero();
        }

        fromUser.balance = fromUser.balance.minus(event.params.value.toBigDecimal());
        if (!fVault.totalSupply.isZero()) {
            fromUser.capitalization = convertDecimals(fromUser.balance, fVault.decimals).times(
                fVault.totalAssets.toBigDecimal().div(convertTokenToDecimal(fVault.totalSupply, fVault.decimals))
            );
        }

        if (fromUser.balance == BigDecimal.zero()) {
            fVault.uniqueHolders = fVault.uniqueHolders.minus(BigInt.fromI32(1));
        }

        fromUser.save();
    }

    if (!event.params.to.equals(Address.zero())) {
        let toUserId = event.params.to.toHexString().concat('-').concat(event.address.toHexString());
        let toUser = UserVault.load(toUserId);
        if (!toUser) {
            toUser = new UserVault(toUserId);
            toUser.frp = event.address.toHexString();
            toUser.user = event.params.from.toHexString();
            toUser.balance = BigDecimal.zero();
        }

        if (toUser.balance == BigDecimal.zero()) {
            fVault.uniqueHolders = fVault.uniqueHolders.plus(BigInt.fromI32(1));
        }

        toUser.balance = toUser.balance.plus(event.params.value.toBigDecimal());
        if (!fVault.totalSupply.isZero()) {
            toUser.capitalization = convertDecimals(toUser.balance, fVault.decimals).times(
                fVault.totalAssets.toBigDecimal().div(convertTokenToDecimal(fVault.totalSupply, fVault.decimals))
            );
        }

        toUser.save();
    }

    let trFrom = FrpTransfer.load(event.params.from.toHexString());
    if (!trFrom) {
        trFrom = new FrpTransfer(event.transaction.hash.toHexString());
        trFrom.to = event.params.to.toHexString();
        trFrom.from = event.params.from.toHexString();
        trFrom.value = event.params.value;
        trFrom.timestamp = event.block.timestamp;
        trFrom.type = transferType;
        trFrom.save();
    }

    let trTo = FrpTransfer.load(event.transaction.hash.toHexString());
    if (!trTo) {
        trTo = new FrpTransfer(event.params.to.toHexString());
        trTo.to = event.params.to.toHexString();
        trTo.from = event.params.from.toHexString();
        trTo.value = event.params.value;
        trTo.timestamp = event.block.timestamp;
        trTo.type = transferType;
        trTo.save();
    }

    fVault.save();
}

// make contract call totalAssets
// update price
export function handleFCashMinted(event: FCashMintedEvent): void {
    let fVault = loadOrCreateFrpVault(event.address);

    let frp = FRPVault.bind(Address.fromString(fVault.id));
    let totalSupply = frp.try_totalSupply();
    if (!totalSupply.reverted) {
        fVault.totalSupply = totalSupply.value;
    }


    let id = event.params._fCashPosition.toHexString().concat("-");
    id = id.concat(event.block.timestamp.toString()).concat("-");
    id = id.concat(event.logIndex.toString());

    let fc = new FCash(id);

    let wfc = wfCashBase.bind(event.params._fCashPosition);
    let mt = wfc.try_getMaturity();
    if (!mt.reverted) {
        fc.maturity = mt.value;
    }

    fc.vault = event.address.toHexString();
    fc.position = event.params._fCashPosition.toHexString();
    fc.amount = event.params._fCashAmount;
    fc.assetAmount = event.params._assetAmount;
    fc.timestamp = event.block.timestamp;
    fc.isRedeem = false;
    fc.save();

    let mint = [] as Array<string>;
    for (let i = 0; i < fVault.mint.length; i++) {
        let oldFc = FCash.load(fVault.mint[i]);
        if (oldFc && oldFc.maturity.gt(event.block.timestamp)) {
            mint.push(oldFc.id);
        }
    }
    mint.push(id);
    fVault.mint = mint;

    fVault.apr = calculateAPR(fVault.mint.concat(fVault.redeem), event.block.timestamp);

    fVault.save();
}

export function handleFCashRedeemed(event: FCashRedeemedEvent): void {
    let fVault = loadOrCreateFrpVault(event.address);

    let id = event.params._fCashPosition.toHexString().concat("-");
    id = id.concat(event.block.timestamp.toString()).concat("-");
    id = id.concat(event.logIndex.toString());

    let fc = new FCash(id);

    let wfc = wfCashBase.bind(event.params._fCashPosition);
    let mt = wfc.try_getMaturity();
    if (!mt.reverted) {
        fc.maturity = mt.value;
    }

    fc.vault = event.address.toHexString();
    fc.position = event.params._fCashPosition.toHexString();
    fc.amount = event.params._fCashAmount;
    fc.assetAmount = event.params._assetAmount;
    fc.timestamp = event.block.timestamp;
    fc.isRedeem = true;
    fc.save();

    let redeem = [] as Array<string>;
    for (let i = 0; i < fVault.redeem.length; i++) {
        let oldFc = FCash.load(fVault.redeem[i]);
        if (oldFc && oldFc.maturity.gt(event.block.timestamp)) {
            redeem.push(oldFc.id);
        }
    }
    redeem.push(id);
    fVault.redeem = redeem;

    fVault.apr = calculateAPR(fVault.mint.concat(fVault.redeem), event.block.timestamp);

    fVault.save();
}

export function calculateAPR(fCash: Array<string>, ts: BigInt): BigDecimal {
    let threeMonth = [] as Array<FCash>;
    let sixMonth = [] as Array<FCash>;

    let arp = BigDecimal.zero();

    for (let i = 0; i < fCash.length; i++) {
        let fc = FCash.load(fCash[i]);
        if (!fc) continue;
        let delta = fc.maturity.minus(ts);
        if (delta.lt(threeMonthSecond)) {
            threeMonth.push(fc)
        } else if (delta.lt(sixMonthSecond)) {
            sixMonth.push(fc)
        }
    }

    let totalAssetAmount = BigInt.zero();
    let totalFCash = BigInt.zero();
    for (let i = 0; i < threeMonth.length; i++) {
        totalAssetAmount = totalAssetAmount.plus(threeMonth[i].assetAmount);
        totalFCash = totalFCash.plus(threeMonth[i].amount);
    }

    if (!totalAssetAmount.isZero() && !totalFCash.isZero()) {
        let totalFCashDec = convertTokenToDecimal(totalFCash, BigInt.fromI32(fCashDec));
        let totalAssetAmountDec = convertTokenToDecimal(totalAssetAmount, BigInt.fromI32(usdcDec))
        arp = arp.plus(
            totalFCashDec.div(totalAssetAmountDec)
                .minus(BigInt.fromI32(1).toBigDecimal())
                .div(threeMonthSecond.toBigDecimal())
                .times(oneYearSecond.toBigDecimal())
        );
    }

    totalAssetAmount = BigInt.zero();
    totalFCash = BigInt.zero();
    for (let i = 0; i < sixMonth.length; i++) {
        totalAssetAmount = totalAssetAmount.plus(sixMonth[i].assetAmount);
        totalFCash = totalFCash.plus(sixMonth[i].amount);
    }

    if (!totalAssetAmount.isZero() && !totalFCash.isZero()) {
        let totalFCashDec = convertTokenToDecimal(totalFCash, BigInt.fromI32(fCashDec));
        let totalAssetAmountDec = convertTokenToDecimal(totalAssetAmount, BigInt.fromI32(usdcDec))
        arp = arp.plus(
            totalFCashDec.div(totalAssetAmountDec)
                .minus(BigInt.fromI32(1).toBigDecimal())
                .div(sixMonthSecond.toBigDecimal())
                .times(oneYearSecond.toBigDecimal())
        );
    }

    return arp;
}

export function handleDeposit(event: DepositEvent): void {}

export function handleWithdraw(event: WithdrawEvent): void {}