#!/bin/bash

# CodeMate kurulum scripti
echo "🚀 CodeMate Kurulum Başlıyor..."

# Gerekli komutlar mevcut mu kontrol et
command -v npm >/dev/null 2>&1 || { echo "❌ npm bulunamadı. Lütfen Node.js kurun."; exit 1; }
command -v code >/dev/null 2>&1 || { echo "⚠️ VS Code CLI bulunamadı. Paket otomatik yüklenemeyecek."; }

# Bağımlılıkları kur
echo "📦 Bağımlılıklar kuruluyor..."
npm install

# Derle
echo "🔨 Kod derleniyor..."
npm run compile

# vsce kuruluyor mu kontrol et
if ! command -v vsce >/dev/null 2>&1; then
  echo "📥 vsce kurulmamış, yükleniyor..."
  npm install -g @vscode/vsce
fi

# VSIX paketini oluştur
echo "📦 VSIX paketi oluşturuluyor..."
vsce package

# VS Code CLI mevcutsa paketi kur
if command -v code >/dev/null 2>&1; then
  VSIX_FILE=$(ls codemate-*.vsix | sort -V | tail -n1)
  if [ -n "$VSIX_FILE" ]; then
    echo "🔌 Eklenti VS Code'a yükleniyor: $VSIX_FILE"
    code --install-extension "$VSIX_FILE"
    echo "✅ Kurulum tamamlandı! VS Code'u yeniden başlatın ve komut paletinde 'CodeMate: Select Mode' yazarak başlayın."
  else
    echo "❌ VSIX dosyası bulunamadı."
  fi
else
  VSIX_FILE=$(ls codemate-*.vsix | sort -V | tail -n1)
  echo "⚠️ VS Code CLI bulunamadı. Lütfen bu VSIX paketini manuel olarak yükleyin: $VSIX_FILE"
  echo "📝 Kurulum için VS Code'da Extensions panelinde (...) menüsünden 'Install from VSIX...' seçeneğini kullanın."
fi 