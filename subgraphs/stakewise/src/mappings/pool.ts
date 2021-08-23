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
} from "../entities";
import { DepositActivation } from "../../generated/schema";
import { BIG_DECIMAL_1E18 } from "../constants";

export function handleMinActivatingDepositUpdated(
  event: MinActivatingDepositUpdated
): void {
  let pool = createOrLoadPool();

  pool.minActivatingDeposit =
    event.params.minActivatingDeposit.divDecimal(BIG_DECIMAL_1E18);
  pool.save();

  log.info(
    "[Pool] MinActivatingDepositUpdated sender={} minActivatingDeposit={}",
    [event.params.sender.toHexString(), pool.minActivatingDeposit.toString()]
  );
}

export function handlePendingValidatorsLimitUpdated(
  event: PendingValidatorsLimitUpdated
): void {
  let pool = createOrLoadPool();

  pool.pendingValidatorsLimit = event.params.pendingValidatorsLimit.toI32();
  pool.save();

  log.info(
    "[Pool] PendingValidatorsLimitUpdated sender={} pendingValidatorsLimit={}",
    [
      event.params.sender.toHexString(),
      event.params.pendingValidatorsLimit.toString(),
    ]
  );
}

export function handleActivatedValidatorsUpdated(
  event: ActivatedValidatorsUpdated
): void {
  let pool = createOrLoadPool();
  let newActivatedValidators = event.params.activatedValidators.toI32();
  let activatedValidators = newActivatedValidators - pool.activatedValidators;

  pool.pendingValidators = pool.pendingValidators - activatedValidators;
  pool.activatedValidators = newActivatedValidators;
  pool.save();

  log.info(
    "[Pool] ActivatedValidatorsUpdated sender={} activatedValidators={}",
    [
      event.params.sender.toHexString(),
      event.params.activatedValidators.toString(),
    ]
  );
}

export function handleActivationScheduled(event: ActivationScheduled): void {
  let activation = createOrLoadDepositActivation(
    event.params.sender,
    event.params.validatorIndex
  );
  activation.save();

  let addedAmount = event.params.value.divDecimal(BIG_DECIMAL_1E18);
  activation.amount = activation.amount.plus(addedAmount);

  log.info("[Pool] ActivationScheduled sender={} validatorIndex={} amount={}", [
    activation.account.toHexString(),
    event.params.validatorIndex.toString(),
    addedAmount.toString(),
  ]);
}

export function handleActivated(event: Activated): void {
  let activationId = getDepositActivationId(
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
    event.params.value.divDecimal(BIG_DECIMAL_1E18).toString(),
    event.params.sender.toHexString(),
  ]);
}

export function handleValidatorInitialized(event: ValidatorInitialized): void {
  let operator = createOrLoadOperator(event.params.operator.toHexString());
  let validator = createOrLoadValidator(event.params.publicKey.toHexString());

  validator.operator = operator.id;
  validator.registrationStatus = "Initialized";
  validator.save();

  log.info("[Pool] ValidatorInitialized publicKey={} operator={}", [
    validator.id,
    operator.id,
  ]);
}

export function handleValidatorRegistered(event: ValidatorRegistered): void {
  let operator = createOrLoadOperator(event.params.operator.toHexString());
  let validator = createOrLoadValidator(event.params.publicKey.toHexString());

  validator.operator = operator.id;
  validator.registrationStatus = "Finalized";
  validator.save();

  let pool = createOrLoadPool();
  pool.pendingValidators += 1;
  pool.save();

  log.info("[Pool] ValidatorRegistered publicKey={} operator={}", [
    validator.id,
    operator.id,
  ]);
}

export function handlePaused(event: Paused): void {
  let settings = createOrLoadSettings();

  settings.poolPaused = true;
  settings.save();

  log.info("[Pool] Paused account={}", [event.params.account.toHexString()]);
}

export function handleUnpaused(event: Unpaused): void {
  let settings = createOrLoadSettings();

  settings.poolPaused = false;
  settings.save();

  log.info("[Pool] Unpaused account={}", [event.params.account.toHexString()]);
}
