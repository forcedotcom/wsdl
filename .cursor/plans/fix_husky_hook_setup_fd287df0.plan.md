---
name: Fix Husky Hook Setup
overview: Configure Husky properly so pre-commit hooks automatically regenerate src files from WSDL changes, preventing commits like 5855538 that only update WSDL without updating generated TypeScript.
todos:
  - id: add-husky-dep
    content: Add husky to devDependencies in package.json
    status: completed
  - id: add-prepare-script
    content: Add prepare script to package.json
    status: completed
  - id: install-husky
    content: Run yarn commands to install and initialize husky
    status: completed
  - id: verify-hooks
    content: Verify git hooks are properly configured
    status: completed
  - id: add-ci-validation
    content: Add CI workflow to validate WSDL and src are in sync
    status: completed
---

# Fix Husky Hook Setup

## Problem Analysis

Commit [5855538](https://github.com/forcedotcom/wsdl/commit/5855538a3004b4af96ed52ab771c143ccd93df6e) updated 4 WSDL files in `resources/` but didn't regenerate the corresponding TypeScript files in `src/`.

**Root causes**:

1. `.git/hooks/` contains only sample files - husky hooks aren't actually installed
2. Git `core.hooksPath` not configured to use `.husky/`
3. No `prepare` script in [`package.json`](package.json) to auto-install husky on `yarn install`
4. Developer either:

   - Never ran `yarn install` (so husky never initialized)
   - Used `git commit --no-verify` to bypass hooks
   - Committed from different machine/environment without husky

## Solution

### 1. Add Husky as Dependency

Currently husky isn't in `devDependencies` in [`package.json`](package.json). Add it:

```json
"husky": "^8.0.0"
```

### 2. Add Prepare Script

Add to [`package.json`](package.json) scripts:

```json
"prepare": "husky install"
```

This auto-runs on `yarn install`, ensuring hooks are always configured.

### 3. Initialize Husky Locally

Run `yarn add -D husky` and `yarn prepare` to:

- Install husky package
- Configure git `core.hooksPath` to `.husky/`
- Create `.husky/_/husky.sh` (currently missing)

### 4. CI/CD Protection (Optional but Recommended)

Add validation in GitHub Actions to verify generated files match WSDL:

- Run `yarn generate` in CI
- Check if `git diff` shows changes in `src/`
- Fail build if WSDL and src are out of sync

This catches cases where developers bypass hooks with `--no-verify`.

## Files to Modify

- [`package.json`](package.json) - add husky dependency + prepare script
- [`.github/workflows/`](.github/workflows/) - add validation step (optional)

## Why This Prevents Future Issues

1. **Automatic setup**: `prepare` script ensures hooks install on every `yarn install`
2. **Pre-commit enforcement**: Hook runs `generate` + `build` + `lint` before allowing commits
3. **Auto-staging**: `git add src` in [`.husky/pre-commit`](.husky/pre-commit) ensures generated files are included
4. **CI safety net**: Optional validation catches bypassed hooks