FROM node:latest
MAINTAINER Mark Larah <markl@yelp.com>

RUN mkdir /code

COPY package.json /code/package.json
COPY bin /code/bin
COPY dist /code/dist

ENTRYPOINT ["/code/bin/entrypoint"]
