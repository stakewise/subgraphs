import { log, store } from "@graphprotocol/graph-ts";

import {
  Activated,
  ActivatedValidatorsUpdated,
  ActivationScheduled,
  MinActivatingDepositUpdated,
  Paused,
  PendingValidatorsLimitUpdated,
  Unpaused,
  ValidatorInitialized,
  ValidatorRegistered,
} from "../../generated/Pool/Pool";
import {
  createOrLoadDepositActivation,
  createOrLoadPool,
  createOrLoadOperator,
  createOrLoadValidator,
  getDepositActivationId,
  createOrLoadSettings,
  RegistrationStatus,
} from "../entities";
import { DepositActivation } from "../../generated/schema";

export function handleMinActivatingDepositUpdated(
  event: MinActivatingDepositUpdated
): void {
  const pool = createOrLoadPool();

  pool.minActivatingDeposit = event.params.minActivatingDeposit.toBigDecimal();
  pool.save();

  log.info(
    "[Pool] MinActivatingDepositUpdated sender={} minActivatingDeposit={}",
    [event.params.sender.toHexString(), pool.minActivatingDeposit.toString()]
  );
}

export function handlePendingValidatorsLimitUpdated(
  event: PendingValidatorsLimitUpdated
): void {
  const pool = createOrLoadPool();

  pool.pendingValidatorsLimit = event.params.pendingValidatorsLimit.toI32();
  pool.save();

  log.info(
    "[Pool] PendingValidatorsLimitUpdated sender={} pendingValidatorsLimit={}",
    [event.params.sender.toHexString(), pool.pendingValidatorsLimit.toString()]
  );
}

export function handleActivatedValidatorsUpdated(
  event: ActivatedValidatorsUpdated
): void {
  const pool = createOrLoadPool();
  const newActivatedValidators = event.params.activatedValidators.toI32();
  const activatedValidators = newActivatedValidators - pool.activatedValidators;

  pool.pendingValidators = pool.pendingValidators - activatedValidators;
  pool.activatedValidators = newActivatedValidators;
  pool.save();

  log.info(
    "[Pool] ActivatedValidatorsUpdated sender={} activatedValidators={}",
    [event.params.sender.toHexString(), pool.activatedValidators.toString()]
  );
}

export function handleActivationScheduled(event: ActivationScheduled): void {
  const activation = createOrLoadDepositActivation(
    event.params.sender,
    event.params.validatorIndex
  );
  activation.save();

  const addedAmount = event.params.value.toBigDecimal();
  activation.amount = activation.amount.plus(addedAmount);

  log.info("[Pool] ActivationScheduled sender={} validatorIndex={} amount={}", [
    activation.account.toHexString(),
    activation.validatorIndex.toString(),
    addedAmount.toString(),
  ]);
}

export function handleActivated(event: Activated): void {
  const activationId = getDepositActivationId(
    event.params.account,
    event.params.validatorIndex
  );
  let activation = DepositActivation.load(activationId);

  if (activation != null) {
    store.remove("DepositActivation", activationId);
  }

  log.info("[Pool] Activated account={} validatorIndex={} value={} sender={}", [
    event.params.account.toHexString(),
    event.params.validatorIndex.toString(),
    event.params.value.toBigDecimal().toString(),
    event.params.sender.toHexString(),
  ]);
}

export function handleValidatorInitialized(event: ValidatorInitialized): void {
  const operator = createOrLoadOperator(event.params.operator.toHexString());
  const validator = createOrLoadValidator(event.params.publicKey.toHexString());

  validator.operator = operator.id;
  validator.registrationStatus = RegistrationStatus.Initialized;
  validator.save();

  log.info("[Pool] ValidatorInitialized publicKey={} operator={}", [
    validator.id,
    operator.id,
  ]);
}

export function handleValidatorRegistered(event: ValidatorRegistered): void {
  const operator = createOrLoadOperator(event.params.operator.toHexString());
  const validator = createOrLoadValidator(event.params.publicKey.toHexString());

  validator.operator = operator.id;
  validator.registrationStatus = RegistrationStatus.Finalized;
  validator.save();

  const pool = createOrLoadPool();
  pool.pendingValidators += 1;
  pool.save();

  log.info("[Pool] ValidatorRegistered publicKey={} operator={}", [
    validator.id,
    operator.id,
  ]);
}

export function handlePaused(event: Paused): void {
  const settings = createOrLoadSettings();

  settings.poolPaused = true;
  settings.save();

  log.info("[Pool] Paused account={}", [event.params.account.toHexString()]);
}

export function handleUnpaused(event: Unpaused): void {
  const settings = createOrLoadSettings();

  settings.poolPaused = false;
  settings.save();

  log.info("[Pool] Unpaused account={}", [event.params.account.toHexString()]);
}
