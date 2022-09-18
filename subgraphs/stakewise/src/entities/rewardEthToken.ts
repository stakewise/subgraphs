import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  REWARD_ETH_TOKEN_ADDRESS,
  BIG_INT_ZERO,
  ORACLES_UPDATE_PERIOD,
} from "const";
import { RewardEthToken, StakingRewardsSnapshot } from "../../generated/schema";

export function createOrLoadRewardEthToken(): RewardEthToken {
  let rewardEthTokenAddress = REWARD_ETH_TOKEN_ADDRESS.toHexString();
  let rewardEthToken = RewardEthToken.load(rewardEthTokenAddress);

  if (rewardEthToken == null) {
    rewardEthToken = new RewardEthToken(rewardEthTokenAddress);

    rewardEthToken.rewardPerStakedEthToken = BIG_INT_ZERO;
    rewardEthToken.distributorPeriodReward = BIG_INT_ZERO;
    rewardEthToken.protocolPeriodReward = BIG_INT_ZERO;
    rewardEthToken.totalRewards = BIG_INT_ZERO;
    rewardEthToken.totalFees = BIG_INT_ZERO;
    rewardEthToken.updatedAtBlock = BIG_INT_ZERO;
    rewardEthToken.updatedAtTimestamp = BIG_INT_ZERO;
    rewardEthToken.updatesCount = BIG_INT_ZERO;
    rewardEthToken.save();
  }
  return rewardEthToken as RewardEthToken;
}

export function createStakingRewardsSnapshot(
  newSnapshotId: BigInt,
  totalStaked: BigInt,
  periodTotalRewards: BigInt,
  periodProtocolRewards: BigInt,
  block: ethereum.Block
): void {
  let snapshotId0 = newSnapshotId.minus(BigInt.fromString("2")).toString();
  let snapshot0 = StakingRewardsSnapshot.load(snapshotId0);
  let snapshotId1 = newSnapshotId.minus(BigInt.fromString("1")).toString();
  let snapshot1 = StakingRewardsSnapshot.load(snapshotId1);
  let periodDuration = BIG_INT_ZERO;
  if (snapshot0 != null && snapshot1 != null) {
    let periodStart = snapshot0.createdAtTimestamp;
    while (periodStart.plus(ORACLES_UPDATE_PERIOD).lt(snapshot1.createdAtTimestamp)) {
      periodStart = periodStart.plus(ORACLES_UPDATE_PERIOD);
    }

    let periodEnd = snapshot1.createdAtTimestamp;
    while (periodEnd.plus(ORACLES_UPDATE_PERIOD).lt(block.timestamp)) {
      periodEnd = periodEnd.plus(ORACLES_UPDATE_PERIOD);
    }
    periodDuration = periodEnd.minus(periodStart);
  }

  let snapshot = new StakingRewardsSnapshot(newSnapshotId.toString());
  snapshot.periodTotalRewards = periodTotalRewards;
  snapshot.periodProtocolRewards = periodProtocolRewards;
  snapshot.periodDuration = periodDuration;
  snapshot.totalStaked = totalStaked;
  snapshot.createdAtBlock = block.number;
  snapshot.createdAtTimestamp = block.timestamp;
  snapshot.save();
}
