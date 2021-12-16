import { log } from "@graphprotocol/graph-ts";
import { BIG_INT_ONE, BIG_INT_ZERO, BYTES_ZERO } from "const";
import {
  createOrLoadOperator,
  createOrLoadNetwork,
  createOrLoadValidator,
  createOrLoadOperatorAllocation,
} from "../entities";
import {
  OperatorCommitted,
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
  operator.committed = false;
  operator.locked = false;
  operator.depositDataIndex = BIG_INT_ZERO;
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.allocationsCount = operator.allocationsCount.plus(BIG_INT_ONE);
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
  operator.committed = false;
  operator.locked = false;
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

  let allocation = createOrLoadOperatorAllocation(
    operator.allocationsCount.toString(),
    operator.id
  );
  allocation.validatorsCount = allocation.validatorsCount.minus(BIG_INT_ONE);
  allocation.save();

  operator.initializeMerkleRoot = BYTES_ZERO;
  operator.initializeMerkleProofs = "";
  operator.finalizeMerkleRoot = BYTES_ZERO;
  operator.finalizeMerkleProofs = "";
  operator.depositDataIndex = BIG_INT_ZERO;
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.committed = false;
  operator.locked = false;
  operator.collateral = operator.collateral.minus(event.params.refundedAmount);
  operator.validatorsCount = operator.validatorsCount.minus(BIG_INT_ONE);
  operator.save();

  let validator = createOrLoadValidator(event.params.publicKey);
  validator.registrationStatus = "Failed";
  validator.save();

  log.info(
    "[PoolValidators] OperatorSlashed operator={} publicKey={} refundAmount={}",
    [operator.id, validator.id, event.params.refundedAmount.toString()]
  );
}

export function handleOperatorCommitted(event: OperatorCommitted): void {
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );

  operator.collateral = operator.collateral.plus(event.params.collateral);
  operator.committed = true;
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.save();

  log.info("[PoolValidators] OperatorCommitted operator={} collateral={}", [
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
