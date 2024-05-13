FROM node:18-alpine3.18 AS base

ENV DIR /app
WORKDIR $DIR

# development stage
FROM base AS dev

RUN corepack enable && corepack prepare pnpm@latest --activate

ENV PNPM_HOME=/usr/local/bin
ENV NODE_ENV=development

COPY package*.json $DIR
COPY tsconfig*.json $DIR
COPY .swcrc .
COPY nest-cli.json .
COPY src $DIR/src

RUN pnpm install

EXPOSE $PORT 9229
CMD [ "pnpm", "start:dev" ]

# build stage
FROM base AS build

RUN corepack enable && corepack prepare pnpm@latest --activate \
    && apk update && apk add --no-cache dumb-init

ENV PNPM_HOME=/usr/local/bin

COPY package*.json pnpm-lock.yaml $DIR
COPY tsconfig*.json $DIR
COPY .env $DIR
COPY .swcrc .
COPY nest-cli.json .
COPY src $DIR/src

RUN pnpm i --frozen-lockfile 

RUN pnpm build \
    && pnpm prune --prod
    
# production stage
FROM base AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

ENV PNPM_HOME=/usr/local/bin
ENV NODE_ENV=production
ENV USER node

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build $DIR/node_modules node_modules
COPY --from=build $DIR/dist $DIR/dist

EXPOSE $PORT

USER $USER

CMD ["dumb-init", "node", "dist/main.js" ]