import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { BIG_INT_ZERO } from "const";
import { AccountCToken } from "../../generated/schema";
import { createOrLoadRewardEthToken } from "./rewardEthToken";

export function createAccountCToken(
  cTokenStatsID: string,
  account: Bytes,
  ctoken: Bytes
): AccountCToken {
  let cTokenStats = new AccountCToken(cTokenStatsID);
  cTokenStats.account = account;
  cTokenStats.ctoken = ctoken;
  cTokenStats.cTokenBalance = BIG_INT_ZERO;
  cTokenStats.distributorPoints = BIG_INT_ZERO;
  cTokenStats.updatedAtBlock = BIG_INT_ZERO;
  cTokenStats.updatedAtTimestamp = BIG_INT_ZERO;
  return cTokenStats;
}

function calculateDistributorPoints(
  principal: BigInt,
  prevDistributorPoints: BigInt,
  updatedAtBlock: BigInt,
  fromBlock: BigInt,
  currentBlock: BigInt
): BigInt {
  if (fromBlock.ge(updatedAtBlock)) {
    return principal.times(currentBlock.minus(fromBlock));
  }

  return prevDistributorPoints.plus(
    principal.times(currentBlock.minus(updatedAtBlock))
  );
}

export function updateCommonCTokenStats(
  ctoken: Bytes,
  account: Bytes,
  currentBlock: ethereum.Block
): AccountCToken {
  let cTokenStatsID = ctoken
    .toHexString()
    .concat("-")
    .concat(account.toHexString());
  let cTokenStats = AccountCToken.load(cTokenStatsID);
  if (cTokenStats == null) {
    cTokenStats = createAccountCToken(cTokenStatsID, account, ctoken);
  } else {
    let rewardEthToken = createOrLoadRewardEthToken();
    cTokenStats.distributorPoints = calculateDistributorPoints(
      cTokenStats.cTokenBalance,
      cTokenStats.distributorPoints,
      cTokenStats.updatedAtBlock,
      rewardEthToken.updatedAtBlock,
      currentBlock.number
    );
  }
  return cTokenStats as AccountCToken;
}
