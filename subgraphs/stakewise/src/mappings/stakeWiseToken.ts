import { log } from "@graphprotocol/graph-ts";

import {
  createOrLoadSettings,
  createOrLoadStakeWiseTokenHolder,
  calculateHoldingPoints,
} from "../entities";
import {
  Transfer,
  Paused,
  Unpaused,
} from "../../generated/StakeWiseToken/StakeWiseToken";
import { BIG_DECIMAL_1E18, EMPTY_BYTES } from "../constants";

export function handleTransfer(event: Transfer): void {
  let settings = createOrLoadSettings();
  let amount = event.params.value.divDecimal(BIG_DECIMAL_1E18);

  let fromId = event.params.from.toHexString();
  if (event.params.from.notEqual(EMPTY_BYTES)) {
    let fromHolder = createOrLoadStakeWiseTokenHolder(
      fromId,
      event.block.timestamp
    );
    fromHolder.holdingPoints = calculateHoldingPoints(
      fromHolder,
      settings.rewardsUpdatedAtTimestamp,
      event.block.timestamp
    );
    fromHolder.balance = fromHolder.balance.minus(amount);
    fromHolder.updatedAtTimestamp = event.block.timestamp;
    fromHolder.save();
  }

  let toId = event.params.to.toHexString();
  if (event.params.to.notEqual(EMPTY_BYTES)) {
    let toHolder = createOrLoadStakeWiseTokenHolder(
      toId,
      event.block.timestamp
    );
    toHolder.holdingPoints = calculateHoldingPoints(
      toHolder,
      settings.rewardsUpdatedAtTimestamp,
      event.block.timestamp
    );
    toHolder.balance = toHolder.balance.plus(amount);
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
  let settings = createOrLoadSettings();

  settings.stakeWiseTokenPaused = true;
  settings.save();

  log.info("[StakeWiseToken] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let settings = createOrLoadSettings();

  settings.stakeWiseTokenPaused = false;
  settings.save();

  log.info("[StakeWiseToken] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
