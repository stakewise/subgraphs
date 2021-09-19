import { Oracle } from "../../generated/schema";

export function createOrLoadOracle(oracleAddress: string): Oracle {
  let oracle = Oracle.load(oracleAddress);

  if (oracle == null) {
    oracle = new Oracle(oracleAddress);
  }
  return oracle as Oracle;
}
