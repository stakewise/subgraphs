import { createOrLoadPool } from "../entities";
import { FeesTransferred, FeesTransferred1 } from "../../generated/FeesEscrow/FeesEscrow";
import { log } from "@graphprotocol/graph-ts";

export function handleFeesTransferred(event: FeesTransferred): void {
    let pool = createOrLoadPool();
    pool.balance = pool.balance.plus(event.params.amount);
    pool.save();

    log.info(
        "[FeesEscrow] FeesTransferred amount={} poolBalance={}",
        [
            event.params.amount.toString(),
            pool.balance.toString(),
        ]
    );
}

export function handleFeesTransferredGnosis(event: FeesTransferred1): void {
    let pool = createOrLoadPool();
    pool.balance = pool.balance.plus(event.params.amountMGNO);
    pool.save();

    log.info(
        "[FeesEscrow] FeesTransferred amount={} poolMGNOBalance={}",
        [
            event.params.amountMGNO.toString(),
            pool.balance.toString(),
        ]
    );
}