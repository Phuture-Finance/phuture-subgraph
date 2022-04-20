import { ChainLinkAgg } from '../../types/schema';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export function loadOrCreateChainLink(addr: Address): ChainLinkAgg {
  let id = addr.toHexString();

  let agg = ChainLinkAgg.load(id);
  if (!agg) {
    agg = new ChainLinkAgg(id);
    agg.asset = "";
    agg.decimals = BigInt.zero();
    agg.description = "";
    agg.answer = BigDecimal.zero();

    agg.save();
  }

  return agg as ChainLinkAgg;
}
