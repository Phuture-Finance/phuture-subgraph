import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index';

import { Index, IndexFactory } from '../../types/schema';

import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from './Asset';

export function loadOrCreateIndex(address: Address): Index {
  let index = Index.load(address.toHexString());
  if (!index) {
    index = new Index(address.toHexString());

    index.marketCap = BigDecimal.zero();
    index.baseVolume = BigDecimal.zero();
    index.basePrice = BigDecimal.zero();
    index._assets = [];

    index.totalSupply = BigInt.zero();
    index.decimals = fetchTokenDecimals(address);
    index.symbol = fetchTokenSymbol(address);
    index.name = fetchTokenName(address);

    index.save();
  }

  return index;
}

export function loadOrCreateIndexFactory(
  address: Address,
  indexType: string,
  vTokenFactory: Address,
): IndexFactory {
  let indexFactory = IndexFactory.load(address.toHexString());
  if (!indexFactory) {
    indexFactory = new IndexFactory(address.toHexString());
    indexFactory.type = indexType;
    indexFactory.vTokenFactory = vTokenFactory.toHexString();
    indexFactory.save();
  }

  return indexFactory;
}
