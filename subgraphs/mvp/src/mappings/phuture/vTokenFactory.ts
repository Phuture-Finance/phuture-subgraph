import { VTokenCreated } from '../../types/vToken/vTokenFactory';
import {Address, Bytes} from '@graphprotocol/graph-ts';
import { loadOrCreateVToken } from '../entities';

export function handleVTokenCreated(event: VTokenCreated): void {
    if (event.params.vToken.equals(Address.zero()))
        return;

    let vt = loadOrCreateVToken(event.params.vToken);

    vt.asset = event.params.asset.toHexString();
    vt.tokenType = event.params.vTokenType;

    vt.save()
}
