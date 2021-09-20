import {
  REWARD_ETH_TOKEN_ADDRESS,
  BIG_DECIMAL_ZERO,
  BIG_INT_ZERO,
} from "const";
import { RewardEthToken } from "../../generated/schema";

export function createOrLoadRewardEthToken(): RewardEthToken {
  let rewardEthTokenAddress = REWARD_ETH_TOKEN_ADDRESS.toHexString();
  let rewardEthToken = RewardEthToken.load(rewardEthTokenAddress);

  if (rewardEthToken == null) {
    rewardEthToken = new RewardEthToken(rewardEthTokenAddress);

    rewardEthToken.rewardPerStakedEthToken = BIG_DECIMAL_ZERO;
    rewardEthToken.distributorPeriodReward = BIG_DECIMAL_ZERO;
    rewardEthToken.protocolPeriodReward = BIG_DECIMAL_ZERO;
    rewardEthToken.updatedAtBlock = BIG_INT_ZERO;
    rewardEthToken.updatedAtTimestamp = BIG_INT_ZERO;
    rewardEthToken.save();
  }
  return rewardEthToken as RewardEthToken;
}
