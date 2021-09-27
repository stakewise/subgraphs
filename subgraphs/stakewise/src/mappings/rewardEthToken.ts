import { log } from "@graphprotocol/graph-ts";
import { ADDRESS_ZERO, CONTRACT_CHECKER_ADDRESS } from "const";
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
import { ContractChecker } from "../../generated/StakeWiseToken/ContractChecker";

export function handleRewardsUpdatedV0(event: RewardsUpdatedV0): void {
  let rewardEthToken = createOrLoadRewardEthToken();

  rewardEthToken.rewardPerStakedEthToken = event.params.rewardPerToken;
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

  rewardEthToken.rewardPerStakedEthToken = event.params.rewardPerToken;
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

  rewardEthToken.rewardPerStakedEthToken = event.params.rewardPerToken;
  rewardEthToken.protocolPeriodReward =
    rewardEthToken.protocolPeriodReward.plus(event.params.protocolReward);

  let distributorReward = event.params.distributorReward.minus(
    event.params.protocolReward
  );
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
      event.params.protocolReward.toString(),
      distributorReward.toString(),
    ]
  );
}

export function handleTransfer(event: Transfer): void {
  let contractChecker = ContractChecker.bind(CONTRACT_CHECKER_ADDRESS);

  if (event.params.from.notEqual(ADDRESS_ZERO)) {
    let fromStaker = createOrLoadStaker(event.params.from, contractChecker);
    fromStaker.rewardBalance = fromStaker.rewardBalance.minus(
      event.params.value
    );
    fromStaker.save();
  }

  if (event.params.to.notEqual(ADDRESS_ZERO)) {
    let toStaker = createOrLoadStaker(event.params.to, contractChecker);
    toStaker.rewardBalance = toStaker.rewardBalance.plus(event.params.value);
    toStaker.save();
  }

  log.info("[RewardEthToken] Transfer from={} to={} value={}", [
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value.toString(),
  ]);
}

export function handleRewardsToggled(event: RewardsToggled): void {
  let contractChecker = ContractChecker.bind(CONTRACT_CHECKER_ADDRESS);
  let rewardEthToken = createOrLoadRewardEthToken();

  let staker = createOrLoadStaker(event.params.account, contractChecker);
  staker.rewardsDisabled = event.params.isDisabled;
  staker.rewardPerStakedEthToken = rewardEthToken.rewardPerStakedEthToken;
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
