import {createOrLoadPool} from "../entities";
import { FeesTransferred } from "../../generated/FeesEscrow/FeesEscrow";

export function handleFeesTransferred(event: FeesTransferred): void {
    let pool = createOrLoadPool();
    pool.balance = pool.balance.plus(event.params.amount);
    pool.save();
}
