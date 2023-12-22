# syntax=docker/dockerfile:1-experimental

FROM node:21.1.0

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
COPY packages/backend/src ./packages/backend/src
COPY packages/libs/src ./packages/libs/src

RUN chown -R node:node /home/node
WORKDIR /home/node/app/packages/backend/
USER node

