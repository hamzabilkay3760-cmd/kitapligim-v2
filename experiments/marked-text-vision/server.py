"""Experimental highlighted/underlined text detection. Not production ready."""
import io
import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from paddleocr import PaddleOCR

app = FastAPI(title="Kitapligim Marked Text Prototype")
ocr = PaddleOCR(use_angle_cls=True, lang="tr", show_log=False)

def analyze(raw: bytes):
    image = np.asarray(Image.open(io.BytesIO(raw)).convert("RGB"))
    bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    # Bright yellow, blue and purple marker masks. These thresholds require calibration.
    ranges = [
        ((18, 45, 85), (42, 255, 255)),
        ((90, 45, 45), (135, 255, 255)),
        ((135, 35, 40), (170, 255, 255)),
    ]
    marker = np.zeros(hsv.shape[:2], dtype=np.uint8)
    for low, high in ranges:
        marker |= cv2.inRange(hsv, np.array(low), np.array(high))
    # Horizontal strokes under text, including dark pen marks.
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    dark = cv2.threshold(gray, 110, 255, cv2.THRESH_BINARY_INV)[1]
    length = max(18, image.shape[1] // 35)
    horizontal = cv2.morphologyEx(dark, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (length, 1)))
    result = ocr.ocr(image, cls=True)
    lines = []
    for page in result or []:
        for item in page or []:
            pts, (text, confidence) = item
            poly = np.array(pts, dtype=np.int32)
            x, y, w, h = cv2.boundingRect(poly)
            if w <= 0 or h <= 0: continue
            region = np.zeros(gray.shape, np.uint8)
            cv2.fillPoly(region, [poly], 255)
            colored = cv2.countNonZero(cv2.bitwise_and(marker, region))
            coverage = colored / max(1, cv2.countNonZero(region))
            # Look directly below the recognized text, not inside its glyphs.
            y0, y1 = min(gray.shape[0], y+h), min(gray.shape[0], y+h+max(3, h//3))
            underline = False
            if y1 > y0:
                strip = horizontal[y0:y1, max(0,x):min(gray.shape[1],x+w)]
                underline = bool(strip.size and cv2.countNonZero(strip) > max(8, w//5))
            lines.append({"text": text, "confidence": round(float(confidence),3),
                          "bbox": [x,y,w,h], "highlight_ratio": round(coverage,3),
                          "underline_candidate": underline,
                          "marked_candidate": coverage > .07 or underline})
    return {"candidates": [line for line in lines if line["marked_candidate"]],
            "all_lines": lines, "needs_user_confirmation": True}

@app.post("/analyze")
async def analyze_upload(file: UploadFile = File(...)):
    raw = await file.read()
    if len(raw) > 12_000_000: raise HTTPException(413, "Image too large")
    try: return analyze(raw)
    except Exception as exc: raise HTTPException(422, f"Image could not be processed: {exc}")
