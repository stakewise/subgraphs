import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

import { StakeWiseTokenHolder } from "../../generated/schema";
import { EMPTY_BIG_DECIMAL } from "../constants";

export function createOrLoadStakeWiseTokenHolder(
  holderAddress: string,
  timestamp: BigInt
): StakeWiseTokenHolder {
  let holder = StakeWiseTokenHolder.load(holderAddress);

  if (holder == null) {
    holder = new StakeWiseTokenHolder(holderAddress);

    holder.balance = EMPTY_BIG_DECIMAL;
    holder.holdingPoints = EMPTY_BIG_DECIMAL;
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
    prevHoldingPoints = EMPTY_BIG_DECIMAL;
  }
  return prevHoldingPoints.plus(
    holder.balance.times(currentTimestamp.minus(startTimestamp).toBigDecimal())
  );
}
