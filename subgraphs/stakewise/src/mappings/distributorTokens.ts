import { ADDRESS_ZERO } from "const";
import { log } from "@graphprotocol/graph-ts";
import { createOrLoadDistributorTokenHolder } from "../entities";
import { Transfer } from "../../generated/DistributorToken0/ERC20Token";

export function handleTransfer(event: Transfer): void {
  // Checking if the FROM is the token contract or zero address
  // If so, it is a mint, and we don't need to run these calculations
  if (
    event.params.from.notEqual(event.address) &&
    event.params.from.notEqual(ADDRESS_ZERO)
  ) {
    let fromHolder = createOrLoadDistributorTokenHolder(
      event.params.from,
      event.address,
      event.block
    );

    fromHolder.amount = fromHolder.amount.minus(event.params.value);
    fromHolder.updatedAtBlock = event.block.number;
    fromHolder.updatedAtTimestamp = event.block.timestamp;
    fromHolder.save();
  }

  // Checking if the TO is the token contract or zero address
  // If so, it is a burn, and we don't need to run these calculations
  if (
    event.params.to.notEqual(event.address) &&
    event.params.to.notEqual(ADDRESS_ZERO)
  ) {
    let toHolder = createOrLoadDistributorTokenHolder(
      event.params.to,
      event.address,
      event.block
    );
    toHolder.amount = toHolder.amount.plus(event.params.value);
    toHolder.updatedAtBlock = event.block.number;
    toHolder.updatedAtTimestamp = event.block.timestamp;
    toHolder.save();
  }

  log.info(
    "[DistributorTokenHolder] Transfer token={} from={} to={} value={}",
    [
      event.address.toHexString(),
      event.params.from.toHexString(),
      event.params.to.toHexString(),
      event.params.value.toString(),
    ]
  );
}
