# Code566 Installer Script for Windows
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Code566 VS Code Extension Installer    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command) { 
            return $true
        }
    }
    catch {
        return $false
    }
    finally {
        $ErrorActionPreference = $oldPreference
    }
}

# Check if Node.js is installed
if (-not (Test-CommandExists node)) {
    Write-Host "Error: Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/ and try again."
    exit 1
}

# Check Node.js version
try {
    $nodeVersion = (node -v).Replace('v', '')
    $nodeMajor = [int]($nodeVersion.Split('.')[0])

    if ($nodeMajor -lt 14) {
        Write-Host "Warning: Node.js version $nodeVersion detected." -ForegroundColor Yellow
        Write-Host "Code566 recommends Node.js v14 or later."
        Write-Host ""
        $response = Read-Host "Do you want to continue anyway? (y/n)"
        if ($response -ne "y") {
            Write-Host "Installation cancelled."
            exit 1
        }
    }
}
catch {
    Write-Host "Warning: Could not determine Node.js version." -ForegroundColor Yellow
    Write-Host "Continuing with installation anyway."
}

# Check if Git is installed
if (-not (Test-CommandExists git)) {
    Write-Host "Error: Git is not installed." -ForegroundColor Red
    Write-Host "Please install Git and try again."
    exit 1
}

# Check if VS Code is installed
$vscodeExists = $false
$vscodePaths = @(
    "${env:ProgramFiles}\Microsoft VS Code\bin\code.cmd",
    "${env:ProgramFiles(x86)}\Microsoft VS Code\bin\code.cmd",
    "${env:LOCALAPPDATA}\Programs\Microsoft VS Code\bin\code.cmd"
)

foreach ($path in $vscodePaths) {
    if (Test-Path $path) {
        $vscodeExists = $true
        break
    }
}

if (-not $vscodeExists -and -not (Test-CommandExists code)) {
    Write-Host "Warning: VS Code command line tools not found." -ForegroundColor Yellow
    Write-Host "Manual installation of the extension may be required."
    Write-Host ""
    $response = Read-Host "Do you want to continue anyway? (y/n)"
    if ($response -ne "y") {
        Write-Host "Installation cancelled."
        exit 1
    }
}

# Main installation process
Write-Host "Choose installation method:"
Write-Host "1) Full build from source (requires Node.js, Git)"
Write-Host "2) Install pre-built VSIX package (faster)"
$choice = Read-Host "Enter your choice (1 or 2)"

switch ($choice) {
    "1" {
        Write-Host "Building extension from source..." -ForegroundColor Cyan
        Write-Host ""

        # Ensure we're in the right directory (the repo root)
        if ((Test-Path "package.json") -and ((Get-Content "package.json" | Select-String "code566").Length -gt 0)) {
            # We're already in the repo directory
            Write-Host "Repository detected."
        }
        else {
            # Check if we're in the scripts directory
            if ((Test-Path "..\package.json") -and ((Get-Content "..\package.json" | Select-String "code566").Length -gt 0)) {
                Set-Location ..
                Write-Host "Changed to repository root directory."
            }
            else {
                # Try to clone the repo
                Write-Host "Repository not found. Cloning from GitHub..."
                git clone https://github.com/aliv029bmj/codemate.git
                Set-Location codemate
            }
        }

        # Install dependencies
        Write-Host "Installing dependencies..."
        npm install

        # Compile TypeScript
        Write-Host "Compiling TypeScript..."
        npm run compile

        # Package the extension
        Write-Host "Packaging extension..."
        npm run package
        
        # Find the generated VSIX file
        $vsixFile = Get-ChildItem -Path . -Filter "code566-*.vsix" | Sort-Object -Property Name | Select-Object -Last 1
        
        if ($null -eq $vsixFile) {
            Write-Host "Error: Could not find the generated VSIX file." -ForegroundColor Red
            Write-Host "Try running 'npm run package' manually."
            exit 1
        }
        
        # Install the extension
        if (Test-CommandExists code) {
            Write-Host "Installing extension to VS Code..."
            code --install-extension $vsixFile.FullName
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Installation successful!" -ForegroundColor Green
                Write-Host "Restart VS Code and use the Command Palette to select a Code566 mode."
            }
            else {
                Write-Host "Error during installation." -ForegroundColor Red
                Write-Host "Try manually installing the VSIX file from: $($vsixFile.FullName)"
            }
        }
        else {
            Write-Host "VS Code command line tools not available." -ForegroundColor Yellow
            Write-Host "Please manually install the VSIX file from: $($vsixFile.FullName)"
        }
    }
    
    "2" {
        Write-Host "Installing pre-built VSIX package..." -ForegroundColor Cyan
        Write-Host ""
        
        # Create a temporary directory
        $tempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()
        New-Item -ItemType Directory -Path $tempDir | Out-Null
        
        # Find latest release VSIX URL
        $vsixUrl = "https://github.com/aliv029bmj/codemate/releases/latest/download/code566.vsix"
        $vsixPath = Join-Path $tempDir "code566.vsix"
        
        # Download the VSIX file
        Write-Host "Downloading extension package..."
        try {
            Invoke-WebRequest -Uri $vsixUrl -OutFile $vsixPath
        }
        catch {
            Write-Host "Error: Failed to download the extension package." -ForegroundColor Red
            Write-Host $_.Exception.Message
            exit 1
        }
        
        # Check if download was successful
        if (-not (Test-Path $vsixPath)) {
            Write-Host "Error: Failed to download the extension package." -ForegroundColor Red
            exit 1
        }
        
        # Install the extension
        if (Test-CommandExists code) {
            Write-Host "Installing extension to VS Code..."
            code --install-extension $vsixPath
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Installation successful!" -ForegroundColor Green
                Write-Host "Restart VS Code and use the Command Palette to select a Code566 mode."
            }
            else {
                Write-Host "Error during installation." -ForegroundColor Red
                Write-Host "Try manually installing the VSIX file from: $vsixPath"
            }
        }
        else {
            Write-Host "VS Code command line tools not available." -ForegroundColor Yellow
            Write-Host "Please manually install the VSIX file from: $vsixPath"
        }
        
        # Clean up
        Remove-Item -Path $tempDir -Recurse -Force
    }
    
    default {
        Write-Host "Invalid choice. Installation cancelled." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Thank you for installing Code566!" -ForegroundColor Green
Write-Host "To start using the extension:"
Write-Host "1. Open VS Code"
Write-Host "2. Open the Command Palette (Ctrl+Shift+P or F1)"
Write-Host "3. Type 'Code566: Select Mode' and press Enter"
Write-Host "4. Choose your preferred mode from the list"
Write-Host ""
Write-Host "Enjoy coding with Code566!" -ForegroundColor Cyan 