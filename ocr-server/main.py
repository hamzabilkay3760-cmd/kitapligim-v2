import os
from functools import lru_cache
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image, ImageOps
import io

app = FastAPI(title="Kitaplığım OCR Test", docs_url=None, redoc_url=None)
MAX_BYTES = 8 * 1024 * 1024

@lru_cache(maxsize=1)
def model():
    from paddleocr import PaddleOCR
    return PaddleOCR(
        text_detection_model_name="PP-OCRv6_medium_det",
        text_recognition_model_name="PP-OCRv6_medium_rec",
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        engine="onnxruntime",
    )

@app.get("/health")
def health():
    return {"status": "ok", "model": "PP-OCRv6_medium", "loaded": model.cache_info().currsize > 0}

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(415, "Yalnızca JPEG, PNG veya WebP")
    raw = await file.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise HTTPException(413, "Dosya 8 MB sınırını aşıyor")
    try:
        image = ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert("RGB")
        if image.width * image.height > 20_000_000:
            raise HTTPException(413, "Görsel çok büyük")
        import numpy as np
        result = model().predict(np.asarray(image))
        lines = []
        for page in result:
            data = page.json
            if isinstance(data, dict) and "res" in data:
                data = data["res"]
            for text, score in zip(data.get("rec_texts", []), data.get("rec_scores", [])):
                lines.append({"text": str(text), "confidence": float(score)})
        return JSONResponse({"text": "\n".join(x["text"] for x in lines), "lines": lines, "line_count": len(lines)})
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(500, "OCR işlemi başarısız; sunucu günlüklerini kontrol edin")
