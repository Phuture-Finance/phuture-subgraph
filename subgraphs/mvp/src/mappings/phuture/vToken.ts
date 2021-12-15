import {Transfer, UpdateDeposit} from '../../types/vToken/vToken';
import {Address} from '@graphprotocol/graph-ts';
import {loadOrCreateAsset, loadOrCreateVToken} from '../entities';

export function handlerTransfer(event: Transfer): void {
  if (event.address.equals(Address.zero())) return;

  let vt = loadOrCreateVToken(event.address);

  let assetAddress = Address.fromHexString(vt.asset) as Address;
  let asset = loadOrCreateAsset(assetAddress);
  asset.vToken.push(vt.id);
  asset.save();
}

export function  handlerUpdateDeposit(event: UpdateDeposit): void {
  let vt = loadOrCreateVToken(event.address);

  vt.deposited = event.params.depositedAmount;
  vt.save();
}
