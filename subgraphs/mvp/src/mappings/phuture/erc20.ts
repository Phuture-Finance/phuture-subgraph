import {Transfer} from "../../types/templates/erc20/ERC20";
import {VaultController, vToken} from "../../types/schema";
import {Address, BigDecimal, BigInt, log} from "@graphprotocol/graph-ts";
import {vToken as vTokenContract} from '../../types/templates/vToken/vToken';

export function handleTransfer(event: Transfer): void {
    let fromVT = vToken.load(event.params.from.toHexString());
    if (fromVT && fromVT.asset == event.address.toHexString()) {
        fromVT.assetReserve = fromVT.assetReserve.minus(event.params.value);
        fromVT.totalAmount = fromVT.assetReserve.plus(fromVT.deposited);
        fromVT.save();
    }

    let toVT = vToken.load(event.params.to.toHexString());
    if (toVT && toVT.asset == event.address.toHexString()) {
        toVT.assetReserve = toVT.assetReserve.plus(event.params.value);
        toVT.totalAmount = toVT.assetReserve.plus(toVT.deposited);
        toVT.save();
    }

    let toVC = VaultController.load(event.params.to.toHexString());
    // from vToken -> vaultController: deposit
    if (fromVT && toVC) {
        toVC.vToken = fromVT.id;
        toVC.depositedAt = event.block.timestamp;
        toVC.deposit = event.params.value;
        toVC.save();
    }

    let fromVC = VaultController.load(event.params.from.toHexString());
    // from vaultController -> vToken: withdraw
    // (86400 * 365)/(now - previousDepositTime) * ln(withdraw / deposit)
    if (fromVC && toVT) {
        fromVC.vToken = toVT.id;
        fromVC.withdraw = event.params.value;
        fromVC.withdrawnAt = event.block.timestamp;
        fromVC.save();

        let ln = BigDecimal.fromString(Math.log(fromVC.withdraw.div(fromVC.deposit).toI32()).toString());
        let interval = fromVC.withdrawnAt.minus(fromVC.depositedAt).toBigDecimal();
        if (interval.equals(BigDecimal.zero())) {
            log.error('inter: {}', [toVT.id]);
        }

        toVT.apr = BigInt.fromU32(86400 * 365).toBigDecimal().div(interval).times(ln);

        let vtC = vTokenContract.bind(Address.fromString(toVT.id));
        let dp = vtC.try_currentDepositedPercentageInBP();
        if (!dp.reverted) {
            toVT.depositedPercentage = dp.value;
            toVT.apr = toVT.apr.times(dp.value.toBigDecimal().div(BigDecimal.fromString('10000')));
        } else {
            log.error('can not update currentDepositedPercentageInBP: {}', [toVT.id]);
        }

        toVT.save();
    }
}
