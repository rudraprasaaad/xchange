# xchange

A monorepo for a stock exchange platform built with Turborepo and pnpm workspaces.

## Packages

- `web`: the main Next.js application
- `docs`: Next.js documentation app
- `@repo/matching-engine`: core order matching engine
- `@repo/ui`: shared React component library
- `@repo/eslint-config`: shared ESLint configuration
- `@repo/typescript-config`: shared TypeScript configuration

## Getting Started

Install dependencies:

```sh
pnpm install
```

Run all packages in development mode:

```sh
turbo dev
```

Run a specific package:

```sh
turbo dev --filter=web
```

## Matching Engine

The `@repo/matching-engine` package implements the core domain logic for matching buy and sell orders on the exchange.

### Order domain model

The `Order` class represents a single order placed on the exchange. It is composed of the following value objects, each of which enforces its own invariants:

- `OrderId` - a non-empty string identifier for an order
- `OrderSide` - either `"buy"` or `"sell"`
- `OrderPrice` - a strictly positive number representing the limit price
- `OrderQuantity` - a strictly positive number representing the requested quantity
- `RemainingOrderQuantity` - tracks how much of the order is yet to be filled; cannot go negative

An `Order` exposes three methods:

- `getRemainingQuantity()` - returns the current unfilled quantity
- `fill(quantity)` - reduces the remaining quantity by the given amount; throws if the fill would exceed what remains
- `isFilled()` - returns true when the remaining quantity reaches zero

### Order book

The `OrderBook` class maintains two separate lists: bids (buy orders) and asks (sell orders). Orders are added via `add(order)` and retrieved via `getBids()` and `getAsks()`.

## Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Vitest](https://vitest.dev/) for unit testing
