# Changelog

All notable changes to this project are be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2021-09-23

### Added

- SCT-3129: add GHA workflow which supports test and build for all scenarios - feature and fix branches, pull requests, merges to master, and releases - and pushes to GHCR. Also names the resulting image/package `navigator`, the new canonical name for this repo/product.
- SCT-3123: Added testing-library support

### Changed

- Internal code cleanup
- Updated node dependencies
- Implement "Narratives Navigator" language (the name of this product) in the title
- Implement "Navigator" with accompanying compass icon in the sidebar nav

### Deprecated

none

### Removed

- separate test and build workflows

### Fixed

- PTV-1694: Fix disappearing search text when use the Data/Preview tab, or the "Load More" button
- add "-n" to entr, otherwise broken
- Fix broken tests
- Fixed Typescript usage (errors reported by latest TS)
- SCT-3123: Fix duplicate auth calls up on app startup; significant refactoring to enable this.

### Security

- all NPM dependencies updated; resolving outstanding security alerts
