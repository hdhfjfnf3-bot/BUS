# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + Socket.IO (real-time)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server + Socket.IO
│   └── otobus-complete/    # React + Vite frontend (أتوبيس كومبليت game)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## أتوبيس كومبليت Game

Multiplayer Arabic word game. Players join from their own devices using a room code.

**Game Flow:**
1. Host creates room → gets 4-character code
2. Players join from own phones using the code
3. Host starts game → random Arabic letter appears on everyone's screen
4. Each player fills answers for each category on their own phone
5. Anyone presses "أتوبيس كومبليت!" → **all phones instantly locked**
6. Scoring: unique answers = 10 pts, matching answers = 5 pts each, invalid = 0 pts
7. Host reviews scores and advances to next round
8. Final leaderboard shown after all rounds

**Word Validation:**
- Must start with the round's letter (أ/إ/ا/آ treated as same)
- Must be ≥ 2 characters
- Arabic characters only
- No all-same-character words (e.g. ببببب)
- No repeating patterns

**Architecture:**
- `artifacts/api-server/src/game/` — game logic, room manager, Socket.IO handler
- `artifacts/otobus-complete/src/` — React frontend with Socket.IO client
  - `screens/` — HomeScreen, LobbyScreen, PlayingScreen, ScoringScreen, FinalScreen
  - `lib/socket.ts` — Socket.IO client singleton
  - `lib/gameTypes.ts` — shared TypeScript types
- Socket.IO path: `/api/socket.io`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server + Socket.IO for real-time game state. Room management stored in-memory.

### `artifacts/otobus-complete` (`@workspace/otobus-complete`)

React + Vite frontend for the game. Connects via Socket.IO to the API server.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI spec and Orval config. Run codegen: `pnpm --filter @workspace/api-spec run codegen`
