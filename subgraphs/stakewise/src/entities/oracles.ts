import { Address } from "@graphprotocol/graph-ts";
import { Oracle } from "../../generated/schema";

export function createOrLoadOracle(oracleAddress: Address): Oracle {
  let oracleId = oracleAddress.toHexString();
  let oracle = Oracle.load(oracleId);

  if (oracle == null) {
    oracle = new Oracle(oracleId);
    oracle.save();
  }
  return oracle as Oracle;
}
