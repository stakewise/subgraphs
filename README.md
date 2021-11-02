# StakeWise Subgraphs

Aims to deliver analytics & historical data for StakeWise. Still a work in progress. Feel free to contribute!

The Graph exposes a GraphQL endpoint to query the events and entities within the StakeWise ecosystem.

Current subgraphs:

1. **ethereum**: Includes data about ETH2 validator registrations through the deposit contract and ETH1 blocks.

3. **stakewise**: Includes all the StakeWise contracts data.

4. **uniswap-v3**: Includes all the relevant data around Uniswap V3 liquidity pools for the pairs that include any of the sETH2, rETH2, SWISE tokens.

## Deployment

1. Install dependencies:

   ```shell script
   yarn install
   ```

2. Prepare subgraphs for the network you want to deploy on (supports goerli and mainnet):

   ```shell script
   yarn prepare:mainnet
   ```

3. Generate types for the Typescript source code:

    ```shell script
    yarn run codegen
    ```

4. Optionally, build the subgraph to check compile errors before deploying:

    ```shell script
    yarn run build
    ```

5. Authenticate to the Graph API for deployment:
    ```shell script
    graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN> 
    ```

6. Deploy all the subgraphs or a specific one by navigating to `subgraphs/<subgraph_name>` and running:
    ```shell script
    yarn deploy:mainnet
    ```

## Documentation

The documentation for all the graphQL object fields can be found by going to `subgraphs/<subgraph_name>/schema.graphql`.
