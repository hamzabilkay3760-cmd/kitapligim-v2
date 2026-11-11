# Kitaplığım — Mobil Alıntı Tara

Bu dal, web OCR denemelerinden bağımsız ilk gerçek mobil alıntı tarayıcı prototipini içerir.

## Akış

1. Kullanıcı **Fotoğraf Tara** ekranını açar.
2. Mobil uygulamada ek olarak **📷 Alıntı Tara** düğmesi görünür.
3. Kamera ile kitap sayfası çekilir.
4. OCR cihaz üzerinde çalışır.
5. OCR satırlarının kutuları kullanılarak sarı / mavi / mor fosfor izi olan satırlar otomatik seçilmeye çalışılır.
6. Kullanıcı seçimleri dokunarak düzeltebilir.
7. **Seçilenleri alıntıya ekle** ile metin mevcut Kitaplığım alıntı kontrol ekranına aktarılır.
8. Kitap, sayfa, etiket ve not seçildikten sonra mevcut kayıt sistemi kullanılır.

## Teknoloji

- Capacitor 7
- @capacitor/camera 7
- @pantrist/capacitor-plugin-ml-kit-text-recognition 7
- OCR cihaz üzerinde çalışır; ilk prototipte fotoğraf uzak OCR sunucusuna gönderilmez.
- Web sürümüne bu özellik eklenmez. `mobile/quote-scanner.ts` yalnızca mobil paket hazırlanırken bundle edilir.

## iOS izinleri

`ios/App/App/Info.plist` içinde en az şu açıklama bulunmalı:

```xml
<key>NSCameraUsageDescription</key>
<string>Kitap sayfalarından alıntıları taramak için kameraya erişim gerekir.</string>
```

Galeriden seçim yeniden kullanılacaksa ayrıca:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Kitap sayfası fotoğrafını seçmek için fotoğraf arşivine erişim gerekir.</string>
```

## Test kabul kriterleri

- Kamera açılıyor.
- Türkçe metin OCR sonucu okunabilir.
- Satırlar doğru sırada.
- Fiziksel fosforla işaretli satırlar mümkün olduğunca otomatik seçili geliyor.
- Kullanıcı yanlış otomatik seçimi tek dokunuşla kaldırabiliyor.
- Seçilen metin `#ocrText` alanına aktarılıyor.
- Mevcut kitap / alıntı / yedek verisi değişmiyor.
- iPhone ve Android gerçek cihaz testi ayrı ayrı yapılmadan mağaza sürümüne alınmıyor.

## Sonraki aşama

Bu fotoğraf tabanlı prototip doğrulanırsa ikinci aşama gerçek zamanlı kamera overlay'idir:
- iOS: Vision / VisionKit canlı metin taraması
- Android: CameraX + ML Kit canlı kare analizi

Bu ikinci aşama, ilk prototipin doğruluğu ve kullanıcı akışı onaylandıktan sonra yapılacak.
