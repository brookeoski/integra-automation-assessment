# Cursor Rules

## Goal

Build a clean, production-quality Playwright + TypeScript automation assessment.

This repository is intentionally small.

Do not overengineer.

Assume another senior automation engineer will review this project.

The code should communicate good engineering judgment more than cleverness.

---

# The Four D's

Every design decision should support one or more of these principles.

## 1. Deterministic

Tests must be reliable and repeatable.

- Never use arbitrary waits.
- Prefer Playwright web-first assertions.
- Use stable locators.
- Keep execution predictable.

## 2. Decoupled

Tests must run:

- independently
- in any order
- in parallel
- with four workers

No shared mutable state.

No ordered execution.

## 3. Data-Driven

Separate test logic from test data.

Generate unique data when needed.

Own test data.

Clean up everything created during execution.

## 4. Dynamic

Never hardcode IDs.

Use environment variables.

Capture API-generated IDs.

Reuse configuration.

---

# DRY

Extract duplication when it improves readability or reduces maintenance.

Do not abstract prematurely.

Every abstraction should solve a real problem that exists today.

Prefer explicit code over generic frameworks.

---

# Simplicity

Prefer fewer files.

Prefer shorter code.

Prefer plain Playwright.

Avoid wrapper classes around Playwright.

Avoid unnecessary helpers.

Avoid deep inheritance.

Avoid speculative architecture.

Do not build for future requirements.

Do not introduce patterns simply because they are common.

Every file should justify its existence.

---

# Comments

Avoid unnecessary comments.

Only comment code when the intent is not obvious.

Good naming is preferred over comments.

---

# Scope

Only implement what the assessment requires.

No extra features.

No premature optimization.

No unnecessary dependencies.

Keep the repository understandable in under five minutes.

## Decision Making

When choosing between two valid implementations:

Choose the simpler one.
Choose the one with fewer moving parts.
Choose the one requiring less code to review.
Optimize for readability over cleverness.

Assume every additional line of code becomes future maintenance.