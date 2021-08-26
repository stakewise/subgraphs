import { log } from "@graphprotocol/graph-ts";
import { BIG_DECIMAL_1E18, BYTES_ZERO } from "const";
import {
  createOrLoadSettings,
  createOrLoadRewardEthTokenHolder,
  createOrLoadStakedEthTokenHolder,
  calculateRewardEthTokenHolderBalance,
} from "../entities";
import {
  Paused,
  Unpaused,
  RewardsUpdated,
  Transfer,
} from "../../generated/RewardEthToken/RewardEthToken";

export function handleRewardsUpdated(event: RewardsUpdated): void {
  let settings = createOrLoadSettings();

  settings.rewardPerStakedEthToken =
    event.params.rewardPerToken.divDecimal(BIG_DECIMAL_1E18);
  settings.rewardsUpdatedAtTimestamp = event.block.timestamp;
  settings.save();

  log.info("[RewardEthToken] RewardsUpdated timestamp={} rewardPerToken={}", [
    event.block.timestamp.toString(),
    settings.rewardPerStakedEthToken.toString(),
  ]);
}

export function handleTransfer(event: Transfer): void {
  let settings = createOrLoadSettings();
  let amount = event.params.value.divDecimal(BIG_DECIMAL_1E18);

  let fromId = event.params.from.toHexString();
  if (event.params.from.notEqual(BYTES_ZERO)) {
    let rewardEthHolder = createOrLoadRewardEthTokenHolder(
      fromId,
      settings.rewardPerStakedEthToken
    );
    if (
      settings.rewardPerStakedEthToken.gt(
        rewardEthHolder.rewardPerStakedEthToken
      )
    ) {
      rewardEthHolder.checkpointBalance = calculateRewardEthTokenHolderBalance(
        rewardEthHolder,
        createOrLoadStakedEthTokenHolder(fromId),
        settings.rewardPerStakedEthToken
      );
    }

    rewardEthHolder.checkpointBalance =
      rewardEthHolder.checkpointBalance.minus(amount);
    rewardEthHolder.save();
  }

  let toId = event.params.to.toHexString();
  if (event.params.from.notEqual(BYTES_ZERO)) {
    let rewardEthHolder = createOrLoadRewardEthTokenHolder(
      toId,
      settings.rewardPerStakedEthToken
    );
    if (
      settings.rewardPerStakedEthToken.gt(
        rewardEthHolder.rewardPerStakedEthToken
      )
    ) {
      rewardEthHolder.checkpointBalance = calculateRewardEthTokenHolderBalance(
        rewardEthHolder,
        createOrLoadStakedEthTokenHolder(toId),
        settings.rewardPerStakedEthToken
      );
    }

    rewardEthHolder.checkpointBalance =
      rewardEthHolder.checkpointBalance.plus(amount);
    rewardEthHolder.save();
  }

  log.info("[RewardEthToken] Transfer from={} to={} amount={}", [
    fromId,
    toId,
    amount.toString(),
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
