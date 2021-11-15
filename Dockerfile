FROM node:16-alpine
WORKDIR /app
COPY . ./
RUN yarn install

CMD ["/bin/sh", "-c", "yarn prepare:${NETWORK} && yarn codegen && yarn build && yarn create:local && yarn deploy:local"]

