FROM node:22-alpine3.21 AS base

ENV DIR /app
WORKDIR $DIR

# development stage
FROM base AS dev

ENV NODE_ENV=development
ENV CI=true

RUN npm install -g pnpm@10.11.0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY tsconfig*.json .
COPY .swcrc .
COPY nest-cli.json .
COPY src src

EXPOSE $PORT
EXPOSE 9229
CMD ["pnpm", "run", "dev"]

# build stage
FROM base AS build

ENV CI=true

RUN apk update && apk add --no-cache dumb-init=1.2.5-r3 && npm install -g pnpm@10.11.0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile && pnpm store prune

COPY tsconfig*.json .
COPY .swcrc .
COPY nest-cli.json .
COPY src src

RUN node --run build \
    && pnpm prune --prod \
    && pnpm store prune \
    && rm -rf ~/.pnpm-store
    
# production stage
FROM base AS production

ENV NODE_ENV=production
ENV USER=node

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build $DIR/package.json .
COPY --from=build $DIR/pnpm-lock.yaml .
COPY --from=build $DIR/node_modules node_modules
COPY --from=build $DIR/dist dist

USER $USER
EXPOSE $PORT
CMD ["dumb-init", "node", "dist/main.js"]
