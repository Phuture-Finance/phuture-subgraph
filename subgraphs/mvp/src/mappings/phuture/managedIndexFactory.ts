import { IndexManaged } from '@phuture/subgraph-helpers';
import { handleIndexCreation } from './baseIndex';
import { ManagedIndexCreated } from '../../types/Index/ManagedIndexFactory';

export function handleManagedIndexCreated(event: ManagedIndexCreated): void {
  handleIndexCreation(IndexManaged, event, event.params.index, event.params._assets);
}
