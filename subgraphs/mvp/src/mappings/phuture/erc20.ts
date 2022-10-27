import { Address, BigDecimal, log } from '@graphprotocol/graph-ts';
import { BigInt } from '@graphprotocol/graph-ts/index';

import { BP_BD } from '../../../../helpers';
import { VaultController, vToken } from '../../types/schema';
import { Transfer } from '../../types/templates/erc20/ERC20';
import { vToken as vTokenContract } from '../../types/templates/vToken/vToken';
import { SECONDS_IN_YEAR } from '../../utils/timestamp';

import { updateVaultControllerDailyStat } from './stats';

export function handleTransfer(event: Transfer): void {
  let to = event.params.to.toHexString();
  let from = event.params.from.toHexString();
  let value = event.params.value;
  let asset = event.address.toHexString();
  let ts = event.block.timestamp;

  tryTransferToVToken(from, to, asset, value, ts);
  tryTransferFromVToken(from, to, asset, value, ts);
}

function tryTransferToVToken(
  from: string,
  to: string,
  asset: string,
  value: BigInt,
  ts: BigInt,
): void {
  let toVToken = vToken.load(to);
  if (toVToken && toVToken.asset == asset) {
    toVToken.assetReserve = toVToken.assetReserve.plus(value);
    toVToken.totalAmount = toVToken.assetReserve.plus(toVToken.deposited);

    let fromVaultController = VaultController.load(from);
    if (fromVaultController) {
      fromVaultController.vToken = toVToken.id;
      fromVaultController.withdraw = value;
      fromVaultController.withdrawnAt = ts;

      fromVaultController.save();

      let vaultControllerApy = BigDecimal.zero();
      if (fromVaultController.deposit.isZero()) {
        log.warning('apy for vToken: {} is zero', [toVToken.id]);
      } else {
        // (86400 * 365)/(now - previousDepositTime) * ln(withdraw / deposit)

        // Ratio between a deposit and withdraw asset values.
        let depositRatio = value
          .toBigDecimal()
          .div(fromVaultController.deposit.toBigDecimal());

        // Deposit ratio logarithm. The percentage yield for the period.
        let ln = BigDecimal.fromString(
          Math.log(
            parseFloat(
              depositRatio
                .times(BigDecimal.fromString('1000000000000000000'))
                .toString(),
            ) / 1000000000000000000,
          ).toString(),
        );

        // Time difference between a deposit and withdraw.
        let interval = ts.minus(fromVaultController.depositedAt).toBigDecimal();

        vaultControllerApy = SECONDS_IN_YEAR.times(ln).div(interval);
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
        ts,
      );

      toVToken.apy = vaultControllerApy.gt(BigDecimal.zero())
        ? vaultControllerApy.times(
            currentDepositedPercentageInBP.value.toBigDecimal().div(BP_BD),
          )
        : toVToken.apy;
    }

    toVToken.save();
  }
}

function tryTransferFromVToken(
  from: string,
  to: string,
  asset: string,
  value: BigInt,
  ts: BigInt,
): void {
  let fromVToken = vToken.load(from);
  if (fromVToken && fromVToken.asset == asset) {
    fromVToken.assetReserve = fromVToken.assetReserve.minus(value);
    fromVToken.totalAmount = fromVToken.assetReserve.plus(fromVToken.deposited);

    fromVToken.save();

    let toVaultController = VaultController.load(to);
    if (toVaultController) {
      toVaultController.vToken = fromVToken.id;
      toVaultController.depositedAt = ts;
      toVaultController.deposit = value;

      toVaultController.save();
    }
  }
}
