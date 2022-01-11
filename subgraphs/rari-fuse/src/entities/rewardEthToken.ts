import { BIG_INT_ZERO, REWARD_ETH_TOKEN_ADDRESS } from "const";
import { RewardEthToken } from "../../generated/schema";

export function createOrLoadRewardEthToken(): RewardEthToken {
  let rewardEthTokenAddress = REWARD_ETH_TOKEN_ADDRESS.toHexString();
  let rewardEthToken = RewardEthToken.load(rewardEthTokenAddress);

  if (rewardEthToken == null) {
    rewardEthToken = new RewardEthToken(rewardEthTokenAddress);
    rewardEthToken.updatedAtBlock = BIG_INT_ZERO;
    rewardEthToken.updatedAtTimestamp = BIG_INT_ZERO;
    rewardEthToken.save();
  }
  return rewardEthToken as RewardEthToken;
}
