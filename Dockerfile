FROM oven/bun:latest as build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
COPY drizzle ./drizzle

RUN mkdir -p data && touch data/db.sqlite

RUN bun run build

FROM oven/bun:latest as prod

WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]