import { BigDecimal } from "@graphprotocol/graph-ts";
import {
  RewardEthTokenHolder,
  StakedEthTokenHolder,
} from "../../generated/schema";
import { EMPTY_BIG_DECIMAL } from "../constants";

export function createOrLoadRewardEthTokenHolder(
  holderAddress: string,
  rewardPerStakedEthToken: BigDecimal
): RewardEthTokenHolder {
  let holder = RewardEthTokenHolder.load(holderAddress);

  if (holder == null) {
    holder = new RewardEthTokenHolder(holderAddress);

    holder.checkpointBalance = EMPTY_BIG_DECIMAL;
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
