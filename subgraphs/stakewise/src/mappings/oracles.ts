import { log, store } from "@graphprotocol/graph-ts";

import { BIG_INT_ONE } from "const";
import { createOrLoadOracle, createOrLoadNetwork } from "../entities";
import {
  RegisterValidatorVoteSubmitted,
  MerkleRootVoteSubmitted,
  OracleAdded,
  OracleRemoved,
  Paused,
  RewardsVoteSubmitted,
  Unpaused,
  Initialized,
} from "../../generated/Oracles/Oracles";
import { RegisterValidatorsVoteSubmitted } from "../../generated/OraclesV2/OraclesV2";
import { Oracle } from "../../generated/schema";

export function handleInitialized(event: Initialized): void {
  let network = createOrLoadNetwork();

  network.oraclesRewardsNonce = event.params.rewardsNonce;
  network.save();

  log.info("[Oracles] Initialized rewardsNonce={}", [
    network.oraclesRewardsNonce.toString(),
  ]);
}

export function handleOracleAdded(event: OracleAdded): void {
  let oracle = createOrLoadOracle(event.params.oracle);

  log.info("[Oracles] OracleAdded oracle={} sender={}", [
    oracle.id,
    event.transaction.from.toHexString(),
  ]);
}

export function handleOracleRemoved(event: OracleRemoved): void {
  let oracleAddress = event.params.oracle.toHexString();
  let oracle = Oracle.load(oracleAddress);

  if (oracle != null) {
    store.remove("Oracle", oracleAddress);
  }

  log.info("[Oracles] OracleRemoved oracle={} sender={}", [
    oracleAddress,
    event.transaction.from.toHexString(),
  ]);
}

export function handleRewardsVoteSubmitted(event: RewardsVoteSubmitted): void {
  let network = createOrLoadNetwork();

  network.oraclesRewardsNonce = event.params.nonce.plus(BIG_INT_ONE);
  network.save();

  log.info("[Oracles] RewardsVoteSubmitted nonce={} oracle={} sender={}", [
    network.oraclesRewardsNonce.toString(),
    event.params.oracle.toHexString(),
    event.transaction.from.toHexString(),
  ]);
}

export function handleMerkleRootVoteSubmitted(
  event: MerkleRootVoteSubmitted
): void {
  let network = createOrLoadNetwork();

  network.oraclesRewardsNonce = event.params.nonce.plus(BIG_INT_ONE);
  network.save();

  log.info("[Oracles] MerkleRootVoteSubmitted nonce={} oracle={} sender={}", [
    network.oraclesRewardsNonce.toString(),
    event.params.oracle.toHexString(),
    event.transaction.from.toHexString(),
  ]);
}

export function handleRegisterValidatorVoteSubmitted(
  event: RegisterValidatorVoteSubmitted
): void {
  let network = createOrLoadNetwork();

  network.oraclesValidatorsNonce = event.params.nonce.plus(BIG_INT_ONE);
  network.save();

  log.info(
    "[Oracles] RegisterValidatorVoteSubmitted nonce={} oracle={} sender={}",
    [
      network.oraclesValidatorsNonce.toString(),
      event.params.oracle.toHexString(),
      event.transaction.from.toHexString(),
    ]
  );
}

export function handleRegisterValidatorsVoteSubmitted(
  event: RegisterValidatorsVoteSubmitted
): void {
  let network = createOrLoadNetwork();

  network.oraclesValidatorsNonce = event.params.nonce.plus(BIG_INT_ONE);
  network.save();

  log.info(
    "[Oracles] RegisterValidatorsVoteSubmitted nonce={} oracles={} sender={}",
    [
      network.oraclesValidatorsNonce.toString(),
      event.params.oracles.toString(),
      event.transaction.from.toHexString(),
    ]
  );
}

export function handlePaused(event: Paused): void {
  let network = createOrLoadNetwork();

  network.oraclesPaused = true;
  network.save();

  log.info("[Oracles] Paused account={}", [event.params.account.toHexString()]);
}

export function handleUnpaused(event: Unpaused): void {
  let network = createOrLoadNetwork();

  network.oraclesPaused = false;
  network.save();

  log.info("[Oracles] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
