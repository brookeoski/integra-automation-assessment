# Integra Automation Assessment

## Purpose

A Playwright + TypeScript automation framework demonstrating production-quality
API and UI test engineering practices.

## Setup

```bash
npm ci
npx playwright install --with-deps
cp .env.example .env
```

### API tests (GoRest)

The API suite runs against [gorest.co.in](https://gorest.co.in/), which requires a personal
access token:

1. Sign in at [gorest.co.in](https://gorest.co.in/) and generate an access token.
2. In `.env`, set:
   ```
   BASE_URL=https://gorest.co.in
   GOREST_TOKEN=<your token>
   ```

### UI tests (Sauce Demo)

The UI suite runs against [saucedemo.com](https://www.saucedemo.com/). In `.env`, set:

```
UI_BASE_URL=https://www.saucedemo.com
SAUCE_USERNAME=standard_user
SAUCE_PASSWORD=secret_sauce
```

A `setup` project logs in once and saves authenticated browser state to
`playwright/.auth/` (git-ignored). The `ui` project depends on `setup` and
reuses that state automatically, so UI tests start already authenticated.

## Running Locally

```bash
npm test          # all tests, 4 workers
npm run test:api  # API project only
npm run test:ui   # UI project only
npm run report    # open last HTML report
```

## Running in Docker

```bash
docker build -t integra-automation .
docker run --rm --env-file .env -v "$(pwd)/playwright-report:/app/playwright-report" integra-automation
```

## Running in GitHub Actions

Tests run automatically on push and pull requests to `main`
(`.github/workflows/playwright.yml`). The HTML report is uploaded as a
workflow artifact.

## The Four D's

| Principle       | How this repository demonstrates it                                   |
| --------------- | ----------------------------------------------------------------------- |
| **Deterministic** | Web-first assertions, no arbitrary waits, `retain-on-failure` traces for debugging without added flakiness. |
| **Decoupled**     | `fullyParallel` execution across 4 workers with no shared state or ordering between tests. |
| **Data-Driven**   | Tests own the data they create and generate it uniquely at runtime, keeping logic separate from data and cleaning up after execution. |
| **Dynamic**       | Config and endpoints are read from environment variables (`.env`), never hardcoded; IDs are captured from API responses at runtime. |
