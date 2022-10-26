import { Address, log } from '@graphprotocol/graph-ts';
import { Chainlink, ChainlinkAggregator } from '../../types/schema';
import { AggregatorInterface } from '../../types/templates';
import { ChainLink as ChainLinkSmartContract } from '../../types/templates/AggregatorInterface/ChainLink';

export function loadOrCreateChainlink(addr: Address, indexBettingAddress: string): Chainlink {
  let id = addr.toHexString();
  let chainlink = Chainlink.load(id);

  let aggregator = getAggregatorAddress(addr);
  // Chainlink entity has not been created, create it and create new data source for aggregator
  if (!chainlink) {
    chainlink = new Chainlink(id);
    chainlink.indexBetting = indexBettingAddress;
    if (aggregator !== null) {
      createChainlinkAggregator(aggregator as Address, chainlink);
    }
  } else {
    if (aggregator !== null) {
      // Aggregator has changed, create new data source from the template
      if (chainlink.chainlinkAggregator.toLowerCase() != (aggregator as Address).toHexString().toLowerCase()) {
        createChainlinkAggregator(aggregator as Address, chainlink);
      }
    }
  }

  chainlink.save();

  return chainlink as Chainlink;
}

export function createChainlinkAggregator(aggregator: Address, chainlink: Chainlink): void {
  AggregatorInterface.create(aggregator);
  let chainlinkAggregator = ChainlinkAggregator.load(aggregator.toHexString());
  if (!chainlinkAggregator) {
    chainlinkAggregator = new ChainlinkAggregator(aggregator.toHexString());
    chainlinkAggregator.chainlink = chainlink.id;
  }
  chainlinkAggregator.save();
  chainlink.chainlinkAggregator = aggregator.toHexString();
}

export function getAggregatorAddress(chainlinkAddr: Address): Address | null {
  let chainLinkContract = ChainLinkSmartContract.bind(chainlinkAddr);
  let aggregator = chainLinkContract.try_aggregator();
  if (aggregator.reverted) {
    return null;
  }
  return aggregator.value;

  // Used for testing purposes
  // return Address.fromString("0xA122f84935477142295F7451513e502D49316285");
}
