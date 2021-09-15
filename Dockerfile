FROM node:16.9-buster AS dev

WORKDIR /usr/src/app

RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install

COPY . .

FROM node:16.9-buster AS prod

WORKDIR /usr/src/app

RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --production

COPY . .