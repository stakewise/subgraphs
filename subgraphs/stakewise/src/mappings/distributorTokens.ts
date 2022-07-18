import { ADDRESS_ZERO } from "const";
import { Address, log } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/DistributorToken0/ERC20Token";
import { LogScheduled, LogUnscheduled } from "../../generated/OpiumDepositScheduler/OpiumDepositScheduler";
import { createOrLoadDistributorToken, createOrLoadDistributorTokenHolder } from "../entities";

export function handleTransfer(event: Transfer): void {
  createOrLoadDistributorToken(event.address);

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

export function handleOpiumDepositScheduled(event: LogScheduled): void {
  createOrLoadDistributorToken(event.address);

  if (event.params._pool != Address.fromString("0x3ee101bf969fac08be892c737d2969b3db38d2b8")) {
    return;
  }

  let holder = createOrLoadDistributorTokenHolder(
    event.params._user,
    event.address,
    event.block
  );
  holder.amount = holder.amount.plus(event.params._amount);
  holder.updatedAtBlock = event.block.number;
  holder.updatedAtTimestamp = event.block.timestamp;
  holder.save();

  log.info(
    "[DistributorTokenHolder] Opium LogScheduled user={} amount={}",
    [
      event.params._user.toHexString(),
      event.params._amount.toHexString(),
    ]
  );
}

export function handleOpiumDepositUnscheduled(event: LogUnscheduled): void {
  createOrLoadDistributorToken(event.address);

  if (event.params._pool != Address.fromString("0x3ee101bf969fac08be892c737d2969b3db38d2b8")) {
    return;
  }

  let holder = createOrLoadDistributorTokenHolder(
    event.params._user,
    event.address,
    event.block
  );
  holder.amount = holder.amount.minus(event.params._amount);
  holder.updatedAtBlock = event.block.number;
  holder.updatedAtTimestamp = event.block.timestamp;
  holder.save();

  log.info(
    "[DistributorTokenHolder] Opium LogUnscheduled user={} amount={}",
    [
      event.params._user.toHexString(),
      event.params._amount.toHexString(),
    ]
  );
}
