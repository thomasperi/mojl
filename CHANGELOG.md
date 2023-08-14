# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]


## [2.0.0-alpha.5] - 2023-08-13

### Fixed
- Minifier adapters can be async
- stricter options

### Added
- More documentation
- `collations` option

### Changed
- Replaced `modules`, `buildJsFile`, and `buildCssFile` options with `collations`


## [2.0.0-alpha.4] - 2023-05-25

### Fixed
- home dotfile considerations

### Changed
- TemplateHelper now returns a function


## [2.0.0-alpha.3] - 2023-05-25

### Added
- `buildDocumentFile` can now accept props to pass to the module, and an explicit document to write to.
- `Mojl` class now has `buildDocument` method
- `Mojl.buildTemplates` test
- Allow templates to decline to write output by returning false

### Changed
- Renamed `Mojl` methods: `buildDocument` -> `buildTemplate`, `buildTemplates` -> `buildTemplatesAuto`


## [2.0.0-alpha.2] - 2023-05-24

### Fixed
- `urlDocument` + `pageRelativeUrls` bug
- `build()` now builds templates last instead of in parallel (for style and script hashes)


## [2.0.0-alpha.1] - 2023-05-22

### Added

- More and better documentation
- New helper methods implemented

### Removed

- `templateOutputDir` option

### Changed

- Some Mojl methods renamed


## [2.0.0-alpha.0] - 2023-05-17

### Changed

- Complete rewrite

### Added

- Changelog
- Templates

### Removed

- Simulated builds


## [1.1.0] - 2021-11-17

- Pre-changelog


[unreleased]: https://github.com/thomasperi/mojl/compare/v2.0.0-alpha.5...2.0.0-alpha
[2.0.0-alpha.5]: https://github.com/thomasperi/mojl/compare/v2.0.0-alpha.4...v2.0.0-alpha.5
[2.0.0-alpha.4]: https://github.com/thomasperi/mojl/compare/v2.0.0-alpha.3...v2.0.0-alpha.4
[2.0.0-alpha.3]: https://github.com/thomasperi/mojl/compare/v2.0.0-alpha.2...v2.0.0-alpha.3
[2.0.0-alpha.2]: https://github.com/thomasperi/mojl/compare/v2.0.0-alpha.1...v2.0.0-alpha.2
[2.0.0-alpha.1]: https://github.com/thomasperi/mojl/compare/v2.0.0-alpha.0...v2.0.0-alpha.1
[2.0.0-alpha.0]: https://github.com/thomasperi/mojl/compare/v1.1.0...v2.0.0-alpha.0
[1.1.0]: https://github.com/thomasperi/mojl/releases/tag/v1.1.0
