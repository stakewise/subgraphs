import { createOrLoadPool } from "../entities";
import { FeesTransferred } from "../../generated/FeesEscrow/FeesEscrow";
import { log } from "@graphprotocol/graph-ts";

export function handleFeesTransferred(event: FeesTransferred): void {
  let pool = createOrLoadPool();
  pool.balance = pool.balance.plus(event.params.amount);
  pool.save();
  log.info("[FeesEscrow] FeesTransferred amount={}", [event.params.amount.toString()]);
}
