FROM node:16-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build

CMD ["/bin/sh", "-c", "yarn create:local && yarn deploy:local"]
