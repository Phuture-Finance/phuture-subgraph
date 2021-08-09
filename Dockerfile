FROM node:14.15.0

RUN mkdir -p /app
WORKDIR /app

COPY . /app

RUN npm i -g mustache
RUN npm run prepare:subgraph
RUN npm install
RUN npm run codegen
RUN npm run build

CMD [ "npm", "run", "start"]
