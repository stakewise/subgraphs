import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { BIG_INT_ZERO } from "const";
import { calculateDistributorPoints } from "stakewise/src/entities";
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
