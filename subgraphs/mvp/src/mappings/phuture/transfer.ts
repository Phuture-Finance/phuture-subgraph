import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Index, Transfer, UserIndex } from "../../types/schema";
import { Transfer as TransferEvent } from "../../types/templates/StaticIndex/StaticIndex";
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

// Add more events into function signature.
export function handleAllIndexesTransfers(event: TransferEvent): void {
  let tx = loadOrCreateTransaction(event);

  let index = Index.load(event.address.toHexString());
  if (!index) return;

  let from = event.params.from;
  loadOrCreateAccount(from);
  let to = event.params.to;
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

    fromUserIndex.balance = fromUserIndex.balance.minus(event.params.value.toBigDecimal());

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

    toUserIndex.balance = toUserIndex.balance.plus(event.params.value.toBigDecimal());

    toUserIndex.save();
  }

  let transferType: string;
  if (from.equals(Address.zero())) {
    index.totalSupply = index.totalSupply.plus(event.params.value);

    transferType = "Mint";
  } else if (to.equals(Address.zero())) {
    index.totalSupply = index.totalSupply.minus(event.params.value);

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
  transfer.value = event.params.value;
  transfer.save();

  tx.transfers = transfers.concat([transfer.id]);
  tx.save();

  updateHourlyIndexStat(event);
  updateDailyIndexStat(event);
  updateWeeklyIndexStat(event);
  updateMonthlyIndexStat(event);
  updateYearlyIndexStat(event);
}
