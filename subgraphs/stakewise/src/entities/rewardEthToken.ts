import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  REWARD_ETH_TOKEN_ADDRESS,
  BIG_INT_ZERO,
  ORACLES_UPDATE_PERIOD,
} from "const";
import { RewardEthToken, PeriodStakingRewards } from "../../generated/schema";

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

export function updatePeriodStakingRewards(
  periodTotalRewards: BigInt,
  periodProtocolRewards: BigInt,
  block: ethereum.Block
): void {
  let periodStakingRewards = PeriodStakingRewards.load("1");
  if (periodStakingRewards == null) {
    periodStakingRewards = new PeriodStakingRewards("1");
    periodStakingRewards.periodProtocolRewards = periodProtocolRewards;
    periodStakingRewards.periodTotalRewards = periodTotalRewards;
    periodStakingRewards.periodDuration = BIG_INT_ZERO;
    periodStakingRewards.updatedAtBlock = block.number;
    periodStakingRewards.updatedAtTimestamp = block.timestamp;
    periodStakingRewards.save();
  } else {
    let periodDuration = BIG_INT_ZERO;
    let submitDuration = block.timestamp.minus(
      periodStakingRewards.updatedAtTimestamp
    );
    while (periodDuration.plus(ORACLES_UPDATE_PERIOD).lt(submitDuration)) {
      periodDuration = periodDuration.plus(ORACLES_UPDATE_PERIOD);
    }

    periodStakingRewards.periodDuration = periodDuration;
    periodStakingRewards.periodTotalRewards = periodTotalRewards;
    periodStakingRewards.periodProtocolRewards = periodProtocolRewards;
    periodStakingRewards.updatedAtBlock = block.number;
    periodStakingRewards.updatedAtTimestamp = block.timestamp;
    periodStakingRewards.save();
  }
}
