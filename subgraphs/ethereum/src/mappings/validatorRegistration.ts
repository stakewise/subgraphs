import { ethereum, log } from "@graphprotocol/graph-ts";
import { DepositEvent } from "../../generated/ValidatorRegistration/ValidatorRegistration";
import { Block, ValidatorRegistration } from "../../generated/schema";

export function handleDepositEvent(event: DepositEvent): void {
  let publicKey = event.params.pubkey.toHexString();
  let validator = ValidatorRegistration.load(publicKey);

  if (validator == null) {
    validator = new ValidatorRegistration(publicKey);
    validator.withdrawalCredentials = event.params.withdrawal_credentials;
    validator.index = event.params.index;
    validator.createdAtBlock = event.block.number;
    validator.createdAtTimestamp = event.block.timestamp;
    validator.save();
  }

  log.info("[VRC] DepositEvent publicKey={} withdrawalCredentials={}", [
    validator.id,
    validator.withdrawalCredentials.toHexString(),
  ]);
}

export function handleBlock(block: ethereum.Block): void {
  let id = block.number.toString();

  let blockEntity = new Block(id);
  blockEntity.timestamp = block.timestamp;
  blockEntity.save();

  log.info("[Block] number={} timestamp={}", [
    blockEntity.id,
    blockEntity.timestamp.toString(),
  ]);
}
