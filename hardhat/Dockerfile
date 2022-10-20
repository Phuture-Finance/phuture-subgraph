FROM node:16-alpine

ENV APP_ROOT /phuture-contracts

RUN mkdir ${APP_ROOT}
WORKDIR ${APP_ROOT}
ADD phuture-contracts/ ${APP_ROOT}

RUN #apt-get update && apt-get install -y python3.6 && python3-pip
RUN apk add --no-cache python3 g++ make

RUN npm install -g node-gyp
RUN npm install

EXPOSE 8545
