import { BIG_INT_ZERO } from "const";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import {
  DistributorToken,
  DistributorTokenHolder,
} from "../../generated/schema";
import { calculateDistributorPoints } from "./merkleDistributor";
import { createOrLoadRewardEthToken } from "./rewardEthToken";

export function createOrLoadDistributorToken(token: Address): DistributorToken {
  let tokenId = token.toHexString();
  let distributorToken = DistributorToken.load(tokenId);
  if (distributorToken == null) {
    distributorToken = new DistributorToken(tokenId);
    distributorToken.save();
  }
  return distributorToken;
}

export function createOrLoadDistributorTokenHolder(
  account: Address,
  token: Address,
  currentBlock: ethereum.Block
): DistributorTokenHolder {
  let holderId = token.toHexString().concat("-").concat(account.toHexString());
  let holder = DistributorTokenHolder.load(holderId);

  if (holder == null) {
    holder = new DistributorTokenHolder(holderId);
    holder.account = account;
    holder.token = token;
    holder.amount = BIG_INT_ZERO;
    holder.distributorPoints = BIG_INT_ZERO;
    holder.updatedAtBlock = BIG_INT_ZERO;
    holder.updatedAtTimestamp = BIG_INT_ZERO;
    holder.save();
  } else {
    let rewardEthToken = createOrLoadRewardEthToken();
    holder.distributorPoints = calculateDistributorPoints(
      holder.amount,
      holder.distributorPoints,
      holder.updatedAtBlock,
      rewardEthToken.updatedAtBlock,
      currentBlock.number
    );
  }
  return holder;
}
