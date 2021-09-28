import { log } from "@graphprotocol/graph-ts";
import { CONTRACT_CHECKER_ADDRESS, MERKLE_DISTRIBUTOR_ADDRESS } from "const";
import {
  createOrLoadMerkleDistributor,
  createOrLoadNetwork,
  createOrLoadStakeWiseTokenHolder,
  isSupportedSwiseHolder,
} from "../entities";
import {
  Paused,
  Transfer,
  Unpaused,
} from "../../generated/StakeWiseToken/StakeWiseToken";
import { ContractChecker } from "../../generated/StakeWiseToken/ContractChecker";

export function handleTransfer(event: Transfer): void {
  let contractChecker = ContractChecker.bind(CONTRACT_CHECKER_ADDRESS);

  if (isSupportedSwiseHolder(event.params.from)) {
    let fromHolder = createOrLoadStakeWiseTokenHolder(
      event.params.from,
      contractChecker,
      event.block.number
    );

    fromHolder.balance = fromHolder.balance.minus(event.params.value);
    fromHolder.updatedAtBlock = event.block.number;
    fromHolder.updatedAtTimestamp = event.block.timestamp;
    fromHolder.save();
  }

  if (isSupportedSwiseHolder(event.params.to)) {
    let toHolder = createOrLoadStakeWiseTokenHolder(
      event.params.to,
      contractChecker,
      event.block.number
    );

    if (event.params.from.equals(MERKLE_DISTRIBUTOR_ADDRESS)) {
      // SWISE located in Merkle Distributor belongs to the claimer
      let distributor = createOrLoadMerkleDistributor();
      toHolder.distributorPoints = toHolder.distributorPoints.plus(
        event.params.value.times(
          event.block.number.minus(distributor.rewardsUpdatedAtBlock)
        )
      );
    }
    toHolder.balance = toHolder.balance.plus(event.params.value);
    toHolder.updatedAtBlock = event.block.number;
    toHolder.updatedAtTimestamp = event.block.timestamp;
    toHolder.save();
  }

  log.info("[StakeWiseToken] Transfer from={} to={} amount={}", [
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value.toString(),
  ]);
}

export function handlePaused(event: Paused): void {
  let network = createOrLoadNetwork();

  network.stakeWiseTokenPaused = true;
  network.save();

  log.info("[StakeWiseToken] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let network = createOrLoadNetwork();

  network.stakeWiseTokenPaused = false;
  network.save();

  log.info("[StakeWiseToken] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
