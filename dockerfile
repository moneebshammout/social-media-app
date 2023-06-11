FROM node:alpine

ENV NODE_ENV=production

EXPOSE 4000

WORKDIR /app

RUN npm i npm@latest -g

COPY package*.json ../app/

RUN npm ci --only=production 

COPY . .

CMD npm start 