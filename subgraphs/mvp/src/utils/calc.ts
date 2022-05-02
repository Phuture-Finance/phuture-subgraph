import {BigDecimal, BigInt} from "@graphprotocol/graph-ts/index";
import { ONE_BI } from '../../../helpers';

export function convertTokenToBigInt(tokenAmount: BigInt, decimals: BigInt): BigInt {
    let bd = tokenAmount;
    let ten = BigInt.fromI32(10);
    let dc = decimals.toI32();

    if (dc > 0) {
        for (let i = 0; i < decimals.toI32(); i++) {
            bd = bd.times(ten);
        }
    } else {
        for (let i = decimals.toI32(); i < 0 ; i++) {
            bd = bd.div(ten);
        }
    }

    return bd;
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
    let bd = new BigDecimal(BigInt.fromI32(1));

    for (let i = BigInt.zero(); i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
        bd = bd.times(BigDecimal.fromString('10'));
    }

    return bd;
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
    if (exchangeDecimals == BigInt.zero()) {
        return tokenAmount.toBigDecimal();
    }

    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}