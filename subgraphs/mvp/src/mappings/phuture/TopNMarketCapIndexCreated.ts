import { IndexTopN } from '@phuture/subgraph-helpers';
import { handleIndexCreation } from './baseIndex';
import { TopNMarketCapIndexCreated } from '../../types/TopNMarketCapIndexFactory/TopNMarketCapIndexFactory';

export function handleTopNMarketCapIndexCreated(event: TopNMarketCapIndexCreated): void {
  handleIndexCreation(IndexTopN, event, event.params.index, []);
}
