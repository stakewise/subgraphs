import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ADDRESS_ZERO,
  BIG_INT_ZERO,
  DAO_ADDRESS,
  FUTURE_FUND_ADDRESS,
  MERKLE_DISTRIBUTOR_ADDRESS,
  MERKLE_DROP_ADDRESS,
  CONTRACT_CHECKER_DEPLOYMENT_BLOCK,
} from "const";
import { StakeWiseTokenHolder, VestingEscrow } from "../../generated/schema";
import { calculateDistributorPoints } from "./merkleDistributor";
import { ContractChecker } from "../../generated/StakeWiseToken/ContractChecker";
import { createOrLoadRewardEthToken } from "./rewardEthToken";

export function createOrLoadStakeWiseTokenHolder(
  holderAddress: Address,
  contractChecker: ContractChecker,
  currentBlock: BigInt
): StakeWiseTokenHolder {
  let isContract = false;
  if (currentBlock.gt(CONTRACT_CHECKER_DEPLOYMENT_BLOCK)) {
    let contractCheckerCall = contractChecker.try_isContract(holderAddress);
    isContract = !contractCheckerCall.reverted && contractCheckerCall.value;
  }

  let holderId = holderAddress.toHexString();
  let holder = StakeWiseTokenHolder.load(holderId);
  if (holder == null) {
    holder = new StakeWiseTokenHolder(holderId);

    holder.balance = BIG_INT_ZERO;
    holder.distributorPoints = BIG_INT_ZERO;
    holder.isContract = isContract;
    holder.updatedAtBlock = BIG_INT_ZERO;
    holder.updatedAtTimestamp = BIG_INT_ZERO;
    holder.save();
  } else {
    let rewardEthToken = createOrLoadRewardEthToken();
    holder.isContract = isContract;
    holder.distributorPoints = calculateDistributorPoints(
      holder.balance,
      holder.distributorPoints,
      holder.updatedAtBlock,
      rewardEthToken.updatedAtBlock,
      currentBlock
    );
  }
  return holder as StakeWiseTokenHolder;
}

export function isSupportedSwiseHolder(holderAddress: Address): boolean {
  return (
    holderAddress.notEqual(DAO_ADDRESS) &&
    holderAddress.notEqual(ADDRESS_ZERO) &&
    holderAddress.notEqual(FUTURE_FUND_ADDRESS) &&
    holderAddress.notEqual(MERKLE_DISTRIBUTOR_ADDRESS) &&
    holderAddress.notEqual(MERKLE_DROP_ADDRESS) &&
    VestingEscrow.load(holderAddress.toHexString()) == null
  );
}
