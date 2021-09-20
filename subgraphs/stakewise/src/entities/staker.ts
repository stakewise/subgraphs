import { BigDecimal } from "@graphprotocol/graph-ts";
import { BIG_DECIMAL_ZERO } from "const";
import { Staker } from "../../generated/schema";

export function createOrLoadStaker(
  holderAddress: string,
  latestRewardPerStakedEthToken: BigDecimal
): Staker {
  let staker = Staker.load(holderAddress);

  if (staker == null) {
    staker = new Staker(holderAddress);

    staker.rewardsDisabled = false;
    staker.principalBalance = BIG_DECIMAL_ZERO;
    staker.rewardBalance = BIG_DECIMAL_ZERO;
    staker.rewardPerStakedEthToken = latestRewardPerStakedEthToken;
    staker.save();
  } else {
    staker.rewardBalance = calculateStakerRewardBalance(
      staker as Staker,
      latestRewardPerStakedEthToken
    );
    staker.rewardPerStakedEthToken = latestRewardPerStakedEthToken;
    staker.save();
  }
  return staker as Staker;
}

export function calculateStakerRewardBalance(
  staker: Staker,
  latestRewardPerToken: BigDecimal
): BigDecimal {
  if (latestRewardPerToken.le(staker.rewardPerStakedEthToken)) {
    return staker.rewardBalance;
  }
  let earnedRewardEthToken = staker.principalBalance
    .times(latestRewardPerToken.minus(staker.rewardPerStakedEthToken))
    .truncate(18);

  return staker.rewardBalance.plus(earnedRewardEthToken);
}
