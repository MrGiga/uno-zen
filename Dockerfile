FROM ghost:4.32.0

ENV GULP_VERSION 4.0.2
RUN set -eux; \
	npm install -g "gulp@$GULP_VERSION"; \
	npm cache clean --force

ENV BOWER_VERSION 1.8.13
RUN set -eux; \
	npm install -g "bower@$BOWER_VERSION"; \
	npm cache clean --force

RUN apt-get update;
RUN apt-get install -y --no-install-recommends ca-certificates git;
ENV NODE_ENV=development

COPY package.json .
COPY bower.json .
COPY Gulpfile.js .
COPY gulp_ghost_config.yaml .
COPY scripts/configure_gulp_docker.sh .

