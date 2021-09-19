import { log } from "@graphprotocol/graph-ts";
import { BIG_DECIMAL_1E18, MERKLE_DISTRIBUTOR_ADDRESS } from "const";
import {
  calculateHoldingPoints,
  createOrLoadNetwork,
  createOrLoadMerkleDistributor,
  createOrLoadStakeWiseTokenHolder,
  isSupportedSwiseHolder,
} from "../entities";
import {
  Paused,
  Transfer,
  Unpaused,
} from "../../generated/StakeWiseToken/StakeWiseToken";

export function handleTransfer(event: Transfer): void {
  let distributor = createOrLoadMerkleDistributor();
  let amount = event.params.value.divDecimal(BIG_DECIMAL_1E18);

  let fromId = event.params.from.toHexString();
  if (isSupportedSwiseHolder(event.params.from)) {
    let fromHolder = createOrLoadStakeWiseTokenHolder(
      fromId,
      event.block.number,
      event.block.timestamp
    );
    fromHolder.holdingPoints = calculateHoldingPoints(
      fromHolder,
      distributor.rewardsUpdatedAtBlock,
      event.block.number
    );
    fromHolder.balance = fromHolder.balance.minus(amount);
    fromHolder.updatedAtBlock = event.block.number;
    fromHolder.updatedAtTimestamp = event.block.timestamp;
    fromHolder.save();
  }

  let toId = event.params.to.toHexString();
  if (isSupportedSwiseHolder(event.params.to)) {
    let toHolder = createOrLoadStakeWiseTokenHolder(
      toId,
      event.block.number,
      event.block.timestamp
    );
    toHolder.holdingPoints = calculateHoldingPoints(
      toHolder,
      distributor.rewardsUpdatedAtBlock,
      event.block.number
    );
    if (event.params.from.equals(MERKLE_DISTRIBUTOR_ADDRESS)) {
      // SWISE located in Merkle Distributor belongs to the claimer
      toHolder.holdingPoints = toHolder.holdingPoints.plus(
        event.params.value.times(
          event.block.number.minus(distributor.rewardsUpdatedAtBlock)
        )
      );
    }
    toHolder.balance = toHolder.balance.plus(amount);
    toHolder.updatedAtBlock = event.block.number;
    toHolder.updatedAtTimestamp = event.block.timestamp;
    toHolder.save();
  }

  log.info("[StakeWiseToken] Transfer from={} to={} amount={}", [
    fromId,
    toId,
    amount.toString(),
  ]);
}

export function handlePaused(event: Paused): void {
  let network = createOrLoadNetwork();

  network.stakeWiseTokenPaused = true;
  network.save();

  log.info("[StakeWiseToken] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let network = createOrLoadNetwork();

  network.stakeWiseTokenPaused = false;
  network.save();

  log.info("[StakeWiseToken] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
