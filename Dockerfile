FROM ghost:4.32.0

ENV GULP_VERSION 4.0.2
ENV BOWER_VERSION 1.8.13
ENV NODE_ENV=development

RUN set -eux; \
	npm install -g "gulp@$GULP_VERSION"; \
	npm install -g "bower@$BOWER_VERSION"; \
	npm cache clean --force

RUN apt-get update; \
	apt-get install -y --no-install-recommends ca-certificates git zip; \
    rm -rf /var/lib/apt/lists/*

COPY package.json .
COPY bower.json .
COPY Gulpfile.js .
COPY gulp_ghost_config.yaml .
COPY scripts/configure_gulp_docker.sh .

