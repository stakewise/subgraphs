import { ethereum, log } from "@graphprotocol/graph-ts";
import {
  BYTES_ZERO,
  VALIDATOR_REGISTRATION_ADDRESS,
  ETHEREUM_VALIDATORS_DEPOSIT_ROOT_START_BLOCK,
} from "const";
import {
  DepositEvent,
  ValidatorRegistration as ValidatorRegistrationContract,
} from "../../generated/ValidatorRegistration/ValidatorRegistration";
import { Block, ValidatorRegistration } from "../../generated/schema";

export function handleDepositEvent(event: DepositEvent): void {
  let registrationId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());
  let registration = new ValidatorRegistration(registrationId);
  registration.publicKey = event.params.pubkey;
  registration.withdrawalCredentials = event.params.withdrawal_credentials;
  registration.createdAtBlock = event.block.number;
  registration.createdAtTimestamp = event.block.timestamp;

  if (event.block.number.ge(ETHEREUM_VALIDATORS_DEPOSIT_ROOT_START_BLOCK)) {
    let contract = ValidatorRegistrationContract.bind(
      VALIDATOR_REGISTRATION_ADDRESS
    );
    let depositRootCall = contract.try_get_deposit_root();
    if (!depositRootCall.reverted) {
      registration.validatorsDepositRoot = depositRootCall.value;
    } else {
      registration.validatorsDepositRoot = BYTES_ZERO;
    }
  } else {
    registration.validatorsDepositRoot = BYTES_ZERO;
  }

  registration.save();
  log.info("[VRC] DepositEvent publicKey={} withdrawalCredentials={}", [
    registration.id,
    registration.withdrawalCredentials.toHexString(),
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
