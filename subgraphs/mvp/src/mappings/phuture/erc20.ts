import { Address, BigDecimal, log } from '@graphprotocol/graph-ts';

import { VaultController, vToken } from '../../types/schema';
import { Transfer } from '../../types/templates/erc20/ERC20';
import { vToken as vTokenContract } from '../../types/templates/vToken/vToken';
import { SECONDS_IN_YEAR } from '../../utils/timestamp';

import { updateVaultControllerDailyStat } from './stats';

const BP_BD = BigDecimal.fromString('10000');

export function handleTransfer(event: Transfer): void {
  let fromVToken = vToken.load(event.params.from.toHexString());
  if (fromVToken && fromVToken.asset == event.address.toHexString()) {
    fromVToken.assetReserve = fromVToken.assetReserve.minus(event.params.value);
    fromVToken.totalAmount = fromVToken.assetReserve.plus(fromVToken.deposited);
    fromVToken.save();
  }

  let toVToken = vToken.load(event.params.to.toHexString());
  if (toVToken && toVToken.asset == event.address.toHexString()) {
    toVToken.assetReserve = toVToken.assetReserve.plus(event.params.value);
    toVToken.totalAmount = toVToken.assetReserve.plus(toVToken.deposited);
    toVToken.save();
  }

  let toVaultController = VaultController.load(event.params.to.toHexString());
  // from vToken -> vaultController: deposit
  if (fromVToken && toVaultController) {
    toVaultController.vToken = fromVToken.id;
    toVaultController.depositedAt = event.block.timestamp;
    toVaultController.deposit = event.params.value;
    toVaultController.save();
  }

  let fromVaultController = VaultController.load(
    event.params.from.toHexString(),
  );
  // from vaultController -> vToken: withdraw
  // (86400 * 365)/(now - previousDepositTime) * ln(withdraw / deposit)
  if (fromVaultController && toVToken) {
    fromVaultController.vToken = toVToken.id;
    fromVaultController.withdraw = event.params.value;
    fromVaultController.withdrawnAt = event.block.timestamp;
    fromVaultController.save();

    let vaultControllerApy = BigDecimal.zero();
    if (fromVaultController.deposit.isZero()) {
      log.warning('apy for vToken: {} is zero', [toVToken.id]);
    } else {
      let depositRatio = fromVaultController.withdraw
        .toBigDecimal()
        .div(fromVaultController.deposit.toBigDecimal());
      let ln = BigDecimal.fromString(
        Math.log(
          (depositRatio.digits.toU64() / depositRatio.exp.toU64()) as f64,
        ).toString(),
      );
      let interval = fromVaultController.withdrawnAt
        .minus(fromVaultController.depositedAt)
        .toBigDecimal();

      vaultControllerApy = SECONDS_IN_YEAR.div(interval).times(ln);
    }

    let vTokenC = vTokenContract.bind(Address.fromString(toVToken.id));

    let currentDepositedPercentageInBP = vTokenC.try_currentDepositedPercentageInBP();
    if (currentDepositedPercentageInBP.reverted) {
      log.warning('can not update currentDepositedPercentageInBP: {}', [
        toVToken.id,
      ]);
    } else {
      toVToken.depositedPercentage = currentDepositedPercentageInBP.value;
    }

    updateVaultControllerDailyStat(
      fromVaultController,
      vaultControllerApy,
      toVToken.depositedPercentage,
      event.block.timestamp,
    );

    toVToken.apy = vaultControllerApy.times(
      currentDepositedPercentageInBP.value.toBigDecimal().div(BP_BD),
    );

    toVToken.save();
  }
}
