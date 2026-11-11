# Kitaplığım — mobil altyapı (deneysel)

Bu dal, mevcut web uygulamasını değiştirmeden Capacitor iOS/Android proje iskeletini ekler. **Canlı sürüme aktarılmamalıdır; mobil cihaz testleri bekleniyor.**

## Yerel kurulum

1. Node.js kurulu bilgisayarda `npm install`.
2. `npm run mobile:prepare` ile kökteki mevcut `index.html` dosyasını `www/index.html` içine kopyala.
3. Android için Android Studio ve SDK kuruluysa `npm run mobile:add:android` ardından `npm run mobile:open:android`.
4. iOS için macOS, Xcode ve Apple araçları gerekir: `npm run mobile:add:ios`, `npm run mobile:open:ios`.
5. Web kodu değiştiğinde `npm run mobile:sync`.

## Yayın öncesi engeller

- Mevcut kitaplık verileri tarayıcı `localStorage` alanındadır; mobil WebView ayrı depolama kullanır. **Mevcut kullanıcı kitaplığı kendiliğinden aktarılmaz.** JSON yedek içe aktarma veya hesap eşitleme akışı test edilmeden kullanıcıya geçiş yaptırma.
- OCR gibi `/api/...` yolları web sunucusuna bağlıdır; paketlenmiş uygulamada doğrudan çalıştıkları varsayılamaz. Güvenli API adresi ve izinler ayrıca yapılandırılmalı.
- Kamera, fotoğraf seçme, dosya indirme, PDF paylaşma, geri tuşu, klavye, çevrimdışı çalışma, erişilebilirlik, Android ve iOS gerçek cihaz testleri yapılmalı.
- E-posta ile hesap oluşturma, misafirden üyeye veri aktarımı ve bulut senkronizasyonu henüz uygulanmadı.
- App ID `app.kitapligim.mobile` geçicidir; mağaza yayını öncesinde kesinleştirilmeli.
- `www/`, `android/`, `ios/` çıktıları yerelde oluşturulur; bu dalda kaynak kodu değiştirilmez.
