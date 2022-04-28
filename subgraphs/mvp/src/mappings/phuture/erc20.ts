import { Transfer } from "../../types/templates/erc20/ERC20";
import { vToken } from "../../types/schema";

export function handleTransfer(event: Transfer): void {
    let fromVT = vToken.load(event.params.from.toHexString());
    if (fromVT && fromVT.asset == event.address.toHexString()) {
        fromVT.assetReserve = fromVT.assetReserve.minus(event.params.value);
        fromVT.save();
    }

    let toVT = vToken.load(event.params.to.toHexString());
    if (toVT && toVT.asset == event.address.toHexString()) {
        toVT.assetReserve = toVT.assetReserve.plus(event.params.value);
        toVT.save();
    }
}
