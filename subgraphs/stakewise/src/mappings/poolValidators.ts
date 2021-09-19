import { log } from "@graphprotocol/graph-ts";
import { BIG_DECIMAL_1E18, BIG_INT_ZERO, BYTES_ZERO } from "const";
import {
  createOrLoadOperator,
  createOrLoadNetwork,
  createOrLoadValidator,
  createOrLoadPool,
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
  let operator = createOrLoadOperator(event.params.operator.toHexString());

  operator.initializeMerkleRoot = event.params.initializeMerkleRoot;
  operator.initializeMerkleProofs = event.params.initializeMerkleProofs;
  operator.finalizeMerkleRoot = event.params.finalizeMerkleRoot;
  operator.finalizeMerkleProofs = event.params.finalizeMerkleProofs;
  operator.depositDataIndex = BIG_INT_ZERO;
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
  let operator = createOrLoadOperator(event.params.operator.toHexString());

  operator.initializeMerkleRoot = BYTES_ZERO;
  operator.initializeMerkleProofs = "";
  operator.finalizeMerkleRoot = BYTES_ZERO;
  operator.finalizeMerkleProofs = "";
  operator.depositDataIndex = BIG_INT_ZERO;
  operator.save();

  log.info("[PoolValidators] OperatorRemoved operator={} sender={}", [
    operator.id,
    event.params.sender.toHexString(),
  ]);
}

export function handleOperatorSlashed(event: OperatorSlashed): void {
  let operator = createOrLoadOperator(event.params.operator.toHexString());
  let refundedAmount = event.params.refundedAmount.divDecimal(BIG_DECIMAL_1E18);

  operator.initializeMerkleRoot = BYTES_ZERO;
  operator.initializeMerkleProofs = "";
  operator.finalizeMerkleRoot = BYTES_ZERO;
  operator.finalizeMerkleProofs = "";
  operator.depositDataIndex = BIG_INT_ZERO;
  operator.collateral = operator.collateral.minus(refundedAmount);
  operator.save();

  let pool = createOrLoadPool();
  pool.balance = pool.balance.plus(refundedAmount);
  pool.save();

  let validator = createOrLoadValidator(event.params.publicKey.toHexString());
  validator.registrationStatus = "Failed";
  validator.save();

  log.info(
    "[PoolValidators] OperatorSlashed operator={} publicKey={} refundAmount={}",
    [operator.id, validator.id, refundedAmount.toString()]
  );
}

export function handleCollateralDeposited(event: CollateralDeposited): void {
  let operator = createOrLoadOperator(event.params.operator.toHexString());
  let collateral = event.params.collateral.divDecimal(BIG_DECIMAL_1E18);

  operator.collateral = operator.collateral.plus(collateral);
  operator.save();

  log.info("[PoolValidators] CollateralDeposited operator={} collateral={}", [
    operator.id,
    collateral.toString(),
  ]);
}

export function handleCollateralWithdrawn(event: CollateralWithdrawn): void {
  let operator = createOrLoadOperator(event.params.operator.toHexString());
  let collateral = event.params.collateral.divDecimal(BIG_DECIMAL_1E18);

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
