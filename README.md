# Integra Automation Assessment

## Purpose

A Playwright + TypeScript automation framework covering API, UI, and Kafka
testing with production-oriented engineering practices: parallel execution,
data-driven tests, dynamic runtime data, and scalable design practices for
CI/CD reporting.

## Architecture Overview

**API Tests**

- Playwright request context (no browser)
- parameterized GoRest user coverage (all gender/status combinations)
- create → retrieve → validate → cleanup lifecycle per test

**UI Tests**

- documented manual scenarios (`docs/manual-test-cases.md`), two of which are automated
- Playwright browser automation (Chromium)
- reusable page abstractions (`LoginPage`, `CheckoutFlow`)
- saved authentication state where appropriate, so most UI tests start already logged in
- isolated unauthenticated negative-login coverage, which deliberately opts out of that saved state

**Kafka Tests**

- Dockerized local Kafka broker (KRaft mode, single node)
- one stable topic created during setup, shared by the suite
- one atomic producer acknowledgement test
- one atomic consumer delivery test
- unique correlation IDs and consumer groups per test run
- bounded, diagnostic consumer wait (fails fast with a clear timeout error)
- broker-level scope only — see [Kafka Scope and Design](#kafka-scope-and-design)

**CI/CD**

- API, UI, and Kafka run in separate, parallel GitHub Actions jobs
- each job generates its own Playwright blob report
- a downstream job merges all three blob reports into one HTML report
- the merged report is retained as an artifact and published to a stable GitHub Pages URL from `main`

## Design Principles

| Principle | How this repository applies it |
| --- | --- |
| **Deterministic** | Given the inputs a test generates and captures at runtime (a created user ID, a correlation ID), the resulting assertions are fully predictable. This is not the same as fixed/static test data — tests use UUIDs to guarantee uniqueness, so determinism here means *repeatable behavior relative to the input each run produces*, not identical literal input across runs. |
| **Decoupled** | Tests run `fullyParallel` with no shared state or ordering dependency. In CI, the API, UI, and Kafka suites run as three independent jobs so one suite's setup or failure can't block or slow another. |
| **Data-Driven** | Tests explicitly own and parameterize the data they depend on — e.g. all four gender/status combinations for GoRest users, or the checkout customer/product fixtures — rather than relying on shared or external fixtures. |
| **Dynamic** | Runtime-generated IDs (API user IDs, Kafka correlation IDs and consumer groups) and environment-driven configuration (`.env`) replace brittle hardcoded values and fixed waits. |
| **DRY** | Shared logic is centralized once it's genuinely reusable — page objects (`LoginPage`, `CheckoutFlow`), the Kafka client factory (`kafka.client.ts`), and env-var access (`env.ts`) — without adding abstraction layers the suite doesn't need. |

## API Design Decisions

The API suite (`tests/api/`) runs against [gorest.co.in](https://gorest.co.in/).

- **All valid gender/status combinations are explicitly parameterized.** Four tests cover `male`/`female` × `active`/`inactive` rather than picking one combination at random.
- **UUIDs provide unique emails without inconsistent random coverage.** Each user's name/email suffix is a `randomUUID()`, avoiding collisions with existing GoRest data — while gender and status stay parameterized and fixed, so every run exercises the same known set of cases.
- **The POST response ID is the source of truth.** The ID returned when a user is created is what every subsequent `GET`/`DELETE` in that test targets — never a guessed or separately-tracked ID.
- **GET validates the exact record created by that test.** The retrieved user is asserted against the same payload that was submitted, not just "a user with this ID exists."
- **Cleanup is failure-safe.** If a step after creation fails, a `catch` block still attempts deletion before rethrowing, and the deletion in that catch block swallows its own errors so it can't mask the original failure.
- **Status assertions and payload assertions validate different concerns.** Each test checks the HTTP status code and the response body in separate `test.step`s, so a failure clearly indicates whether the request failed or merely returned unexpected data.

## Kafka Scope and Design

The automated Kafka tests (`tests/kafka/`) validate **broker/client integration
only**:

- successful producer acknowledgement (`TC_KAFKA_001`)
- receipt of the matching correlated message by a subscribed consumer (`TC_KAFKA_003`)

They intentionally do **not** claim to validate:

- application business logic
- schema enforcement
- database side effects
- retries
- dead-letter routing
- business idempotency

Validating those concerns requires a real or simulated application
producer/consumer, not just a broker client. The remaining manual scenarios
in `docs/kafka-manual-test-cases.md` (malformed messages, duplicate
delivery, broker unavailability, consumer restart/reconnect) sketch what
that broader coverage would look like.

**Why the suite is built this way:**

- **One stable topic is created before tests.** `kafka.setup.ts` creates the topic once and confirms a partition leader is elected, so the producer and consumer specs can each send/subscribe exactly once without racing a not-yet-ready topic.
- **Sends are not retried.** Each spec issues a single `producer.send` call, so an unacknowledged send is a real, visible failure rather than one hidden behind retry logic.
- **Unique correlation IDs and consumer groups preserve isolation.** Every message carries a `randomUUID()` correlation ID, and the consumer test uses a freshly generated consumer group, so parallel or repeated runs can't cross-match messages or replay another run's offsets.
- **Docker health checks remove startup timing assumptions.** `docker compose up --wait` combined with the broker's health check means setup proceeds only once the broker actually accepts connections — never after a fixed sleep.
- **The consumer wait is bounded and diagnostic.** The consumer test races message receipt against a 15-second timeout that names the correlation ID and topic, turning a hang into a fast, readable failure instead of blocking the run indefinitely.

## CI/CD and Reporting

```
api-tests ─────┐
ui-tests ──────┼──> merge-reports ───> deploy-pages
kafka-tests ───┘
```

- **Separate jobs isolate dependencies and failure modes.** API, UI, and Kafka run as independent GitHub Actions jobs, each installing only what it needs.
- **API does not install a browser.** The `api-tests` job runs `npm ci` and the type check only — no Playwright browser install.
- **UI installs Chromium.** The `ui-tests` job runs `npx playwright install --with-deps chromium` before the suite.
- **Kafka uses Docker.** The `kafka-tests` job pulls the `apache/kafka` image in parallel with `npm ci`, then starts the broker via `docker compose` inside the test run itself.
- **Blob reports are mergeable, unlike separate HTML directories.** Each job sets a distinct `PLAYWRIGHT_BLOB_OUTPUT_DIR` and reports in `blob` format; `merge-reports` downloads all three and runs `playwright merge-reports --reporter html` to produce one combined report.
- **GitHub Pages provides one stable URL for the latest main-branch report.** `deploy-pages` runs only after `merge-reports` succeeds, and only on a push to `main` or a manual `workflow_dispatch` run.
- **Pull requests produce artifacts but do not publish Pages.** The combined HTML report is always uploaded as a workflow artifact; the Pages deployment step is skipped for PR runs.

## Running Locally

```bash
# copy .env.example into a new .env file and fill in missing credentials
npm install
npx playwright install
npm test
```

### Required environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `BASE_URL` | API | GoRest API base URL (`https://gorest.co.in`) |
| `GOREST_TOKEN` | API | Personal access token — generate one at [gorest.co.in](https://gorest.co.in/) after signing in |
| `UI_BASE_URL` | UI | Sauce Demo base URL (`https://www.saucedemo.com`) |
| `SAUCE_USERNAME` / `SAUCE_PASSWORD` | UI | Sauce Demo's published demo credentials, not project secrets |
| `KAFKA_BROKER_URL` | Kafka | Local broker address (`localhost:9092`) |
| `KAFKA_TOPIC` | Kafka | Shared topic name created during Kafka setup |

See `.env.example` for the full template; none of these are checked in with
real values.

A `setup` project logs in to Sauce Demo once and saves authenticated browser
state to `playwright/.auth/` (git-ignored). The `ui` project depends on
`setup` and reuses that state, so most UI tests start already authenticated;
the invalid-login test explicitly opts out to test the login flow itself.

The Kafka suite starts and stops its own broker automatically — no manual
`docker compose` commands are needed:

```bash
npm run test:kafka # starts Kafka, runs the producer and consumer tests, stops Kafka
```

### Commands

```bash
npm test          # all tests, 4 workers (starts and stops Kafka automatically)
npm run test:api  # API project only
npm run test:ui   # UI project only
npm run test:kafka # Kafka project only (starts and stops Kafka automatically)
npm run report    # open last HTML report
npx tsc --noEmit  # type-check without emitting output (also run in CI)
```

## Running in Docker

```bash
docker build -t integra-automation .
docker run --rm --env-file .env -v "$(pwd)/playwright-report:/app/playwright-report" integra-automation
```

This image runs the `api` and `ui` projects, which reach their targets over
the network. The `kafka` project needs a broker on `localhost:9092` (see
[Required environment variables](#required-environment-variables)), so it
runs via `npm run test:kafka` instead.

## Limitations / Future Improvements

- GoRest is a shared, external service — availability and rate limits are outside this repository's control.
- UI coverage is intentionally limited for a time-boxed assessment: two of the four documented scenarios are automated (checkout, invalid login); login and cart add/remove are documented but not separately automated.
- The Kafka suite covers broker/client mechanics, not an application's business workflow — see [Kafka Scope and Design](#kafka-scope-and-design).
- A larger production suite could add contract validation, application-level event processing (a real producer/consumer under test), linting, and broader negative-path coverage across all three suites.
