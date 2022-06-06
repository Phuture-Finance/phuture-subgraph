import { handlerUpdateDeposit, handlerVTokenTransfer } from "../src/mappings/phuture/vToken"
import { handleTransfer } from "../src/mappings/phuture/erc20"
import { ethereum, Address, BigDecimal } from "@graphprotocol/graph-ts"
import { assert, clearStore, test } from "matchstick-as/assembly/index";
import { vToken, Asset } from '../src/types/schema';
import { newMockEvent } from "matchstick-as/assembly/index"
import { UpdateDeposit, VTokenTransfer } from '../src/types/templates/vToken/vToken';
import { BigInt } from '@graphprotocol/graph-ts/index';
import { Transfer } from "../src/types/templates/erc20/ERC20";
//import { logStore } from "matchstick-as/assembly/store";

export { handlerUpdateDeposit, handlerVTokenTransfer, handleTransfer };

test("erc20 transfer", () => {
  let transfer = changetype<Transfer>(newMockEvent())

  let fromParam = new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.zero()));
  transfer.parameters.push(fromParam);
  let toParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString("0x0123456789123456789123456789123456789aaa")));
  transfer.parameters.push(toParam);
  let valueParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(BigInt.fromString("1111")));
  transfer.parameters.push(valueParam);

  let vtoken = new vToken("0x0123456789123456789123456789123456789aaa");

  vtoken.asset = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a";
  vtoken.deposited = BigInt.fromString("7777");
  vtoken.save();

  handleTransfer(transfer);

  assert.fieldEquals("vToken", "0x0123456789123456789123456789123456789aaa", "assetReserve", "1111");
  assert.fieldEquals("vToken", "0x0123456789123456789123456789123456789aaa", "totalAmount", "8888");

  transfer = changetype<Transfer>(newMockEvent())
  fromParam = new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.fromString("0x0123456789123456789123456789123456789aaa")));
  transfer.parameters.push(fromParam);
  toParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.zero()));
  transfer.parameters.push(toParam);
  valueParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(BigInt.fromString("1111")));
  transfer.parameters.push(valueParam);

  handleTransfer(transfer);

  assert.fieldEquals("vToken", "0x0123456789123456789123456789123456789aaa", "assetReserve", "0");
  assert.fieldEquals("vToken", "0x0123456789123456789123456789123456789aaa", "totalAmount", "7777");

  clearStore()
});

test("vToken transfer", () => {
  let vtokenTransfer = changetype<VTokenTransfer>(newMockEvent())
  let fromParam = new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.zero()));
  vtokenTransfer.parameters.push(fromParam);
  let toParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString("0x123456789ABCDEF123456789ABCDEF123456789A")));
  vtokenTransfer.parameters.push(toParam);
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(BigInt.fromString("1111")));
  vtokenTransfer.parameters.push(amountParam);

  let asset = new Asset("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0");
  asset.basePrice = BigDecimal.fromString("123.34");
  asset.save();

  let vtoken = new vToken("0xa16081f360e3847006db660bae1c6d1b2e17ec2a");
  vtoken.asset = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0";
 
  vtoken.save();

  handlerVTokenTransfer(vtokenTransfer);

  assert.fieldEquals("vToken", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a", "platformTotalSupply", "1111");
  assert.fieldEquals("vToken", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a", "platformTotalSupplyDec", "1111");
  assert.fieldEquals("vToken", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a", "capitalization", "137030.74");
  assert.fieldEquals("vToken", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a", "asset", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0");
  assert.fieldEquals("Asset", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0", "vaultReserve", "1111");
  assert.fieldEquals("DailyAssetStat", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0-0", "asset", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0");

  vtokenTransfer = changetype<VTokenTransfer>(newMockEvent())
  fromParam = new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.fromString("0x123456789ABCDEF123456789ABCDEF123456789B")));
  vtokenTransfer.parameters.push(fromParam);
  toParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString("0x123456789ABCDEF123456789ABCDEF123456789A")));
  vtokenTransfer.parameters.push(toParam);
  amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(BigInt.fromString("1111")));
  vtokenTransfer.parameters.push(amountParam);

  asset = new Asset("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1");
  asset.basePrice = BigDecimal.fromString("123.34");
  asset.save();

  vtoken = new vToken("0xa16081f360e3847006db660bae1c6d1b2e17ec2b");
  vtoken.asset = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0";

  vtoken.save();

  handlerVTokenTransfer(vtokenTransfer);

  assert.fieldEquals("vToken", "0xa16081f360e3847006db660bae1c6d1b2e17ec2b", "platformTotalSupply", "0");
  assert.fieldEquals("vToken", "0xa16081f360e3847006db660bae1c6d1b2e17ec2b", "platformTotalSupplyDec", "0");
  assert.fieldEquals("vToken", "0xa16081f360e3847006db660bae1c6d1b2e17ec2b", "capitalization", "0");
  assert.fieldEquals("vToken", "0xa16081f360e3847006db660bae1c6d1b2e17ec2b", "asset", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0");
  assert.fieldEquals("Asset", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0", "vaultReserve", "1111");
  assert.fieldEquals("DailyAssetStat", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0-0", "asset", "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0");

  clearStore()
});


test("vToken update deposit", () => {
  let updateDeposit = changetype<UpdateDeposit>(newMockEvent())
  let accountParam = new ethereum.EventParam("account", ethereum.Value.fromAddress(Address.fromString("0x123456789ABCDEF123456789ABCDEF123456789A")));
  updateDeposit.parameters.push(accountParam);
  let depositedParam = new ethereum.EventParam("depositedAmount", ethereum.Value.fromSignedBigInt(BigInt.fromString("8888")));
  updateDeposit.parameters.push(depositedParam);

  let vtoken = new vToken("0xa16081f360e3847006db660bae1c6d1b2e17ec2a");
  vtoken.deposited = BigInt.fromString("8888")

  vtoken.save();

  handlerUpdateDeposit(updateDeposit)

  assert.fieldEquals("vToken", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a", "totalAmount", "8888");
  assert.fieldEquals("vToken", "0xa16081f360e3847006db660bae1c6d1b2e17ec2a", "deposited", "8888");

  clearStore()
});
