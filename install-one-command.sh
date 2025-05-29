#!/bin/bash

# Code566 - Tek Komutla Kurulum Betiği
echo "=========================================="
echo "   Code566 VS Code Eklenti Kurulumu       "
echo "=========================================="
echo ""

# Geçici dizin oluştur
TEMP_DIR=$(mktemp -d)
echo "Geçici dizin oluşturuldu: $TEMP_DIR"

# En son VSIX dosyasını indirmeye çalış
echo "Code566 VSIX paketini indiriyorum..."

if command -v curl >/dev/null 2>&1; then
  # curl kullanarak indir
  curl -L "https://github.com/aliv029bmj/codemate/releases/latest/download/code566.vsix" -o "$TEMP_DIR/code566.vsix"
elif command -v wget >/dev/null 2>&1; then
  # wget kullanarak indir
  wget "https://github.com/aliv029bmj/codemate/releases/latest/download/code566.vsix" -O "$TEMP_DIR/code566.vsix"
else
  echo "Hata: curl veya wget yüklü değil. Lütfen bu araçlardan birini yükleyin ve tekrar deneyin."
  exit 1
fi

# İndirme başarılı mı kontrol et
if [ ! -f "$TEMP_DIR/code566.vsix" ]; then
  echo "Hata: VSIX paketi indirilemedi."
  
  # Yerel VSIX dosyasını kontrol et
  LOCAL_VSIX=$(find . -maxdepth 1 -name "code566-*.vsix" | sort -V | tail -n1)
  
  if [ -n "$LOCAL_VSIX" ]; then
    echo "Yerel VSIX paketi bulundu: $LOCAL_VSIX"
    echo "Bu paketi kullanmaya devam ediyorum..."
    VSIX_PATH="$LOCAL_VSIX"
  else
    echo "Kurulum başarısız oldu."
    exit 1
  fi
else
  VSIX_PATH="$TEMP_DIR/code566.vsix"
  echo "VSIX paketi başarıyla indirildi: $VSIX_PATH"
fi

# VS Code komut satırı aracının mevcut olup olmadığını kontrol et
if command -v code >/dev/null 2>&1; then
  echo "VS Code kurulumu ekleniyor..."
  code --install-extension "$VSIX_PATH"
  
  if [ $? -eq 0 ]; then
    echo "Kurulum başarılı!"
    echo "VS Code'u yeniden başlatın ve Komut Paleti'nden (Ctrl+Shift+P) 'Code566: Select Mode' komutunu çalıştırın."
  else
    echo "Kurulum sırasında hata oluştu."
    echo "Lütfen VSIX dosyasını manuel olarak şuradan yükleyin: $VSIX_PATH"
  fi
else
  echo "VS Code komut satırı aracı bulunamadı."
  echo "Lütfen VSIX dosyasını VS Code içinden Extensions panelindeki '...' menüsünden 'Install from VSIX...' seçeneğini kullanarak yükleyin."
  echo "VSIX dosyası: $VSIX_PATH"
fi

# Temizlik işlemi
if [ "$TEMP_DIR" != "" ] && [ -d "$TEMP_DIR" ]; then
  echo "Geçici dosyalar temizleniyor..."
  rm -rf "$TEMP_DIR"
fi

echo ""
echo "Code566 kurulumu tamamlandı!"
echo ""
echo "Kullanmaya başlamak için:"
echo "1. VS Code'u açın (veya yeniden başlatın)"
echo "2. Komut Paleti'ni açın (Ctrl+Shift+P veya F1)"
echo "3. 'Code566: Select Mode' yazın ve Enter'a basın"
echo "4. Listeden istediğiniz modu seçin"
echo ""
echo "İyi kodlamalar!" 