import { log } from "@graphprotocol/graph-ts";
import { updateCommonCTokenStats } from "../entities";
import { Transfer } from "../../generated/sETH2-46/CToken";

/* Transferring of cTokens
 *
 * event.params.from = sender of cTokens
 * event.params.to = receiver of cTokens
 * event.params.amount = amount sent
 *
 * Notes
 *    Possible ways to emit Transfer:
 *      seize() - i.e. a Liquidation Transfer (does not emit anything else)
 *      redeemFresh() - i.e. redeeming your cTokens for underlying asset
 *      mintFresh() - i.e. you are lending underlying assets to create ctokens
 *      transfer() - i.e. a basic transfer
 *    This function handles all 4 cases. Transfer is emitted alongside the mint, redeem, and seize
 *    events. So for those events, we do not update cToken balances.
 */
export function handleTransfer(event: Transfer): void {
  let ctoken = event.address;

  // Checking if the tx is FROM the cToken contract (i.e. this will not run when minting)
  // If so, it is a mint, and we don't need to run these calculations
  if (event.params.from.notEqual(ctoken)) {
    // Update cTokenStats common for all events, and return the stats to update unique
    // values for each event
    let cTokenStatsFrom = updateCommonCTokenStats(
      ctoken,
      event.params.from,
      event.block
    );

    cTokenStatsFrom.cTokenBalance = cTokenStatsFrom.cTokenBalance.minus(
      event.params.amount
    );
    cTokenStatsFrom.updatedAtBlock = event.block.number;
    cTokenStatsFrom.updatedAtTimestamp = event.block.timestamp;
    cTokenStatsFrom.save();
  }

  // Checking if the tx is TO the cToken contract (i.e. this will not run when redeeming)
  // If so, we ignore it. this leaves an edge case, where someone who accidentally sends
  // cTokens to a cToken contract, where it will not get recorded. Right now it would
  // be messy to include, so we are leaving it out for now TODO fix this in future
  if (event.params.to.notEqual(ctoken)) {
    // Update cTokenStats common for all events, and return the stats to update unique
    // values for each event
    let cTokenStatsTo = updateCommonCTokenStats(
      ctoken,
      event.params.to,
      event.block
    );

    cTokenStatsTo.cTokenBalance = cTokenStatsTo.cTokenBalance.plus(
      event.params.amount
    );
    cTokenStatsTo.updatedAtBlock = event.block.number;
    cTokenStatsTo.updatedAtTimestamp = event.block.timestamp;
    cTokenStatsTo.save();
  }

  log.info("[CToken] Transfer ctoken={} from={} to={} value={}", [
    ctoken.toHexString(),
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.amount.toString(),
  ]);
}
