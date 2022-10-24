import {Address} from "@graphprotocol/graph-ts";
import {ChainLink, IndexBetting} from "../../types/schema";

export function loadOrCreateChainLink(addr: Address, indexBettingAddress: string): ChainLink {
  let id = addr.toHexString();
  let chainlink = ChainLink.load(id);
  if (!chainlink) {
    chainlink = new ChainLink(id);
    chainlink.indexBetting = indexBettingAddress;
  }

  chainlink.save();

  return chainlink as ChainLink;



}