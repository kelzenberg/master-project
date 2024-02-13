# syntax=docker/dockerfile:1-experimental

FROM node:21.1.0 as build-frontend

WORKDIR /home/node
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /home/node/app

COPY package.json package-lock.json ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/libs/package.json ./packages/libs/
RUN npm ci --include=dev --ignore-scripts=true && npm cache clean --force

COPY packages/frontend/webpack.config.js ./packages/frontend/
COPY packages/frontend/src ./packages/frontend/src
COPY packages/libs/src ./packages/libs/src
RUN npm run F build

FROM node:21.1.0 as build-app

WORKDIR /home/node

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /home/node/app

COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/libs/package.json ./packages/libs/
RUN npm ci --omit=dev --ignore-scripts=true && npm cache clean --force

# necessary fix to recreate node-sqlite bindings
RUN npm rebuild sqlite3

COPY packages/backend/src ./packages/backend/src
COPY packages/libs/src ./packages/libs/src

COPY --from=build-frontend /home/node/app/packages/frontend/dist ./packages/backend/src/static/

RUN chown -R node:node /home/node
WORKDIR /home/node/app/packages/backend/
USER node

