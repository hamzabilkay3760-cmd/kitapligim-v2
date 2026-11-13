# Kitaplığım — bağımsız OCR sunucusu
Deneysel PP-OCRv6 Medium / ONNX Runtime FastAPI servisi. Ana Kitaplığım uygulamasından ayrıdır.
Cloud Run için 4 GiB RAM, 2 vCPU ve minimum instance 0 ile başlanması öngörülür.
Model ilk istekte indirilir; bu nedenle ilk isteğin süresi ve başarısı henüz doğrulanmamıştır.
API: GET /health, POST /ocr (multipart file JPEG/PNG/WebP).
**Güvenlik:** Bu haliyle internete açık dağıtmayın. Kimlik doğrulama, istek limiti ve bütçe koruması eklenmeden kullanıma alınmamalıdır.
**Durum:** Kod hazırlandı; model kurulumu, Türkçe doğruluk ve Cloud Run dağıtımı henüz test edilmedi.
