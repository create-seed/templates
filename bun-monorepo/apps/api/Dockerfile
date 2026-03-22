FROM oven/bun:1.3.11 AS build
WORKDIR /app

COPY bun.lock package.json turbo.json ./
COPY apps apps
COPY packages packages
COPY turbo turbo
RUN bun install --frozen-lockfile --ignore-scripts

RUN cd apps/api && bun run build

FROM gcr.io/distroless/base-nossl-debian12
WORKDIR /app
USER nonroot
COPY --from=build /app/apps/api/dist/api ./api

ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["./api"]
