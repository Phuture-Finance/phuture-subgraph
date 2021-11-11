import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Index, Transfer, UserIndex } from "../../types/schema";
import { EMISSION_CONTROLLER_ADDRESS } from "../../../consts";
import {
  updateDailyIndexStat,
  updateHourlyIndexStat,
  updateMonthlyIndexStat,
  updateWeeklyIndexStat,
  updateYearlyIndexStat
} from "./stats";
import { loadOrCreateAccount, loadOrCreateTransaction } from "../entities";
import { ONE_BI } from "@phuture/subgraph-helpers";

export function handleAllIndexesTransfers(event: ethereum.Event, from: Address, to: Address, value: BigInt): void {
  let tx = loadOrCreateTransaction(event);

  let index = Index.load(event.address.toHexString());
  if (!index) return;

  loadOrCreateAccount(from);
  loadOrCreateAccount(to);

  let transfers = tx.transfers;

  if (from.equals(Address.zero()) && from.toHexString() != EMISSION_CONTROLLER_ADDRESS) {
    let fromUserIndexId = from.toHexString().concat("-").concat(event.address.toHexString());
    let fromUserIndex = UserIndex.load(fromUserIndexId);
    if (fromUserIndex === null) {
      fromUserIndex = new UserIndex(fromUserIndexId);
      fromUserIndex.index = event.address.toHexString();
      fromUserIndex.user = from.toHexString();
      fromUserIndex.balance = BigDecimal.zero();
    }

    fromUserIndex.balance = fromUserIndex.balance.minus(value.toBigDecimal());

    if (fromUserIndex.balance == BigDecimal.zero()) {
      index.uniqueHolders = index.uniqueHolders.minus(ONE_BI);
    }

    fromUserIndex.save();
  }

  if (to.equals(Address.zero()) && to.toHexString() != EMISSION_CONTROLLER_ADDRESS) {
    let toUserIndexId = to.toHexString().concat("-").concat(event.address.toHexString());
    let toUserIndex = UserIndex.load(toUserIndexId);
    if (toUserIndex === null) {
      toUserIndex = new UserIndex(toUserIndexId);
      toUserIndex.index = event.address.toHexString();
      toUserIndex.user = to.toHexString();
      toUserIndex.balance = BigDecimal.zero();
    }

    if (toUserIndex.balance == BigDecimal.zero()) {
      index.uniqueHolders = index.uniqueHolders.plus(ONE_BI);
    }

    toUserIndex.balance = toUserIndex.balance.plus(value.toBigDecimal());

    toUserIndex.save();
  }

  let transferType: string;
  if (from.equals(Address.zero())) {
    index.totalSupply = index.totalSupply.plus(value);

    transferType = "Mint";
  } else if (to.equals(Address.zero())) {
    index.totalSupply = index.totalSupply.minus(value);

    transferType = "Burn";
  } else {
    transferType = "Send";
  }

  index.save();

  let transfer = new Transfer(
    event.transaction.hash.toHexString().concat("-").concat(
      BigInt.fromI32(transfers.length).toString()
    )
  );

  transfer.index = event.address.toHexString();
  transfer.transaction = tx.id;
  transfer.type = transferType;
  transfer.from = from;
  transfer.to = to;
  transfer.value = value;
  transfer.save();

  tx.transfers = transfers.concat([transfer.id]);
  tx.save();

  updateHourlyIndexStat(event);
  updateDailyIndexStat(event);
  updateWeeklyIndexStat(event);
  updateMonthlyIndexStat(event);
  updateYearlyIndexStat(event);
}
