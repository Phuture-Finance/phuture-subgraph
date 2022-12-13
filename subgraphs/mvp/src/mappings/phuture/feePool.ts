import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts';

import {
  FeeAUM,
  FeeInBPBurn,
  FeeInBPMint,
  ONE_BD,
  TWO_BD,
} from '../../../../helpers';
import {
  SetAUMScaledPerSecondsRate,
  SetBurningFeeInBP,
  SetMintingFeeInBP,
} from '../../types/FeePool/FeePool';
import { loadOrCreateIndex } from '../entities';

function saveFeeInBP(
  indexAddress: Address,
  amount: BigInt,
  type: string,
): void {
  let index = loadOrCreateIndex(indexAddress);

  if (type == FeeInBPBurn) {
    index.feeBurn = amount;
  } else if (type == FeeAUM) {
    let scaledPerSecondRate = BigDecimal.fromString(amount.toString());
    let C = BigDecimal.fromString('1000000000000000000000000000');
    let N = BigDecimal.fromString(
      BigInt.fromI32(365 * 24 * 60 * 60).toString(),
    );
    let q = C.div(scaledPerSecondRate);

    // e = 1 - C / s = 1 - q
    let e = BigDecimal.fromString(ONE_BD.minus(q).toString());

    // p1 = e*(N+1)/2
    let p1 = e.times(N.plus(ONE_BD)).div(TWO_BD);

    // e*e*(N+1)*(N+2)/6
    let p2 = e
      .times(e)
      .times(N.plus(ONE_BD))
      .times(N.plus(TWO_BD))
      .div(BigDecimal.fromString('6'));

    // x4 = N * e * (1 - p1 + p2)
    let x4 = N.times(e).times(ONE_BD.minus(p1).plus(p2));

    index.feeAUMPercent = x4.times(BigDecimal.fromString('100'));
  } else if (type == FeeInBPMint) {
    index.feeMint = amount;
  } else {
    return;
  }

  index.save();
}

export function handleSetMintingFeeInBP(event: SetMintingFeeInBP): void {
  saveFeeInBP(
    event.params.index,
    BigInt.fromI32(event.params.mintingFeeInBP),
    FeeInBPMint,
  );
}

export function handleSetBurningFeeInBP(event: SetBurningFeeInBP): void {
  saveFeeInBP(
    event.params.index,
    BigInt.fromI32(event.params.burningFeeInPB),
    FeeInBPBurn,
  );
}

export function handleSetAUMFeeInBP(event: SetAUMScaledPerSecondsRate): void {
  saveFeeInBP(event.params.index, event.params.AUMScaledPerSecondsRate, FeeAUM);
}
