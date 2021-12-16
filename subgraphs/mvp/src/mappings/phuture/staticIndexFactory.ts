import { IndexStatic } from '@phuture/subgraph-helpers';
import { handleIndexCreation } from './baseIndex';
import { StaticIndexCreated } from '../../types/Index/StaticIndexFactory';

export function handleStaticIndexCreated(event: StaticIndexCreated): void {
  handleIndexCreation(IndexStatic, event, event.params.index, event.params.assets, event.params.weights);
}
