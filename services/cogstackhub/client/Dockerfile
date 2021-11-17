FROM node:12-alpine

RUN mkdir -p /cogstackhub/client

COPY . /cogstackhub/client

WORKDIR /cogstackhub/client

RUN npm install

CMD npm run serve -- --port 8080
