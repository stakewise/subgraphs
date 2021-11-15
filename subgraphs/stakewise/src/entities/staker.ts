import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  BIG_INT_1E18,
  BIG_INT_ZERO,
  CONTRACT_CHECKER_DEPLOYMENT_BLOCK,
} from "const";
import { Staker } from "../../generated/schema";
import { ContractChecker } from "../../generated/StakeWiseToken/ContractChecker";
import { createOrLoadRewardEthToken } from "./rewardEthToken";

export function createOrLoadStaker(
  holderAddress: Address,
  contractChecker: ContractChecker,
  currentBlock: BigInt
): Staker {
  let isContract = false;
  if (currentBlock.gt(CONTRACT_CHECKER_DEPLOYMENT_BLOCK)) {
    let contractCheckerCall = contractChecker.try_isContract(holderAddress);
    isContract = !contractCheckerCall.reverted && contractCheckerCall.value;
  }

  let rewardEthToken = createOrLoadRewardEthToken();
  let stakerId = holderAddress.toHexString();
  let staker = Staker.load(stakerId);
  if (staker == null) {
    staker = new Staker(stakerId);

    staker.isContract = isContract;
    staker.rewardsDisabled = false;
    staker.principalBalance = BIG_INT_ZERO;
    staker.rewardBalance = BIG_INT_ZERO;
    staker.rewardPerStakedEthToken = rewardEthToken.rewardPerStakedEthToken;
    staker.save();
  } else if (!staker.rewardsDisabled) {
    staker.isContract = isContract;
    staker.rewardBalance = calculateStakerRewardBalance(
      staker as Staker,
      rewardEthToken.rewardPerStakedEthToken
    );
    staker.rewardPerStakedEthToken = rewardEthToken.rewardPerStakedEthToken;
  } else {
    staker.isContract = isContract;
  }

  return staker as Staker;
}

export function calculateStakerRewardBalance(
  staker: Staker,
  latestRewardPerToken: BigInt
): BigInt {
  if (latestRewardPerToken.le(staker.rewardPerStakedEthToken)) {
    return staker.rewardBalance;
  }
  let earnedRewardEthToken = staker.principalBalance
    .times(latestRewardPerToken.minus(staker.rewardPerStakedEthToken))
    .div(BIG_INT_1E18);

  return staker.rewardBalance.plus(earnedRewardEthToken);
}
