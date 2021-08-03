FROM node:14.15.0

RUN mkdir -p /app
WORKDIR /app

COPY . /app

RUN npm install
RUN npm run codegen
RUN npm run build

CMD [ "npm", "run", "deploy:local"]
