FROM node:16.9-buster AS dev

WORKDIR /usr/src/app

RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY . .
RUN pnpm install
RUN pnpm prebuild && pnpm build

FROM node:16.9-buster AS prod

WORKDIR /usr/src/app

RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY . .
RUN pnpm install --production
RUN pnpm prebuild && pnpm build