import { log } from "@graphprotocol/graph-ts";

import {
  Activated,
  ActivatedValidatorsUpdated,
  ActivationScheduled,
  MinActivatingDepositUpdated,
  Paused,
  PendingValidatorsLimitUpdated,
  Unpaused,
} from "../../generated/Pool/Pool";
import { createOrLoadDepositActivation, createOrLoadPool } from "../entities";

export function handleSetMinActivatingDeposit(
  event: MinActivatingDepositUpdated
): void {
  const pool = createOrLoadPool(event.block);

  pool.minActivatingDeposit = event.params.minActivatingDeposit.toBigDecimal();

  log.info(
    "[Pool] MinActivatingDepositUpdated sender={} minActivatingDeposit={}",
    [event.params.sender.toHexString(), pool.minActivatingDeposit.toString()]
  );

  pool.save();
}

export function handleSetPendingValidatorsLimit(
  event: PendingValidatorsLimitUpdated
): void {
  const pool = createOrLoadPool(event.block);

  pool.pendingValidatorsLimit = event.params.pendingValidatorsLimit.toI32();

  log.info(
    "[Pool] PendingValidatorsLimitUpdated sender={} pendingValidatorsLimit={}",
    [event.params.sender.toHexString(), pool.pendingValidatorsLimit.toString()]
  );

  pool.save();
}

export function handleSetActivatedValidators(
  event: ActivatedValidatorsUpdated
): void {
  const pool = createOrLoadPool(event.block);
  const newActivatedValidators = event.params.activatedValidators.toI32();
  const activatedValidators = newActivatedValidators - pool.activatedValidators;

  pool.pendingValidators = pool.pendingValidators - activatedValidators;
  pool.activatedValidators = newActivatedValidators;

  log.info(
    "[Pool] ActivatedValidatorsUpdated sender={} activatedValidators={}",
    [event.params.sender.toHexString(), pool.activatedValidators.toString()]
  );

  pool.save();
}

export function handlePaused(event: Paused): void {
  const pool = createOrLoadPool(event.block);

  pool.isPaused = true;

  log.info("[Pool] Paused account={}", [event.params.account.toHexString()]);

  pool.save();
}

export function handleUnpaused(event: Unpaused): void {
  const pool = createOrLoadPool(event.block);

  pool.isPaused = false;

  log.info("[Pool] Unpaused account={}", [event.params.account.toHexString()]);

  pool.save();
}

export function handleActivationScheduled(event: ActivationScheduled): void {
  const activation = createOrLoadDepositActivation(
    event.params.sender,
    event.params.validatorIndex
  );

  const addedAmount = event.params.value.toBigDecimal();
  activation.amount = activation.amount.plus(addedAmount);

  log.info("[Pool] ActivationScheduled sender={} validatorIndex={} amount={}", [
    activation.account.toHexString(),
    activation.validatorIndex.toString(),
    addedAmount.toString(),
  ]);

  activation.save();
}

export function handleActivated(event: Activated): void {
  const activation = createOrLoadDepositActivation(
    event.params.account,
    event.params.validatorIndex
  );

  activation.isActivated = true;
  activation.activationSender = event.params.sender;

  log.info("[Pool] Activated account={} validatorIndex={} value={} sender={}", [
    activation.account.toHexString(),
    activation.validatorIndex.toString(),
    activation.amount.toString(),
    event.params.sender.toHexString(),
  ]);

  activation.save();
}
