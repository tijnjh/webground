# ---- Build stage ----
FROM oven/bun:latest as build

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build the app
RUN bun run build

# ---- Production stage ----
FROM oven/bun:latest as prod

WORKDIR /app

# Copy built app and dependencies
COPY --from=build /app /app

# Expose port (change if your app uses a different port)
EXPOSE 5173

# Ensure the db.sqlite file exists (if not, create it)
RUN touch db.sqlite

# Set environment variables if needed
ENV NODE_ENV=production

CMD ["bun", "run", "start"]