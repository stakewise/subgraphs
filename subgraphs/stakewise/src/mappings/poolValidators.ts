import { log } from "@graphprotocol/graph-ts";
import { BIG_INT_ONE, BIG_INT_ZERO, BYTES_ZERO } from "const";
import { createOrLoadOperator, createOrLoadNetwork } from "../entities";
import {
  OperatorCommitted,
  OperatorAdded,
  OperatorRemoved,
  Paused,
  Unpaused,
} from "../../generated/PoolValidators/PoolValidators";

export function handleOperatorAdded(event: OperatorAdded): void {
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );

  operator.depositDataMerkleRoot = event.params.depositDataMerkleRoot;
  operator.depositDataMerkleProofs = event.params.depositDataMerkleProofs;
  operator.committed = false;
  operator.depositDataIndex = BIG_INT_ZERO;
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.allocationsCount = operator.allocationsCount.plus(BIG_INT_ONE);
  operator.save();

  log.info(
    "[PoolValidators] OperatorAdded operator={} depositDataMerkleRoot={} depositDataMerkleProofs={}",
    [
      operator.id,
      operator.depositDataMerkleRoot.toHexString(),
      operator.depositDataMerkleProofs,
    ]
  );
}

export function handleOperatorRemoved(event: OperatorRemoved): void {
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );

  operator.depositDataMerkleRoot = BYTES_ZERO;
  operator.depositDataMerkleProofs = "";
  operator.depositDataIndex = BIG_INT_ZERO;
  operator.committed = false;
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.save();

  log.info("[PoolValidators] OperatorRemoved operator={} sender={}", [
    operator.id,
    event.params.sender.toHexString(),
  ]);
}

export function handleOperatorCommitted(event: OperatorCommitted): void {
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );

  operator.committed = true;
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.save();

  log.info("[PoolValidators] OperatorCommitted operator={}", [operator.id]);
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
