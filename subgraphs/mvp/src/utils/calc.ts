import {BigDecimal, BigInt} from "@graphprotocol/graph-ts/index";

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

export function exponentToBigInt(decimals: BigInt): BigInt {
    let bd = new BigInt(BigInt.fromI32(1));

    for (let i = BigInt.zero(); i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
        bd = bd.times(BigInt.fromString('10'));
    }

    return bd;
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
    let bd = new BigDecimal(BigInt.fromI32(1));

    for (let i = BigInt.zero(); i.lt(decimals as BigInt); i = i.plus(BigInt.fromI32(1))) {
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

export function convertDecimals(tokenAmount: BigDecimal, exchangeDecimals: BigInt): BigDecimal {
    if (exchangeDecimals == BigInt.zero()) {
        return tokenAmount;
    }

    return tokenAmount.div(exponentToBigDecimal(exchangeDecimals));
}

export function feeInBP(amount: BigInt): BigDecimal {
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

    return x4.times(BigDecimal.fromString("100"));
}
