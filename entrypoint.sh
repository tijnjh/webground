#!/bin/sh
set -e
bun run migrate.ts
bun run start