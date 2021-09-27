import { BigInt, log } from "@graphprotocol/graph-ts";
import { BIG_INT_ZERO, BYTES_ZERO } from "const";
import {
  createOrLoadOperator,
  createOrLoadNetwork,
  createOrLoadValidator,
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
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );

  operator.initializeMerkleRoot = event.params.initializeMerkleRoot;
  operator.initializeMerkleProofs = event.params.initializeMerkleProofs;
  operator.finalizeMerkleRoot = event.params.finalizeMerkleRoot;
  operator.finalizeMerkleProofs = event.params.finalizeMerkleProofs;
  operator.depositDataIndex = BIG_INT_ZERO;
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
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
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );

  operator.initializeMerkleRoot = BYTES_ZERO;
  operator.initializeMerkleProofs = "";
  operator.finalizeMerkleRoot = BYTES_ZERO;
  operator.finalizeMerkleProofs = "";
  operator.depositDataIndex = BIG_INT_ZERO;
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.save();

  log.info("[PoolValidators] OperatorRemoved operator={} sender={}", [
    operator.id,
    event.params.sender.toHexString(),
  ]);
}

export function handleOperatorSlashed(event: OperatorSlashed): void {
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );

  operator.initializeMerkleRoot = BYTES_ZERO;
  operator.initializeMerkleProofs = "";
  operator.finalizeMerkleRoot = BYTES_ZERO;
  operator.finalizeMerkleProofs = "";
  operator.depositDataIndex = BIG_INT_ZERO;
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.collateral = operator.collateral.minus(event.params.refundedAmount);
  operator.validatorsCount = operator.validatorsCount.minus(
    BigInt.fromString("1")
  );
  operator.save();

  let validator = createOrLoadValidator(event.params.publicKey);
  validator.registrationStatus = "Failed";
  validator.save();

  log.info(
    "[PoolValidators] OperatorSlashed operator={} publicKey={} refundAmount={}",
    [operator.id, validator.id, event.params.refundedAmount.toString()]
  );
}

export function handleCollateralDeposited(event: CollateralDeposited): void {
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );

  operator.collateral = operator.collateral.plus(event.params.collateral);
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.save();

  log.info("[PoolValidators] CollateralDeposited operator={} collateral={}", [
    operator.id,
    event.params.collateral.toString(),
  ]);
}

export function handleCollateralWithdrawn(event: CollateralWithdrawn): void {
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );

  operator.collateral = operator.collateral.minus(event.params.collateral);
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.save();

  log.info(
    "[PoolValidators] CollateralWithdrawn operator={} collateral={} collateralRecipient={}",
    [
      operator.id,
      event.params.collateral.toString(),
      event.params.collateralRecipient.toHexString(),
    ]
  );
}

export function handlePaused(event: Paused): void {
  let network = createOrLoadNetwork();

  network.poolValidatorsPaused = true;
  network.save();

  log.info("[PoolValidators] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let network = createOrLoadNetwork();

  network.poolValidatorsPaused = false;
  network.save();

  log.info("[PoolValidators] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
