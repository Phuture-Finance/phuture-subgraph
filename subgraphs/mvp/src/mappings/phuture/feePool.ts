import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import { FeeInBPAUM, FeeInBPBurn, FeeInBPMint } from '../../../../helpers';
import { loadOrCreateIndex } from '../entities';
import { SetAUMScaledPerSecondsRate, SetBurningFeeInBP, SetMintingFeeInBP } from '../../types/FeePool/FeePool';

function saveFeeInBP(indexAddress: Address, amount: BigInt, type: string): void {
  let index = loadOrCreateIndex(indexAddress);

  if (type == FeeInBPBurn) {
    index.feeBurn = amount;
  } else if (type == FeeInBPAUM) {
    let scaledPerSecondRate = BigDecimal.fromString(amount.toString());
    let one = BigDecimal.fromString("1");
    let two = BigDecimal.fromString("2");
    let six = BigDecimal.fromString("6");
    let C = BigDecimal.fromString("1000000000000000000000000000");
    let N = BigDecimal.fromString(BigInt.fromI32(365 * 24 * 60 * 60).toString());
    let q = C.div(scaledPerSecondRate);

    //  e = 1 - C / s = 1 - q
    //  x4 = N * e * (1 - p1 + p2)
    //  x4 = N * e * (1 - e*(N+1)/2 + e*e*(N+1)*(N+2)/6)

    let e  = BigDecimal.fromString((BigDecimal.fromString("1").minus(q)).toString());
    let p1 = e.times(N.plus(one)).div(two);
    let p2 = e.times(e).times(N.plus(one)).times(N.plus(two)).div(six);
    let x4 = N.times(e).times(one.minus(p1).plus(p2));

    index.feeAUMPercent = x4.times(BigDecimal.fromString("100"));
  } else if (type == FeeInBPMint) {
    index.feeMint = amount;
  } else {
    return;
  }

  index.save();
}

export function handleSetMintingFeeInBP(event: SetMintingFeeInBP): void {
  saveFeeInBP(event.params.index, BigInt.fromI32(event.params.mintingFeeInBP), FeeInBPMint);
}

export function handleSetBurningFeeInBP(event: SetBurningFeeInBP): void {
  saveFeeInBP(event.params.index, BigInt.fromI32(event.params.burningFeeInPB), FeeInBPBurn);
}

export function handleSetAUMFeeInBP(event: SetAUMScaledPerSecondsRate): void {
  saveFeeInBP(event.params.index, event.params.AUMScaledPerSecondsRate, FeeInBPAUM);
}
