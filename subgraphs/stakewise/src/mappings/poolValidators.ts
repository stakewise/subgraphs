import { Bytes, log } from "@graphprotocol/graph-ts";

import {
  createOrLoadOperator,
  createOrLoadSettings,
  createOrLoadValidator,
  RegistrationStatus,
} from "../entities";
import {
  CollateralDeposited,
  CollateralWithdrawn,
  OperatorAdded,
  OperatorRemoved,
  OperatorSlashed,
  Paused,
  Unpaused,
} from "../../generated/PoolValidators/PoolValidators";

export function handleOperatorAdded(event: OperatorAdded): void {
  const operator = createOrLoadOperator(event.params.operator.toHexString());

  operator.initializeMerkleRoot = event.params.initializeMerkleRoot;
  operator.initializeMerkleProofs = event.params.initializeMerkleProofs;
  operator.finalizeMerkleRoot = event.params.finalizeMerkleRoot;
  operator.finalizeMerkleProofs = event.params.finalizeMerkleProofs;
  operator.save();

  log.info(
    "[PoolValidators] OperatorAdded operator={} initializeMerkleRoot={} initializeMerkleProofs={} finalizeMerkleRoot={} finalizeMerkleProofs={}",
    [
      operator.id,
      operator.initializeMerkleRoot.toHexString(),
      operator.initializeMerkleProofs,
      operator.finalizeMerkleRoot.toHexString(),
      operator.finalizeMerkleProofs,
    ]
  );
}

export function handleOperatorRemoved(event: OperatorRemoved): void {
  const operator = createOrLoadOperator(event.params.operator.toHexString());

  operator.initializeMerkleRoot = Bytes.fromI32(0);
  operator.initializeMerkleProofs = "";
  operator.finalizeMerkleRoot = Bytes.fromI32(0);
  operator.finalizeMerkleProofs = "";
  operator.save();

  log.info("[PoolValidators] OperatorRemoved operator={} sender={}", [
    operator.id,
    event.params.sender.toHexString(),
  ]);
}

export function handleOperatorSlashed(event: OperatorSlashed): void {
  const operator = createOrLoadOperator(event.params.operator.toHexString());
  const refundedAmount = event.params.refundedAmount.toBigDecimal();

  operator.initializeMerkleRoot = Bytes.fromI32(0);
  operator.initializeMerkleProofs = "";
  operator.finalizeMerkleRoot = Bytes.fromI32(0);
  operator.finalizeMerkleProofs = "";
  operator.collateral = operator.collateral.minus(refundedAmount);
  operator.save();

  const validator = createOrLoadValidator(event.params.publicKey.toHexString());
  validator.registrationStatus = RegistrationStatus.Failed;
  validator.save();

  log.info(
    "[PoolValidators] OperatorSlashed operator={} publicKey={} refundAmount={}",
    [operator.id, validator.id, refundedAmount.toString()]
  );
}

export function handleCollateralDeposited(event: CollateralDeposited): void {
  const operator = createOrLoadOperator(event.params.operator.toHexString());
  const collateral = event.params.collateral.toBigDecimal();

  operator.collateral = operator.collateral.plus(collateral);
  operator.save();

  log.info("[PoolValidators] CollateralDeposited operator={} collateral={}", [
    operator.id,
    collateral.toString(),
  ]);
}

export function handleCollateralWithdrawn(event: CollateralWithdrawn): void {
  const operator = createOrLoadOperator(event.params.operator.toHexString());
  const collateral = event.params.collateral.toBigDecimal();

  operator.collateral = operator.collateral.minus(collateral);
  operator.save();

  log.info(
    "[PoolValidators] CollateralWithdrawn operator={} collateral={} collateralRecipient={}",
    [
      operator.id,
      collateral.toString(),
      event.params.collateralRecipient.toHexString(),
    ]
  );
}

export function handlePaused(event: Paused): void {
  const settings = createOrLoadSettings();

  settings.poolValidatorsPaused = true;
  settings.save();

  log.info("[PoolValidators] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  const settings = createOrLoadSettings();

  settings.poolValidatorsPaused = false;
  settings.save();

  log.info("[PoolValidators] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
