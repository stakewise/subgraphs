import { log } from "@graphprotocol/graph-ts";
import { ADDRESS_ZERO, BIG_DECIMAL_1E18 } from "const";
import {
  createOrLoadNetwork,
  createOrLoadRewardEthToken,
  createOrLoadStaker,
} from "../entities";
import { RewardsUpdated as RewardsUpdatedV0 } from "../../generated/RewardEthTokenV0/RewardEthTokenV0";
import { RewardsUpdated as RewardsUpdatedV1 } from "../../generated/RewardEthTokenV1/RewardEthTokenV1";
import {
  Paused,
  RewardsToggled,
  RewardsUpdated as RewardsUpdatedV2,
  Transfer,
  Unpaused,
} from "../../generated/RewardEthTokenV2/RewardEthTokenV2";

export function handleRewardsUpdatedV0(event: RewardsUpdatedV0): void {
  let rewardEthToken = createOrLoadRewardEthToken();

  rewardEthToken.rewardPerStakedEthToken =
    event.params.rewardPerToken.divDecimal(BIG_DECIMAL_1E18);
  rewardEthToken.updatedAtBlock = event.block.number;
  rewardEthToken.updatedAtTimestamp = event.block.timestamp;
  rewardEthToken.save();

  log.info(
    "[RewardEthToken] RewardsUpdated V0 timestamp={} rewardPerToken={}",
    [
      rewardEthToken.updatedAtTimestamp.toString(),
      rewardEthToken.rewardPerStakedEthToken.toString(),
    ]
  );
}

export function handleRewardsUpdatedV1(event: RewardsUpdatedV1): void {
  let rewardEthToken = createOrLoadRewardEthToken();

  rewardEthToken.rewardPerStakedEthToken =
    event.params.rewardPerToken.divDecimal(BIG_DECIMAL_1E18);

  rewardEthToken.updatedAtBlock = event.block.number;
  rewardEthToken.updatedAtTimestamp = event.block.timestamp;
  rewardEthToken.save();

  log.info(
    "[RewardEthToken] RewardsUpdated V1 timestamp={} rewardPerToken={}",
    [
      rewardEthToken.updatedAtTimestamp.toString(),
      rewardEthToken.rewardPerStakedEthToken.toString(),
    ]
  );
}

export function handleRewardsUpdatedV2(event: RewardsUpdatedV2): void {
  let rewardEthToken = createOrLoadRewardEthToken();

  rewardEthToken.rewardPerStakedEthToken =
    event.params.rewardPerToken.divDecimal(BIG_DECIMAL_1E18);

  let protocolReward = event.params.protocolReward.divDecimal(BIG_DECIMAL_1E18);
  rewardEthToken.protocolPeriodReward =
    rewardEthToken.protocolPeriodReward.plus(protocolReward);

  let distributorReward = event.params.distributorReward
    .divDecimal(BIG_DECIMAL_1E18)
    .minus(protocolReward);
  rewardEthToken.distributorPeriodReward =
    rewardEthToken.distributorPeriodReward.plus(distributorReward);

  rewardEthToken.updatedAtBlock = event.block.number;
  rewardEthToken.updatedAtTimestamp = event.block.timestamp;
  rewardEthToken.save();

  log.info(
    "[RewardEthToken] RewardsUpdated V2 timestamp={} rewardPerToken={} protocolReward={} distributorReward={}",
    [
      rewardEthToken.updatedAtTimestamp.toString(),
      rewardEthToken.rewardPerStakedEthToken.toString(),
      protocolReward.toString(),
      distributorReward.toString(),
    ]
  );
}

export function handleTransfer(event: Transfer): void {
  let rewardEthToken = createOrLoadRewardEthToken();
  let amount = event.params.value.divDecimal(BIG_DECIMAL_1E18);

  let fromId = event.params.from.toHexString();
  if (event.params.from.notEqual(ADDRESS_ZERO)) {
    let fromStaker = createOrLoadStaker(
      fromId,
      rewardEthToken.rewardPerStakedEthToken
    );
    fromStaker.rewardBalance = fromStaker.rewardBalance.minus(amount);
    fromStaker.save();
  }

  let toId = event.params.to.toHexString();
  if (event.params.to.notEqual(ADDRESS_ZERO)) {
    let toStaker = createOrLoadStaker(
      toId,
      rewardEthToken.rewardPerStakedEthToken
    );
    toStaker.rewardBalance = toStaker.rewardBalance.plus(amount);
    toStaker.save();
  }

  log.info("[RewardEthToken] Transfer from={} to={} amount={}", [
    fromId,
    toId,
    amount.toString(),
  ]);
}

export function handleRewardsToggled(event: RewardsToggled): void {
  let rewardEthToken = createOrLoadRewardEthToken();
  let staker = createOrLoadStaker(
    event.params.account.toHexString(),
    rewardEthToken.rewardPerStakedEthToken
  );

  staker.rewardsDisabled = event.params.isDisabled;
  staker.save();

  log.info(
    "[RewardEthToken] RewardsToggled account={} isDisabled={} sender={}",
    [
      staker.id,
      staker.rewardsDisabled ? "true" : "false",
      event.transaction.from.toHexString(),
    ]
  );
}

export function handlePaused(event: Paused): void {
  let network = createOrLoadNetwork();

  network.rewardEthTokenPaused = true;
  network.save();

  log.info("[RewardEthToken] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let network = createOrLoadNetwork();

  network.rewardEthTokenPaused = false;
  network.save();

  log.info("[RewardEthToken] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
