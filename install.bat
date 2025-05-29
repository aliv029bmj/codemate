@echo off
echo 🚀 Starting Code566 Installation...

:: Check if VS Code is installed
where code >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ VS Code is not installed or not in the PATH. Please install VS Code first.
    exit /b 1
)

:: Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install Node.js and npm first.
    exit /b 1
)

:: Navigate to the script directory
cd /d "%~dp0"

:: Check if VSIX file already exists
dir /b code566-*.vsix >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ VSIX package already exists, skipping build step.
) else (
    :: Install dependencies
    echo 📦 Installing dependencies...
    call npm install

    :: Build extension
    echo 🔨 Building extension...
    call npm run compile
    call npm run package
)

:: Install the extension
echo 🔌 Installing extension...
for /f "tokens=*" %%a in ('dir /b code566-*.vsix 2^>nul') do (
    set VSIX_FILE=%%a
    echo Installing: %%a
    call code --install-extension %%a
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Installation complete! Restart VS Code and type 'Code566: Select Mode' in the command palette to start.
    ) else (
        echo ⚠️ Automatic installation failed. Please install manually:
        echo 1. Open VS Code
        echo 2. Press Ctrl+Shift+X to open Extensions view
        echo 3. Click ... (More Actions) and select 'Install from VSIX...'
        echo 4. Browse to and select: %CD%\%%a
    )
    goto :installed
)

echo ❌ No VSIX package found.
exit /b 1

:installed
exit /b 0 