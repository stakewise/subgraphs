import { createOrLoadPool, createOrLoadRewardEthToken } from "../entities";
import { FeesTransferred } from "../../generated/FeesEscrow/FeesEscrow";
import { log } from "@graphprotocol/graph-ts";

export function handleFeesTransferred(event: FeesTransferred): void {
  let pool = createOrLoadPool();
  pool.balance = pool.balance.plus(event.params.amount);
  pool.save();

  let rewardEthToken = createOrLoadRewardEthToken();
  rewardEthToken.totalFees = rewardEthToken.totalFees.plus(event.params.amount);
  rewardEthToken.save();
  log.info("[FeesEscrow] FeesTransferred amount={}", [event.params.amount.toString()]);
}
