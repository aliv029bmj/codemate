# Change Log

All notable changes to the "Code566" extension will be documented in this file.

## [0.2.0] - 2024-07-10

### Added
- "Disable All Modes" option in the mode selector
- Status bar indicator when no mode is selected
- Welcome message for first-time users

### Changed
- Extension now starts with no mode selected by default
- Updated configuration to allow null as a valid active mode value
- Improved mode selection behavior to ensure only one mode is active at a time

### Fixed
- Issue where a default mode would be automatically selected on startup

## [0.1.0] - 2024-07-10

### Added
- Initial release of Code566 with seven interactive modes:
  - **Pixel Pet Mode**: Virtual pet that reacts to coding behavior
  - **Travel Mode**: Virtual travel experience based on cursor position
  - **Stats HUD Mode**: Dashboard with coding statistics
  - **Heat Map Mode**: Visualization of code editing activity
  - **Line Length Warning Mode**: Warning system for exceeding line length limits
  - **Code Feature Detector Mode**: Code structure information at cursor position
  - **Line/Column Records Mode**: Statistics and records tracker for line/column positions
- Mode switching via Command Palette
- Custom status bar integration for all modes
- Visual panels for Heat Map, Code Feature Detector, and Line/Column Records
- Configuration options via VS Code settings
- Extension icon and documentation

### Changed
- N/A (Initial release)

### Fixed
- N/A (Initial release) 