import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { REWARD_ETH_TOKEN_ADDRESS, BIG_INT_ZERO } from "const";
import { RewardEthToken, StakingRewardsSnapshot } from "../../generated/schema";

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

export function createStakingRewardsSnapshot(
  snapshotId: string,
  oldRewardPerStakedEthToken: BigInt,
  newRewardPerStakedEthToken: BigInt,
  block: ethereum.Block
): void {
  let snapshot = new StakingRewardsSnapshot(snapshotId);
  snapshot.rewardPerStakedEthTokenBefore = oldRewardPerStakedEthToken;
  snapshot.rewardPerStakedEthTokenAfter = newRewardPerStakedEthToken;
  snapshot.createdAtBlock = block.number;
  snapshot.createdAtTimestamp = block.timestamp;
  snapshot.save();
}
