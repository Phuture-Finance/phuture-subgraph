FROM node:14

RUN mkdir -p /app
WORKDIR /app

COPY . /app

RUN npm install
RUN npm run codegen
RUN npm run build
#RUN npm run create-local
#RUN npm run deploy-local

CMD [ "npm", "run", "start"]