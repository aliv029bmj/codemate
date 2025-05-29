# Code566

## Overview
**Code566** transforms your VS Code line/column indicator into a fun, interactive experience with selectable user modes. Make your coding sessions more engaging and enjoyable!

## Features
Code566 enhances your coding experience by replacing the standard line/column display with one of six interactive modes:

1. **Pixel Pet Mode** - A virtual pet that reacts to your coding behavior, gaining experience and energy based on your typing patterns.

2. **Travel Mode** - Virtually travel to different cities around the world based on your cursor position, with distance tracking and city information.

3. **Stats HUD Mode** - Displays a comprehensive dashboard of coding statistics including typing speed, character count, and line information.

## Installation

### Via VS Code Marketplace
1. Open VS Code
2. Click the Extensions view icon in the Sidebar or press `Ctrl+Shift+X`
3. Search for "Code566"
4. Click Install

### Via Direct Download
1. Download the latest `.vsix` file from the [Releases](https://github.com/aliv029bmj/code566/releases) page
2. In VS Code, from the Extensions view (Ctrl+Shift+X), click "..." at the top
3. Select "Install from VSIX..."
4. Choose the downloaded file

## Usage

### Selecting a Mode
You can select your preferred mode in three ways:
- Command Palette: `Code566: Select Mode`
- Status bar: Click on the Code566 indicator
- Settings: Configure your preferred mode in settings

### Configuration
The extension provides the following configuration options:

* `code566.activeMode`: Sets the active Code566 mode (pixelpet, travel, stats)

### Commands

* `code566.selectMode`: Open the mode selector menu
* `code566.toggleStats`: Toggle the Stats HUD visibility (when in Stats mode)

## Troubleshooting

If you encounter any issues:
1. Make sure VS Code is up to date
2. Right-click on Code566 in the Extensions panel and select "Extension Settings"
3. Check the "Output" panel for activation errors

For help or more information, refer to the GitHub repository: https://github.com/aliv029bmj/code566