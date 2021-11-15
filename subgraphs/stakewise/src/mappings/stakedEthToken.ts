import { log } from "@graphprotocol/graph-ts";
import { ADDRESS_ZERO, CONTRACT_CHECKER_ADDRESS } from "const";
import {
  Paused,
  Transfer,
  Unpaused,
} from "../../generated/StakedEthToken/StakedEthToken";
import {
  createOrLoadNetwork,
  createOrLoadPool,
  createOrLoadStaker,
} from "../entities";
import { ContractChecker } from "../../generated/StakeWiseToken/ContractChecker";

export function handleTransfer(event: Transfer): void {
  let contractChecker = ContractChecker.bind(CONTRACT_CHECKER_ADDRESS);

  if (event.params.from.notEqual(ADDRESS_ZERO)) {
    let fromStaker = createOrLoadStaker(
      event.params.from,
      contractChecker,
      event.block.number
    );
    fromStaker.principalBalance = fromStaker.principalBalance.minus(
      event.params.value
    );
    fromStaker.save();
  } else {
    let pool = createOrLoadPool();
    pool.balance = pool.balance.plus(event.params.value);
    pool.save();
  }

  if (event.params.to.notEqual(ADDRESS_ZERO)) {
    let toStaker = createOrLoadStaker(
      event.params.to,
      contractChecker,
      event.block.number
    );
    toStaker.principalBalance = toStaker.principalBalance.plus(
      event.params.value
    );
    toStaker.save();
  }

  log.info("[StakedEthToken] Transfer from={} to={} amount={}", [
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value.toString(),
  ]);
}

export function handlePaused(event: Paused): void {
  let network = createOrLoadNetwork();

  network.stakedEthTokenPaused = true;
  network.save();

  log.info("[StakedEthToken] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let network = createOrLoadNetwork();

  network.stakedEthTokenPaused = false;
  network.save();

  log.info("[StakedEthToken] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
