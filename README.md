# xchange

A monorepo for a stock exchange platform built with Turborepo and pnpm workspaces.

## What's new (14 Aug 2026)

- **`@repo/matching-engine` public exports** — `src/index.ts` re-exports the matching engine, order book, order value objects, and `Trade` for other workspaces.
- **`OrderBook` owns its sides** — `new OrderBook()` builds bid/ask `OrderBookSide`s with `BidOrderComparator` / `AskOrderComparator`. Callers no longer inject sides.
- **Removal on both sides** — `remove(order)` routes by `order.side` to the bid or ask book. `OrderBookSide.remove` takes an `OrderId`.
- **`cancel(order)`** — same routing as `remove` (cancel vs fill-removal is not split further yet).
- **`exchange-api` app** — new workspace depending on `@repo/matching-engine`. `PlaceOrder` maps a `PlaceOrderInput` into an `Order` and calls `MatchingEngine.process`.

## Implementation Status

The project is in early development. `@repo/matching-engine` is a working, test-driven limit-order matching core. `exchange-api` has a first application use case (`PlaceOrder`) on top of that core. The `web` and `docs` apps are still default Turborepo/Next.js starters and are not yet connected to the matching engine.

### Implemented

| Area | Status |
|---|---|
| Order domain model (value objects + `Order` aggregate) | Done |
| Price-time priority order book (bid/ask sides + comparators) | Done |
| `OrderBook` no-arg construction and remove/cancel on both sides | Done |
| Limit-order matching policy (price crossing rules) | Done |
| Matching engine (`process` with partial fills and multi-trade loop) | Done |
| Trade recording (quantity, price, resting/incoming order IDs) | Done |
| Public package exports (`src/index.ts`) | Done |
| Unit tests for orders, order book, and matching engine | Done |
| `PlaceOrder` use case in `exchange-api` | Done |

### Not yet implemented

- HTTP/API surface, persistence, or market data feeds
- Integration with `web` or `docs` apps
- Time-priority tie-breaking tests (`createdAt` ordering)
- Distinct cancel vs fill-removal behavior (`cancel` currently matches `remove`)

## Matching Engine

The `@repo/matching-engine` package implements the core domain logic for matching buy and sell orders on the exchange.

### Module layout

```
packages/matching-engine/src/
  order/              Order aggregate and value objects
  order-book/         OrderBook, OrderBookSide, price-time comparators
  matching/           MatchingPolicy (crossing rules)
  matching-engine/    MatchingEngine, MatchingResult
  trade/              Trade
  test/builders/      OrderBuilder test helper
```

### Order domain model

The `Order` class represents a single order placed on the exchange. It is composed of the following value objects, each of which enforces its own invariants:

- `OrderId` — a non-empty string identifier for an order; supports `equals(other)` for comparing two order IDs
- `OrderSide` — either `"buy"` or `"sell"`
- `OrderPrice` — a strictly positive number representing the limit price
- `OrderQuantity` — a strictly positive number representing the requested quantity
- `RemainingOrderQuantity` — tracks how much of the order is yet to be filled; cannot go negative
- `OrderCreatedAt` — timestamp used for time-priority tie-breaking within the same price level

An `Order` exposes three methods:

- `getRemainingQuantity()` — returns the current unfilled quantity
- `fill(quantity)` — reduces the remaining quantity by the given amount; throws if the fill would exceed what remains
- `isFilled()` — returns true when the remaining quantity reaches zero

### Order book

`OrderBook` is constructed with `new OrderBook()`. The constructor creates a bid side (`BidOrderComparator`) and an ask side (`AskOrderComparator`). Orders are added via `add(order)`, which routes by `order.side`. `bestBid()` and `bestAsk()` return the current best order on each side. `getBidSide()` and `getAsksSide()` expose the sides.

`remove(order)` and `cancel(order)` both route by `order.side` and drop the order from that side.

Each `OrderBookSide` keeps its orders sorted using an `OrderComparator`:

- `BidOrderComparator` — sorts by highest price first, then earliest `createdAt` (price-time priority for buy orders)
- `AskOrderComparator` — sorts by lowest price first, then earliest `createdAt` (price-time priority for sell orders)

`OrderBookSide.best()` returns the highest-priority order (or `null` if the side is empty), `getOrders()` exposes the full sorted list, and `remove(orderId)` finds the matching order by `OrderId` and splices it out (throwing if it isn't present).

### Matching engine

The `MatchingEngine` takes an `OrderBook` and a `MatchingPolicy`, and exposes a single `process(incomingOrder)` method that returns a `MatchingResult` (`{ trades, restingOrder }`).

`process` runs in a loop until the incoming order is fully filled or can no longer match:

1. **No opposing resting order** — the incoming order is added to the book and returned as `restingOrder` with no trades.
2. **Opposing order exists but prices do not cross** — the incoming order is returned unmatched with no trades and is not added to the book.
3. **Prices cross** — the traded quantity is the minimum of the two orders' remaining quantities. Both orders are filled by that amount via `Order.fill()`, a `Trade` is recorded, and a fully filled resting order is removed from the book. The loop continues if the incoming order still has remaining quantity.
4. **Partially filled incoming order** — after the loop, any unfilled remainder is added to the book and returned as `restingOrder`.

`MatchingPolicy.canMatch(incoming, resting)` encodes the crossing rule: a buy order matches when its price is greater than or equal to the resting price (`OrderPrice.isGreaterThanOrEqualTo`); a sell order matches when its price is less than or equal to the resting price (`OrderPrice.isLessThanOrEqualTo`).

### Trade

Each successful match produces a `Trade` with:

- `quantity` — the amount traded in this fill
- `price` — the resting order's limit price (price-time priority: the resting order sets the trade price)
- `restingOrderId` — the ID of the order that was already on the book
- `incomingOrderId` — the ID of the order being processed

### Testing

Tests use the `OrderBuilder` test helper (`src/test/builders/order-builder.ts`) to construct valid `Order` instances without repeating value-object boilerplate, e.g. `OrderBuilder.aBuyOrder().withPrice(100).withQuantity(2).build()`.

**Test coverage (~29 tests):**

| Module | Scenarios covered |
|---|---|
| `Order` | Fill reduces remaining quantity; full fill detection (buy and sell) |
| `OrderBookSide` | Empty side; single order; ask price priority; bid price priority |
| `OrderBook` | Routing buy/sell to correct side; `bestBid`/`bestAsk`; empty-side null returns; remove so the order no longer matches |
| `MatchingEngine` | Resting on empty book; crossing and non-crossing prices; quantity reduction; partial fills (resting and incoming); resting order removal; partially filled incoming added to book; multi-trade loop across multiple resting orders; trade quantity, price, resting order ID, and incoming order ID |

## Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Vitest](https://vitest.dev/) for unit testing

## Packages

- `web`: the main Next.js application (starter scaffold)
- `docs`: Next.js documentation app (starter scaffold)
- `exchange-api`: application layer on the matching engine (`PlaceOrder`)
- `@repo/matching-engine`: core order matching engine
- `@repo/ui`: shared React component library
- `@repo/eslint-config`: shared ESLint configuration
- `@repo/typescript-config`: shared TypeScript configuration

## Exchange API

`apps/exchange-api` depends on `@repo/matching-engine`. `PlaceOrder.execute(input)` builds an `Order` from `PlaceOrderInput` (`id`, `side`, `price`, `quantity`, `createdAt`) and returns `MatchingEngine.process(order)`.

There is no HTTP server yet; this is the first use-case wrapper around the engine.

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

Run matching-engine tests:

```sh
turbo test --filter=@repo/matching-engine
```

Run exchange-api tests:

```sh
turbo test --filter=exchange-api
```
