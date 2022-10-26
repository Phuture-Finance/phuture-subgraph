import { IndexTopN } from '../../../../helpers';
import { handleIndexCreation } from './baseIndex';
import {
  TopNMarketCapIndexCreated,
  TopNMarketCapIndexFactory,
} from '../../types/TopNMarketCapIndexFactory/TopNMarketCapIndexFactory';
import { loadOrCreateIndexFactory } from '../entities';

export function handleTopNMarketCapIndexCreated(event: TopNMarketCapIndexCreated): void {
  let idxFactory = TopNMarketCapIndexFactory.bind(event.address);
  let idxF = loadOrCreateIndexFactory(event.address, IndexTopN, idxFactory.vTokenFactory());

  let index = handleIndexCreation(IndexTopN, event, event.params.index, []);

  index.indexFactory = idxF.id;
  index.sector = event.params.category;
  index.save();
}
