import { log } from "@graphprotocol/graph-ts";

import { createOrLoadSettings } from "../entities";
import {
  Paused,
  Unpaused,
  RewardsUpdated,
} from "../../generated/RewardEthToken/RewardEthToken";

export function handleRewardsUpdated(event: RewardsUpdated): void {
  let settings = createOrLoadSettings();

  settings.rewardsUpdatedAtTimestamp = event.block.timestamp;
  settings.save();

  log.info("[RewardEthToken] RewardsUpdated timestamp={}", [
    event.block.timestamp.toString(),
  ]);
}

export function handlePaused(event: Paused): void {
  let settings = createOrLoadSettings();

  settings.rewardEthTokenPaused = true;
  settings.save();

  log.info("[RewardEthToken] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let settings = createOrLoadSettings();

  settings.rewardEthTokenPaused = false;
  settings.save();

  log.info("[RewardEthToken] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
