import { log, store } from "@graphprotocol/graph-ts";

import { VALIDATOR_DEPOSIT_AMOUNT, BIG_INT_ONE } from "const";
import {
  Activated,
  ActivatedValidatorsUpdated,
  ActivationScheduled,
  MinActivatingDepositUpdated,
  Paused,
  PendingValidatorsLimitUpdated,
  Refunded,
  StakedWithPartner,
  StakedWithReferrer,
  Unpaused,
  ValidatorRegistered,
} from "../../generated/Pool/Pool";
import {
  createOrLoadDepositActivation,
  createOrLoadNetwork,
  createOrLoadOperator,
  createOrLoadOperatorAllocation,
  createOrLoadPool,
  createOrLoadValidator,
  getDepositActivationId,
  loadPartner,
} from "../entities";
import { DepositActivation, Referral } from "../../generated/schema";

export function handleMinActivatingDepositUpdated(
  event: MinActivatingDepositUpdated
): void {
  let pool = createOrLoadPool();

  pool.minActivatingDeposit = event.params.minActivatingDeposit;
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

  pool.pendingValidatorsLimit = event.params.pendingValidatorsLimit;
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
  let newActivatedValidators = event.params.activatedValidators;
  let activatedValidators = newActivatedValidators.minus(
    pool.activatedValidators
  );

  pool.pendingValidators = pool.pendingValidators.minus(activatedValidators);
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

export function handleStakeWithPartner(event: StakedWithPartner): void {
  let partner = loadPartner(event.params.partner, event.block.number);
  if (partner == null) {
    // process only registered partners
    return;
  }
  partner.contributedAmount = partner.contributedAmount.plus(
    event.params.amount
  );
  partner.updatedAtBlock = event.block.number;
  partner.updatedAtTimestamp = event.block.timestamp;
  partner.save();

  log.info("[Pool] StakedWithPartner sender={} partner={} amount={}", [
    event.transaction.from.toHexString(),
    partner.id,
    event.params.amount.toString(),
  ]);
}

export function handleStakeWithReferrer(event: StakedWithReferrer): void {
  let referralId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());
  let referral = new Referral(referralId);
  referral.referrer = event.params.referrer;
  referral.amount = event.params.amount;
  referral.createdAtBlock = event.block.number;
  referral.createdAtTimestamp = event.block.timestamp;
  referral.save();

  log.info("[Pool] StakedWithReferrer sender={} referrer={} amount={}", [
    event.transaction.from.toHexString(),
    event.params.referrer.toHexString(),
    event.params.amount.toString(),
  ]);
}

export function handleActivationScheduled(event: ActivationScheduled): void {
  let activation = createOrLoadDepositActivation(
    event.params.sender,
    event.params.validatorIndex
  );

  activation.amount = activation.amount.plus(event.params.value);
  activation.createdAtBlock = event.block.number;
  activation.createdAtTimestamp = event.block.timestamp;
  activation.save();

  let pool = createOrLoadPool();
  pool.balance = pool.balance.plus(event.params.value);
  pool.save();

  log.info("[Pool] ActivationScheduled sender={} validatorIndex={} amount={}", [
    activation.account.toHexString(),
    event.params.validatorIndex.toString(),
    event.params.value.toString(),
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
    // remove activated amount as it was added during mint and scheduled activation
    let pool = createOrLoadPool();
    pool.balance = pool.balance.minus(event.params.value);
    pool.save();
  }

  log.info("[Pool] Activated account={} validatorIndex={} value={} sender={}", [
    event.params.account.toHexString(),
    event.params.validatorIndex.toString(),
    event.params.value.toString(),
    event.params.sender.toHexString(),
  ]);
}

export function handleValidatorRegistered(event: ValidatorRegistered): void {
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );
  let validator = createOrLoadValidator(event.params.publicKey);
  let pool = createOrLoadPool();

  pool.pendingValidators = pool.pendingValidators.plus(BIG_INT_ONE);
  pool.balance = pool.balance.minus(VALIDATOR_DEPOSIT_AMOUNT);
  pool.save();

  let allocation = createOrLoadOperatorAllocation(operator);
  allocation.validatorsCount = allocation.validatorsCount.plus(BIG_INT_ONE);
  allocation.save();

  operator.validatorsCount = operator.validatorsCount.plus(BIG_INT_ONE);
  operator.depositDataIndex = operator.depositDataIndex.plus(BIG_INT_ONE);
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.save();

  validator.operator = operator.id;
  validator.createdAtBlock = event.block.number;
  validator.createdAtTimestamp = event.block.timestamp;
  validator.save();

  log.info("[Pool] ValidatorRegistered publicKey={} operator={}", [
    validator.id,
    operator.id,
  ]);
}

export function handleRefunded(event: Refunded): void {
  let pool = createOrLoadPool();

  pool.balance = pool.balance.plus(event.params.amount);
  pool.save();

  log.info("[Pool] Refunded sender={} amount={}", [
    event.transaction.from.toHexString(),
    event.params.amount.toString(),
  ]);
}

export function handlePaused(event: Paused): void {
  let network = createOrLoadNetwork();

  network.poolPaused = true;
  network.save();

  log.info("[Pool] Paused account={}", [event.params.account.toHexString()]);
}

export function handleUnpaused(event: Unpaused): void {
  let network = createOrLoadNetwork();

  network.poolPaused = false;
  network.save();

  log.info("[Pool] Unpaused account={}", [event.params.account.toHexString()]);
}
