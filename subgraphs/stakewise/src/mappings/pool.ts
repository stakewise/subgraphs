import {
  BigDecimal,
  BigInt,
  ethereum,
  log,
  store,
} from "@graphprotocol/graph-ts";

import { BIG_DECIMAL_1E18 } from "const";
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
  createOrLoadNetwork,
  createOrLoadOperator,
  createOrLoadPool,
  createOrLoadValidator,
  getDepositActivationId,
} from "../entities";
import { Block, DepositActivation } from "../../generated/schema";

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

export function handleActivationScheduled(event: ActivationScheduled): void {
  let activation = createOrLoadDepositActivation(
    event.params.sender,
    event.params.validatorIndex
  );
  activation.save();

  let addedAmount = event.params.value.divDecimal(BIG_DECIMAL_1E18);
  activation.amount = activation.amount.plus(addedAmount);

  let pool = createOrLoadPool();
  pool.balance = pool.balance.plus(addedAmount);
  pool.save();

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
  let activatedAmount = event.params.value.divDecimal(BIG_DECIMAL_1E18);

  if (activation != null) {
    store.remove("DepositActivation", activationId);
    // remove activated amount as it was added during mint and scheduled activation
    let pool = createOrLoadPool();
    pool.balance = pool.balance.minus(activatedAmount);
    pool.save();
  }

  log.info("[Pool] Activated account={} validatorIndex={} value={} sender={}", [
    event.params.account.toHexString(),
    event.params.validatorIndex.toString(),
    activatedAmount.toString(),
    event.params.sender.toHexString(),
  ]);
}

export function handleValidatorInitialized(event: ValidatorInitialized): void {
  let operator = createOrLoadOperator(event.params.operator.toHexString());
  let validator = createOrLoadValidator(event.params.publicKey.toHexString());

  validator.operator = operator.id;
  validator.registrationStatus = "Initialized";
  validator.save();

  operator.validatorsCount = operator.validatorsCount.plus(
    BigInt.fromString("1")
  );
  operator.save();

  // initialization is done with 1 ether deposit to the eth2 contract
  let pool = createOrLoadPool();
  pool.balance = pool.balance.minus(BIG_DECIMAL_1E18);
  pool.save();

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
  pool.pendingValidators = pool.pendingValidators.plus(BigInt.fromString("1"));

  if (validator.registrationStatus == "Uninitialized") {
    // compatibility with v1 contracts
    pool.balance = pool.balance.minus(
      BIG_DECIMAL_1E18.times(BigDecimal.fromString("32"))
    );
    operator.validatorsCount = operator.validatorsCount.plus(
      BigInt.fromString("1")
    );
  } else {
    // finalization is done with 31 ether deposit to the eth2 contract
    pool.balance = pool.balance.minus(
      BIG_DECIMAL_1E18.times(BigDecimal.fromString("31"))
    );
    operator.depositDataIndex = operator.depositDataIndex.plus(
      BigInt.fromString("1")
    );
  }
  operator.save();
  pool.save();

  log.info("[Pool] ValidatorRegistered publicKey={} operator={}", [
    validator.id,
    operator.id,
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
