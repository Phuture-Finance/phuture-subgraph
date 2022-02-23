import { Transfer } from "../../types/templates/erc20/ERC20";
import { vToken } from "../../types/schema";

export function handleTransfer(event: Transfer): void {
    let fromVT = vToken.load(event.params.from.toHexString());
    if (fromVT) {
        fromVT.totalAmount = fromVT.totalAmount.minus(event.params.value.toBigDecimal());
        fromVT.save();
    }

    let toVT = vToken.load(event.params.to.toHexString());
    if (toVT) {
        toVT.totalAmount = toVT.totalAmount.plus(event.params.value.toBigDecimal());
        toVT.save();
    }
}
