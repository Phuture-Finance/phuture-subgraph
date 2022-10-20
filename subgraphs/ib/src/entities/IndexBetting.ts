import {Address, BigInt} from "@graphprotocol/graph-ts";
import {IndexBetting} from "../types/schema";
import { IndexBetting as IndexBettingContract } from "../../src/types/IndexBetting/IndexBetting";

export function loadOrCreateIndexBetting(addr: Address, ts: BigInt): IndexBetting {
    let id = addr.toHexString();

    let indexBetting = IndexBetting.load(id);
    if (!indexBetting) {
        indexBetting = new IndexBetting(id);
        let contract = IndexBettingContract.bind(addr);
        let totalDeposited = contract.try_totalSupply();
        if (!totalDeposited.reverted) {
            indexBetting.totalDeposited = totalDeposited.value;
        }

        let decimals = contract.try_decimals();
        if (!decimals.reverted) {
            indexBetting.decimals = BigInt.fromI32(decimals.value);
        }

        let symbol = contract.try_symbol();
        if (!symbol.reverted) {
            indexBetting.symbol = symbol.value;
        }

        let name = contract.try_name();
        if (!name.reverted) {
            indexBetting.name = name.value;
        }

        indexBetting.created = ts
    }

    indexBetting.save();

    return indexBetting as IndexBetting;
}
