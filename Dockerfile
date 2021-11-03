FROM node:16-alpine
ENV DEBUG="1"
WORKDIR /app
COPY . ./
RUN yarn install
RUN yarn prepare:mainnet && yarn codegen && yarn build

CMD ["/bin/sh", "-c", "yarn create:local && yarn deploy:local"]
