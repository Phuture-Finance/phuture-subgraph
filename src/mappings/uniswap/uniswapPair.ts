import { Asset, Pair } from "../../types/schema";
import { ADDRESS_ZERO } from "../../consts";
import { Sync, Transfer } from "../../types/templates/UniswapPair/UniswapPair";
import { convertTokenToDecimal } from "../helpers";

export function handleSync(event: Sync): void {
  let pair = Pair.load(event.address.toHexString());
  let asset0 = Asset.load(pair.asset0);
  let asset1 = Asset.load(pair.asset1);

  pair.asset0Reserve = convertTokenToDecimal(event.params.reserve0, asset0.decimals);
  pair.asset1Reserve = convertTokenToDecimal(event.params.reserve1, asset1.decimals);

  pair.save();
}

export function handleTransfer(event: Transfer): void {
  let pair = Pair.load(event.address.toHexString());

  if (event.params.from.toHexString() == ADDRESS_ZERO) {
    pair.totalSupply = pair.totalSupply.plus(event.params.value);
  }
  if (event.params.to.toHexString() == ADDRESS_ZERO) {
    pair.totalSupply = pair.totalSupply.minus(event.params.value);
  }

  pair.save();
}
