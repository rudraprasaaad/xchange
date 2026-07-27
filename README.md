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

The `OrderBook` class maintains two `OrderBookSide` instances, one for bids (buy orders) and one for asks (sell orders). Orders are added via `add(order)`, which routes the order to the correct side based on `order.side`. The current best price on each side is available via `bestBid()` and `bestAsk()`.

Each `OrderBookSide` keeps its orders sorted using an `OrderComparator`:

- `BidOrderComparator` - sorts by highest price first, then earliest `createdAt` (price-time priority for buy orders)
- `AskOrderComparator` - sorts by lowest price first, then earliest `createdAt` (price-time priority for sell orders)

`OrderBookSide.best()` returns the highest-priority order (or `null` if the side is empty), and `getOrders()` exposes the full sorted list.

### Matching engine

The `MatchingEngine` takes an `OrderBook` and a `MatchingPolicy`, and exposes a single `process(incomingOrder)` method that returns a `MatchingResult` (`{ trades, restingOrder }`):

- If there is no opposing resting order, the incoming order is added to the book and returned as the `restingOrder`.
- If a resting order exists but the `MatchingPolicy` determines it cannot match (buy price below best ask, or sell price above best bid), the incoming order is returned unmatched with no trades.
- If the orders cross, the traded quantity is the minimum of the two orders' remaining quantities. Both the incoming and resting orders are filled by that amount via `Order.fill()`, a `Trade` is produced and returned in `trades`, and a resting order that becomes fully filled is dropped from the `OrderBook` (so it no longer appears via `bestBid()`/`bestAsk()`).

`MatchingPolicy.canMatch(incoming, resting)` encodes the crossing rule: a buy order matches when its price is greater than or equal to the resting price (`OrderPrice.isGreaterThanOrEqualTo`); a sell order matches when its price is less than or equal to the resting price (`OrderPrice.isLessThanOrEqualTo`).

### Testing

Tests use the `OrderBuilder` test helper (`src/test/builders/order-builder.ts`) to construct valid `Order` instances without repeating value-object boilerplate, e.g. `OrderBuilder.aBuyOrder().withPrice(100).withQuantity(2).build()`.

## Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Vitest](https://vitest.dev/) for unit testing
