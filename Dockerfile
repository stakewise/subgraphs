FROM node:16-alpine
RUN apk add --no-cache git
WORKDIR /app
COPY . ./
RUN yarn install
