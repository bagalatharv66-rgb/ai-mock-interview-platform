import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.face_analyzer import analyze_frame

load_dotenv()

app = FastAPI()

allowed_origin = os.getenv("ALLOWED_ORIGIN", "http://localhost:5000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_methods=["*"],
    allow_headers=["*"],
)


class FrameRequest(BaseModel):
    image: str


@app.get("/health")
def health_check():
    return {
        "success": True,
        "data": {"status": "CV service is running"},
        "message": "OK",
        "error": None,
    }


@app.post("/analyze-frame")
def analyze_frame_endpoint(request: FrameRequest):
    try:
        features = analyze_frame(request.image)
        return {"success": True, "data": features, "message": "Frame analyzed", "error": None}
    except Exception as e:
        return {"success": False, "data": None, "message": f"Frame analysis failed: {str(e)}", "error": str(e)}