FROM node:12-alpine

WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .
COPY ./ormconfig.template.js ./ormconfig.js

RUN apk update \
    && apk --no-cache add \
    bash \
    coreutils \
    && apk --no-cache --virtual build-dependencies add \
    python \
    make \
    && npm install \
    && apk del build-dependencies

COPY . .

EXPOSE 3000