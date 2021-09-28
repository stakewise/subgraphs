import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ADDRESS_ZERO,
  BIG_INT_ZERO,
  DAO_ADDRESS,
  FUTURE_FUND_ADDRESS,
  MERKLE_DISTRIBUTOR_ADDRESS,
} from "const";
import { StakeWiseTokenHolder, VestingEscrow } from "../../generated/schema";
import {
  calculateDistributorPoints,
  createOrLoadMerkleDistributor,
} from "./merkleDistributor";
import { ContractChecker } from "../../generated/StakeWiseToken/ContractChecker";

export function createOrLoadStakeWiseTokenHolder(
  holderAddress: Address,
  contractChecker: ContractChecker,
  currentBlock: BigInt
): StakeWiseTokenHolder {
  let contractCheckerCall = contractChecker.try_isContract(holderAddress);
  let isContract = !contractCheckerCall.reverted && contractCheckerCall.value;

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
    let distributor = createOrLoadMerkleDistributor();
    holder.isContract = isContract;
    holder.distributorPoints = calculateDistributorPoints(
      holder.balance,
      holder.distributorPoints,
      holder.updatedAtBlock,
      distributor.rewardsUpdatedAtBlock,
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
    VestingEscrow.load(holderAddress.toHexString()) == null
  );
}
