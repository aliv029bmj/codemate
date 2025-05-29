@echo off
echo 🚀 Starting CodeMate Installation...

:: Check if npm exists
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ❌ npm not found. Please install Node.js.
  exit /b 1
)

:: Check if VS Code CLI exists
where code >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ⚠️ VS Code CLI not found. Automatic package installation will not be available.
)

:: Install dependencies
echo 📦 Installing dependencies...
call npm install

:: Compile
echo 🔨 Compiling code...
call npm run compile

:: Check if vsce exists
where vsce >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo 📥 vsce not installed, installing now...
  call npm install -g @vscode/vsce
)

:: Create VSIX package
echo 📦 Creating VSIX package...
call vsce package

:: Find the latest VSIX file
for /f "tokens=*" %%a in ('dir /b codemate-*.vsix 2^>nul') do (
  set VSIX_FILE=%%a
)

:: Install package if VS Code CLI is available
where code >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  if defined VSIX_FILE (
    echo 🔌 Installing extension to VS Code: %VSIX_FILE%
    call code --install-extension "%VSIX_FILE%"
    echo ✅ Installation complete! Restart VS Code and type 'CodeMate: Select Mode' in the command palette to start.
  ) else (
    echo ❌ VSIX file not found.
  )
) else (
  if defined VSIX_FILE (
    echo ⚠️ VS Code CLI not found. Please install this VSIX package manually: %VSIX_FILE%
    echo 📝 To install, use the 'Install from VSIX...' option in the Extensions panel (...) menu in VS Code.
  ) else (
    echo ❌ VSIX file not found.
  )
)

echo.
echo Press any key to exit...
pause >nul 