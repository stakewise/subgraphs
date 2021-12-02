import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  REWARD_ETH_TOKEN_ADDRESS,
  BIG_INT_ZERO,
  ORACLES_UPDATE_PERIOD,
} from "const";
import { RewardEthToken, StakingRewardsPeriod } from "../../generated/schema";

export function createOrLoadRewardEthToken(): RewardEthToken {
  let rewardEthTokenAddress = REWARD_ETH_TOKEN_ADDRESS.toHexString();
  let rewardEthToken = RewardEthToken.load(rewardEthTokenAddress);

  if (rewardEthToken == null) {
    rewardEthToken = new RewardEthToken(rewardEthTokenAddress);

    rewardEthToken.rewardPerStakedEthToken = BIG_INT_ZERO;
    rewardEthToken.distributorPeriodReward = BIG_INT_ZERO;
    rewardEthToken.protocolPeriodReward = BIG_INT_ZERO;
    rewardEthToken.updatedAtBlock = BIG_INT_ZERO;
    rewardEthToken.updatedAtTimestamp = BIG_INT_ZERO;
    rewardEthToken.save();
  }
  return rewardEthToken as RewardEthToken;
}

export function updateStakingRewardsPeriod(
  periodTotalRewards: BigInt,
  periodProtocolRewards: BigInt,
  block: ethereum.Block
): void {
  let stakingRewardsPeriod = StakingRewardsPeriod.load("1");
  if (stakingRewardsPeriod == null) {
    stakingRewardsPeriod = new StakingRewardsPeriod("1");
    stakingRewardsPeriod.periodProtocolRewards = periodProtocolRewards;
    stakingRewardsPeriod.periodTotalRewards = periodTotalRewards;
    stakingRewardsPeriod.periodDuration = BIG_INT_ZERO;
    stakingRewardsPeriod.updatedAtBlock = block.number;
    stakingRewardsPeriod.updatedAtTimestamp = block.timestamp;
    stakingRewardsPeriod.save();
  } else {
    let periodDuration = BIG_INT_ZERO;
    let submitDuration = block.timestamp.minus(
      stakingRewardsPeriod.updatedAtTimestamp
    );
    while (periodDuration.plus(ORACLES_UPDATE_PERIOD).lt(submitDuration)) {
      periodDuration = periodDuration.plus(ORACLES_UPDATE_PERIOD);
    }

    stakingRewardsPeriod.periodDuration = periodDuration;
    stakingRewardsPeriod.periodTotalRewards = periodTotalRewards;
    stakingRewardsPeriod.periodProtocolRewards = periodProtocolRewards;
    stakingRewardsPeriod.updatedAtBlock = block.number;
    stakingRewardsPeriod.updatedAtTimestamp = block.timestamp;
    stakingRewardsPeriod.save();
  }
}
