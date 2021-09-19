import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  ADDRESS_ZERO,
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_ZERO,
  BIG_INT_ZERO,
  DAO_ADDRESS,
  FUTURE_FUND_ADDRESS,
  MERKLE_DISTRIBUTOR_ADDRESS,
} from "const";
import { StakeWiseTokenHolder, VestingEscrow } from "../../generated/schema";

export function createOrLoadStakeWiseTokenHolder(
  holderAddress: string,
  blockNumber: BigInt,
  timestamp: BigInt
): StakeWiseTokenHolder {
  let holder = StakeWiseTokenHolder.load(holderAddress);

  if (holder == null) {
    holder = new StakeWiseTokenHolder(holderAddress);

    holder.balance = BIG_DECIMAL_ZERO;
    holder.holdingPoints = BIG_INT_ZERO;
    holder.updatedAtBlock = blockNumber;
    holder.updatedAtTimestamp = timestamp;
    holder.save();
  }
  return holder as StakeWiseTokenHolder;
}

export function calculateHoldingPoints(
  holder: StakeWiseTokenHolder,
  rewardsUpdatedAtBlock: BigInt,
  currentBlock: BigInt
): BigInt {
  let fromBlock = holder.updatedAtBlock;
  let prevHoldingPoints = holder.holdingPoints;
  if (rewardsUpdatedAtBlock.ge(fromBlock)) {
    // reset from block number and holding points
    fromBlock = rewardsUpdatedAtBlock;
    prevHoldingPoints = BIG_INT_ZERO;
  }
  return prevHoldingPoints.plus(
    BigInt.fromString(holder.balance.times(BIG_DECIMAL_1E18).toString()).times(
      currentBlock.minus(fromBlock)
    )
  );
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
