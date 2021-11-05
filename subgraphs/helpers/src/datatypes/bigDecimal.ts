import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export namespace bigDecimal {
  export const DEFAULT_DECIMALS = 18;

  export function fromFloat(value: f64): BigDecimal {
    return BigDecimal.fromString(value.toString());
  }

  export function fromBigInt(value: BigInt, decimals: number = DEFAULT_DECIMALS): BigDecimal {
    let precision = BigInt.fromI32(10)
      .pow(<u8>decimals)
      .toBigDecimal();

    return value.divDecimal(precision);
  }
}
