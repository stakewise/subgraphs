import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

import { BIG_DECIMAL_ZERO } from "const";
import { StakeWiseTokenHolder } from "../../generated/schema";

export function createOrLoadStakeWiseTokenHolder(
  holderAddress: string,
  timestamp: BigInt
): StakeWiseTokenHolder {
  let holder = StakeWiseTokenHolder.load(holderAddress);

  if (holder == null) {
    holder = new StakeWiseTokenHolder(holderAddress);

    holder.balance = BIG_DECIMAL_ZERO;
    holder.holdingPoints = BIG_DECIMAL_ZERO;
    holder.updatedAtTimestamp = timestamp;
    holder.save();
  }
  return holder as StakeWiseTokenHolder;
}

export function calculateHoldingPoints(
  holder: StakeWiseTokenHolder,
  rewardsUpdatedAtTimestamp: BigInt,
  currentTimestamp: BigInt
): BigDecimal {
  let startTimestamp = holder.updatedAtTimestamp;
  let prevHoldingPoints = holder.holdingPoints;
  if (rewardsUpdatedAtTimestamp.ge(holder.updatedAtTimestamp)) {
    startTimestamp = rewardsUpdatedAtTimestamp;
    prevHoldingPoints = BIG_DECIMAL_ZERO;
  }
  return prevHoldingPoints.plus(
    holder.balance.times(currentTimestamp.minus(startTimestamp).toBigDecimal())
  );
}
