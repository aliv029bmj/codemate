# Code566

## Overview
**Code566** transforms your VS Code line/column indicator into a fun, interactive experience with selectable user modes. Make your coding sessions more engaging and enjoyable!

## Features
Code566 enhances your coding experience by replacing the standard line/column display with one of seven interactive modes:

1. **Pixel Pet Mode** - A virtual pet that reacts to your coding behavior, gaining experience and energy based on your typing patterns.

2. **Travel Mode** - Virtually travel to different cities around the world based on your cursor position, with distance tracking and city information.

3. **Stats HUD Mode** - Displays a comprehensive dashboard of coding statistics including typing speed, character count, and line information.

4. **Heat Map Mode** - Visualizes your editing activity with a color-coded heat map, showing which parts of your code receive the most attention.

5. **Line Length Warning Mode** - Highlights lines that exceed recommended length limits, with customizable settings for different programming languages.

6. **Code Feature Detector Mode** - Detects and displays information about code structures at your cursor position, providing insights into your codebase.

7. **Line/Column Records Mode** - Tracks and displays interesting statistics and records about your line and column positions across your coding sessions.

## Installation

### Via VS Code Marketplace
1. Open VS Code
2. Click the Extensions view icon in the Sidebar or press `Ctrl+Shift+X`
3. Search for "Code566"
4. Click Install

### Via GitHub Repository
```bash
# Clone the repository
git clone https://github.com/aliv029bmj/codemate.git

# Navigate to the repository folder
cd codemate

# Install dependencies
npm install

# Package the extension
npm run package

# Install to VS Code
code --install-extension code566-*.vsix
```

For detailed installation instructions, see [INSTALLATION.md](INSTALLATION.md).

## Usage

1. After installation, open the Command Palette (`Ctrl+Shift+P` or `F1`)
2. Type "Code566: Select Mode" and press Enter
3. Choose your preferred mode from the list

Each mode has its own unique commands and features:

- **Pixel Pet Mode**: Watch your virtual pet grow as you code
- **Travel Mode**: Explore different cities without leaving your editor
- **Stats HUD Mode**: Toggle the stats dashboard with "Code566: Toggle Stats HUD"
- **Heat Map Mode**: Visualize your code activity with "Code566: Toggle Heat Map"
- **Line Length Warning Mode**: Configure line length settings with "Code566: Configure Line Length Settings"
- **Code Feature Detector Mode**: View code structure information with "Code566: Toggle Code Feature Detector"
- **Line/Column Records Mode**: Track your coding records with "Code566: Show Line/Column Records"

## Configuration

You can configure Code566 through VS Code settings:

1. Open VS Code settings (`Ctrl+,`)
2. Search for "Code566"
3. Adjust settings according to your preferences

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to the [GitHub repository](https://github.com/aliv029bmj/codemate).

## License

This project is licensed under the MIT License - see the LICENSE file for details.