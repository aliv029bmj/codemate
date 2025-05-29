# CodeMate Kurulum Talimatları

CodeMate'i VS Code'a kurmanın birkaç farklı yolu vardır. Aşağıdaki yöntemlerden size en uygun olanı seçebilirsiniz.

## Otomatik Kurulum (Önerilen)

### Windows için:
1. `install.bat` dosyasını çift tıklayarak çalıştırın
2. Kurulum tamamlandığında VS Code'u yeniden başlatın
3. Komut paletini açın (F1 veya Ctrl+Shift+P) ve "CodeMate: Select Mode" yazın

### Linux/macOS için:
1. Terminal açın ve aşağıdaki komutu çalıştırın:
   ```
   ./install.sh
   ```
2. Kurulum tamamlandığında VS Code'u yeniden başlatın
3. Komut paletini açın (F1 veya Cmd+Shift+P) ve "CodeMate: Select Mode" yazın

## Manuel Kurulum

### VSIX Paketi ile Kurulum
1. Proje klasöründeki `.vsix` dosyasını bulun (veya oluşturun: `vsce package`)
2. VS Code'u açın
3. Extensions panelini açın (Ctrl+Shift+X veya Cmd+Shift+X)
4. "..." (More Actions) menüsüne tıklayın
5. "Install from VSIX..." seçeneğini seçin
6. CodeMate VSIX dosyasını seçin
7. VS Code'u yeniden başlatın

### Kaynaktan Derleme ve Çalıştırma
1. Proje klasöründe aşağıdaki komutları çalıştırın:
   ```
   npm install
   npm run compile
   ```
2. F5 tuşuna basın veya Debug panelinden "Eklentiyi Başlat" seçeneğini çalıştırın
3. Açılan yeni VS Code penceresinde, Komut Paletini açın ve "CodeMate: Select Mode" yazın

## VS Code Görev Çalıştırıcı ile Kurulum
1. VS Code'da Görev Çalıştırıcı'yı açın (Ctrl+Shift+B veya Cmd+Shift+B)
2. "Komple Kurulum ve Paketleme" görevini seçin
3. Oluşturulan VSIX dosyasını VS Code'a manuel olarak yükleyin

## Kurulum Sonrası
Eklenti kurulduktan sonra:

1. VS Code'u yeniden başlatın
2. Komut Paletini açın (F1 veya Ctrl+Shift+P / Cmd+Shift+P)
3. "CodeMate: Select Mode" yazın ve Enter'a basın
4. Kullanmak istediğiniz modu seçin
5. Durum çubuğunda (status bar) CodeMate göstergesini göreceksiniz
6. Herhangi bir dosyayı düzenlerken, imleç konumunuza göre seçtiğiniz mod aktif olacaktır

## Sorun Giderme

Eğer kurulumda sorun yaşıyorsanız:

1. VS Code'u geliştirici konsolunu açın (Help > Toggle Developer Tools)
2. Extensions panelinde CodeMate'e sağ tıklayın ve "Extension Settings" seçeneğini seçin
3. Aktivasyon hataları için çıktı panelinde (Output) "CodeMate" kanalını kontrol edin

Yardım veya daha fazla bilgi için GitHub deposuna başvurun: https://github.com/aliv029bmj/codemate 