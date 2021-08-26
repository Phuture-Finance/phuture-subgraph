import { Index, Transfer, UserIndex } from "../types/schema";
import { SetImageURL, SetName, SetSymbol, Transfer as TransferEvent } from "../types/templates/StaticIndex/StaticIndex";
import { createTransaction, createUser, ZERO_BD } from "./helpers";
import { BigInt } from "@graphprotocol/graph-ts";
import { ADDRESS_ZERO } from "../consts";

export function handleIndexTransfer(event: TransferEvent): void {
  let tx = createTransaction(event);

  let index = Index.load(event.address.toHexString());

  let from = event.params.from;
  createUser(from);
  let to = event.params.to;
  createUser(to);

  let transfers = tx.transfers;

  if (from.toHexString() != ADDRESS_ZERO) {
    let fromUserIndexId = from.toHexString()
      .concat("-")
      .concat(event.address.toHexString());
    let fromUserIndex = UserIndex.load(fromUserIndexId);
    if (fromUserIndex === null) {
      fromUserIndex = new UserIndex(fromUserIndexId);
      fromUserIndex.index = event.address.toHexString();
      fromUserIndex.user = from.toHexString();
      fromUserIndex.balance = ZERO_BD;
    }

    fromUserIndex.balance = fromUserIndex.balance.minus(event.params.value.toBigDecimal());

    fromUserIndex.save();
  }

  if (to.toHexString() != ADDRESS_ZERO) {
    let toUserIndexId = to.toHexString()
      .concat("-")
      .concat(event.address.toHexString());
    let toUserIndex = UserIndex.load(toUserIndexId);
    if (toUserIndex === null) {
      toUserIndex = new UserIndex(toUserIndexId);
      toUserIndex.index = event.address.toHexString();
      toUserIndex.user = to.toHexString();
      toUserIndex.balance = ZERO_BD;
    }

    toUserIndex.balance = toUserIndex.balance.plus(event.params.value.toBigDecimal());

    toUserIndex.save();
  }

  let transferType: string;
  if (from.toHexString() == ADDRESS_ZERO) {
    index.totalSupply = index.totalSupply.plus(event.params.value);

    transferType = "Mint";
  } else if (to.toHexString() == ADDRESS_ZERO) {
    index.totalSupply = index.totalSupply.minus(event.params.value);

    transferType = "Burn";
  } else {
    transferType = "Send";
  }

  index.save();

  let transfer = new Transfer(
    event.transaction.hash
      .toHexString()
      .concat("-")
      .concat(BigInt.fromI32(transfers.length).toString())
  );

  transfer.index = event.address.toHexString();
  transfer.transaction = tx.id;
  transfer.type = transferType;
  transfer.from = from;
  transfer.to = to;
  transfer.value = event.params.value;
  transfer.save();

  tx.transfers = transfers.concat([transfer.id]);
  tx.save();

  // TODO: updateDailyIndexStat(event);
}

export function handleSetImageURL(event: SetImageURL): void {
  let index = Index.load(event.address.toHexString());
  index.imageUrl = event.params.name;

  index.save();
}

export function handleSetName(event: SetName): void {
  let index = Index.load(event.address.toHexString());
  index.name = event.params.name;

  index.save();
}

export function handleSetSymbol(event: SetSymbol): void {
  let index = Index.load(event.address.toHexString());
  index.symbol = event.params.name;

  index.save();
}
