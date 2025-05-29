#!/bin/bash

echo "🚀 CodeMate VS Code Eklentisi Otomatik Kurulumu"
echo "==============================================="

# Gerekli komutların kontrolü
check_command() {
  command -v $1 >/dev/null 2>&1 || { echo "❌ $1 bulunamadı. Lütfen $1 yükleyin."; exit 1; }
}

check_command git
check_command npm
check_command node

# GitHub repo bilgileri
REPO_URL="https://github.com/aliv029bmj/codemate.git"
REPO_NAME="codemate"

# Geçici dizin yerine kullanıcının home dizininde bir klasör oluşturalım
INSTALL_DIR="$HOME/.codemate-install"
mkdir -p $INSTALL_DIR

echo "📥 GitHub'dan en güncel kod indiriliyor..."
if [ -d "$INSTALL_DIR/$REPO_NAME" ]; then
  echo "ℹ️ Var olan repo güncelleniyor..."
  cd "$INSTALL_DIR/$REPO_NAME"
  git pull
else
  echo "ℹ️ Repo klonlanıyor..."
  git clone $REPO_URL "$INSTALL_DIR/$REPO_NAME"
  cd "$INSTALL_DIR/$REPO_NAME"
fi

echo "📦 Bağımlılıklar yükleniyor..."
npm install

echo "🔨 Kod derleniyor..."
npm run compile

# vsce kontrolü ve kurulumu
if ! command -v vsce >/dev/null 2>&1; then
  echo "📥 vsce kurulmamış, yükleniyor..."
  npm install -g @vscode/vsce
fi

echo "📦 VSIX paketi oluşturuluyor..."
vsce package

# VS Code'un varlığını kontrol et
if command -v code >/dev/null 2>&1; then
  VSIX_FILE=$(ls codemate-*.vsix | sort -V | tail -n1)
  if [ -n "$VSIX_FILE" ]; then
    echo "🔌 Eklenti VS Code'a yükleniyor: $VSIX_FILE"
    code --install-extension "$VSIX_FILE"
    echo "✅ Kurulum tamamlandı! VS Code'u yeniden başlatın ve komut paletinde 'CodeMate: Select Mode' yazarak başlayın."
    
    # Temizlik
    echo "🧹 Geçici dosyalar temizleniyor..."
    VSIX_PATH="$INSTALL_DIR/$REPO_NAME/$VSIX_FILE"
    cp "$VSIX_FILE" "$HOME/$VSIX_FILE"
    echo "📋 VSIX dosyası home dizininize kopyalandı: $HOME/$VSIX_FILE"
  else
    echo "❌ VSIX dosyası oluşturulamadı."
  fi
else
  VSIX_FILE=$(ls codemate-*.vsix | sort -V | tail -n1)
  if [ -n "$VSIX_FILE" ]; then
    echo "⚠️ VS Code CLI bulunamadı. VSIX paketini manuel yüklemeniz gerekecek."
    cp "$VSIX_FILE" "$HOME/$VSIX_FILE"
    echo "📋 VSIX dosyası home dizininize kopyalandı: $HOME/$VSIX_FILE"
    echo "📝 Kurulum için VS Code'da Extensions panelinde (...) menüsünden 'Install from VSIX...' seçeneğini kullanın."
  else
    echo "❌ VSIX dosyası oluşturulamadı."
  fi
fi

echo "
✨ CodeMate kurulum bilgileri:
--------------------------
🔹 Repo: $REPO_URL
🔹 Kurulum klasörü: $INSTALL_DIR/$REPO_NAME
🔹 VSIX dosyası: $HOME/$VSIX_FILE
🔹 Komut Paleti: 'CodeMate: Select Mode'
" 