# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

_Nothing at this moment_

## [1.0.1] - 2026-04-10

### Fixed

- Remove `declare global` augmentation for JSR compatibility (use `WeakMap` for instance tracking)
- Fix test assertion for default `initVisibleRatio` (0.5, not 0.25)

### Changed

- Add `"type": "module"` to package.json
- Add `"files"` whitelist for npm publishing
- Add `copy:css` to build chain (non-minified CSS now included in build output)
- Add `CHANGELOG.md` to npm package
- Bump `esbuild` to 0.28.0
- Bump `actions/checkout` to v5 (Node 24 native)
- Set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` in CI/release workflows
- Pin bun version in CI instead of `bun-version-file`
- Replace `gitleaks-action` with direct binary install
- Use `npm publish --provenance` with OIDC instead of `bun publish`
- Extract changelog for GitHub Release body
- Add version bump script (`bun run version:bump <version>`)
- Disable `noNonNullAssertion` and `noExplicitAny` lint rules for test files

## [1.0.0] - 2026-03-25

Initial release as a standalone vanilla JavaScript library.

### Features

- Vanilla JS, no dependencies
- Draggable slider to compare two images
- Touch friendly, mouse drag (Pointer Events), click, and mousemove interaction modes
- Responsive resizing support
- Appearance fully controlled via CSS
- Custom events: `imagesCompare:initialised`, `imagesCompare:changed`, `imagesCompare:resized`
- API: `setValue`, `getValue`, `destroy`, `recycle`, `on`, `off`
- Animation support on value updates
- TypeScript source, published to npm and JSR
- Bun-based build pipeline (esbuild for JS/CSS minification)
