ARG NETWORK="mainnet"
FROM node:16-alpine
ARG NETWORK
WORKDIR /app
COPY . ./
RUN yarn install
RUN yarn prepare:${NETWORK} && yarn codegen && yarn build

CMD ["/bin/sh", "-c", "yarn create:local && yarn deploy:local"]
