import {Address, BigInt, ethereum} from '@graphprotocol/graph-ts';

import { vToken } from '../../types/schema';

export function loadOrCreateVToken(address: Address): vToken {
    let id = address.toHexString();
    let vt = vToken.load(id);
    if (!vt) {
        vt = new vToken(id);
        vt.deposited = BigInt.zero();
    }

    return vt as vToken;
}
