# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

_Nothing at this moment_

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
