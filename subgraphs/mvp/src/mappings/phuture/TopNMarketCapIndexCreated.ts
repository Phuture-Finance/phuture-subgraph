import { IndexTopN } from '@phuture/subgraph-helpers';
import { handleIndexCreation } from './baseIndex';
import { TopNMarketCapIndexCreated } from '../../types/TopNMarketCapIndexFactory/TopNMarketCapIndexFactory';

export function handleTopNMarketCapIndexCreated(event: TopNMarketCapIndexCreated): void {
  let index = handleIndexCreation(IndexTopN, event, event.params.index, []);

  index.sector = event.params.category;
  index.save();
}
