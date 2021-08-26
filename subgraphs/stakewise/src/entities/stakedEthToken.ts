import { BigDecimal } from "@graphprotocol/graph-ts";

import { BIG_DECIMAL_ZERO } from "const";
import { StakedEthTokenHolder } from "../../generated/schema";
import {
  calculateRewardEthTokenHolderBalance,
  createOrLoadRewardEthTokenHolder,
} from "./rewardEthToken";

export function createOrLoadStakedEthTokenHolder(
  holderAddress: string
): StakedEthTokenHolder {
  let holder = StakedEthTokenHolder.load(holderAddress);

  if (holder == null) {
    holder = new StakedEthTokenHolder(holderAddress);

    holder.balance = BIG_DECIMAL_ZERO;
    holder.save();
  }
  return holder as StakedEthTokenHolder;
}

export function updateRewardEthTokenHolderBalance(
  stakedEthHolder: StakedEthTokenHolder,
  latestRewardPerStakedEthToken: BigDecimal
): void {
  let rewardEthHolder = createOrLoadRewardEthTokenHolder(
    stakedEthHolder.id,
    latestRewardPerStakedEthToken
  );
  if (
    latestRewardPerStakedEthToken.gt(rewardEthHolder.rewardPerStakedEthToken)
  ) {
    rewardEthHolder.checkpointBalance = calculateRewardEthTokenHolderBalance(
      rewardEthHolder,
      stakedEthHolder,
      latestRewardPerStakedEthToken
    );
    rewardEthHolder.rewardPerStakedEthToken = latestRewardPerStakedEthToken;
    rewardEthHolder.save();
  }
}
