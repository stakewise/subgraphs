import { BigDecimal } from "@graphprotocol/graph-ts";
import { BIG_DECIMAL_ZERO } from "const";
import {
  RewardEthTokenHolder,
  StakedEthTokenHolder,
} from "../../generated/schema";

export function createOrLoadRewardEthTokenHolder(
  holderAddress: string,
  rewardPerStakedEthToken: BigDecimal
): RewardEthTokenHolder {
  let holder = RewardEthTokenHolder.load(holderAddress);

  if (holder == null) {
    holder = new RewardEthTokenHolder(holderAddress);

    holder.checkpointBalance = BIG_DECIMAL_ZERO;
    holder.rewardPerStakedEthToken = rewardPerStakedEthToken;
    holder.save();
  }
  return holder as RewardEthTokenHolder;
}

export function calculateRewardEthTokenHolderBalance(
  rewardEthTokenHolder: RewardEthTokenHolder,
  stakedEthTokenHolder: StakedEthTokenHolder,
  latestRewardPerToken: BigDecimal
): BigDecimal {
  if (latestRewardPerToken.le(rewardEthTokenHolder.rewardPerStakedEthToken)) {
    return rewardEthTokenHolder.checkpointBalance;
  }
  let earnedRewardEthToken = stakedEthTokenHolder.balance.times(
    latestRewardPerToken.minus(rewardEthTokenHolder.rewardPerStakedEthToken)
  );

  return rewardEthTokenHolder.checkpointBalance.plus(earnedRewardEthToken);
}
