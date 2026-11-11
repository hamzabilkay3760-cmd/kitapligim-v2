# İşaretli alıntı algılama deneyi

Bu kod **canlı Kitaplığım uygulamasından tamamen ayrıdır**. PaddleOCR 2.x + OpenCV kullanarak sarı/mavi/mor işaretleri ve yatay alt çizgi adaylarını bulur, OCR satırlarıyla eşleştirir. Sonuçları otomatik kaydetmez; kullanıcı onayı zorunludur.

## Yerel çalıştırma

Python 3.10/3.11 ortamında: `pip install -r requirements.txt` ardından `uvicorn server:app --reload`. `POST /analyze` multipart `file` alanında kitap sayfası fotoğrafı kabul eder. API dokümantasyonu `/docs` adresindedir.

## Sınırlar

Bu **ilk deneydir**; gerçek kitap fotoğraflarıyla doğruluk ölçülmedi. Eşikler ve çizgi tespiti özellikle baskıdaki yatay çizgilerde yanlış pozitif üretebilir. Çok satırlı alıntılar, eğik sayfalar, kalem rengi, ışık ve Türkçe OCR için test gerekir. iPhone'da doğrudan çalışmaz; sunucuya dağıtılmadan bağlantı sunulamaz. Görselleri kalıcı depolamaz.
