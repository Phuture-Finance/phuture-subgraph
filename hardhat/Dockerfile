FROM node:16-alpine

ENV APP_ROOT /phuture-contracts

RUN mkdir ${APP_ROOT}
WORKDIR ${APP_ROOT}
ADD phuture-contracts/ ${APP_ROOT}

RUN npm install

EXPOSE 8545
