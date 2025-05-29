@echo off
echo 🚀 CodeMate Kurulum Başlıyor...

:: npm var mı kontrol et
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ❌ npm bulunamadı. Lütfen Node.js kurun.
  exit /b 1
)

:: VS Code CLI var mı kontrol et
where code >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ⚠️ VS Code CLI bulunamadı. Paket otomatik yüklenemeyecek.
)

:: Bağımlılıkları kur
echo 📦 Bağımlılıklar kuruluyor...
call npm install

:: Derle
echo 🔨 Kod derleniyor...
call npm run compile

:: vsce var mı kontrol et
where vsce >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo 📥 vsce kurulmamış, yükleniyor...
  call npm install -g @vscode/vsce
)

:: VSIX paketini oluştur
echo 📦 VSIX paketi oluşturuluyor...
call vsce package

:: En son VSIX dosyasını bul
for /f "tokens=*" %%a in ('dir /b codemate-*.vsix 2^>nul') do (
  set VSIX_FILE=%%a
)

:: VS Code CLI mevcutsa paketi kur
where code >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  if defined VSIX_FILE (
    echo 🔌 Eklenti VS Code'a yükleniyor: %VSIX_FILE%
    call code --install-extension "%VSIX_FILE%"
    echo ✅ Kurulum tamamlandı! VS Code'u yeniden başlatın ve komut paletinde 'CodeMate: Select Mode' yazarak başlayın.
  ) else (
    echo ❌ VSIX dosyası bulunamadı.
  )
) else (
  if defined VSIX_FILE (
    echo ⚠️ VS Code CLI bulunamadı. Lütfen bu VSIX paketini manuel olarak yükleyin: %VSIX_FILE%
    echo 📝 Kurulum için VS Code'da Extensions panelinde (...) menüsünden 'Install from VSIX...' seçeneğini kullanın.
  ) else (
    echo ❌ VSIX dosyası bulunamadı.
  )
)

echo.
echo Çıkmak için bir tuşa basın...
pause >nul 