import base64
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

MODEL_PATH = "models/face_landmarker.task"
NOSE_TIP_INDEX = 1

SMILE_SHAPES = ("mouthSmileLeft", "mouthSmileRight")
TENSION_SHAPES = (
    "browDownLeft", "browDownRight",
    "mouthPressLeft", "mouthPressRight",
    "mouthFrownLeft", "mouthFrownRight",
)

base_options = mp_python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.IMAGE,
    num_faces=1,
    output_face_blendshapes=True,
)
landmarker = vision.FaceLandmarker.create_from_options(options)


def decode_base64_image(base64_string: str) -> np.ndarray:
    """Turn a 'data:image/jpeg;base64,...' string into an OpenCV (BGR) image array."""
    if "," in base64_string:
        base64_string = base64_string.split(",", 1)[1]
    image_bytes = base64.b64decode(base64_string)
    np_array = np.frombuffer(image_bytes, dtype=np.uint8)
    return cv2.imdecode(np_array, cv2.IMREAD_COLOR)


def _mean(values):
    return sum(values) / len(values) if values else 0.0


def extract_expression(result):
    """Average a few blendshape scores (each 0..1) into two simple expression signals."""
    blendshapes = getattr(result, "face_blendshapes", None)
    if not blendshapes:
        return None
    scores = {c.category_name: c.score for c in blendshapes[0]}
    smile = _mean([scores.get(name, 0.0) for name in SMILE_SHAPES])
    tension = _mean([scores.get(name, 0.0) for name in TENSION_SHAPES])
    return {"smile": round(float(smile), 4), "tension": round(float(tension), 4)}


NO_FACE = {
    "faceDetected": False,
    "noseX": None,
    "noseY": None,
    "horizontalOffsetRatio": None,
    "expression": None,
}


def analyze_frame(base64_string: str) -> dict:
    bgr_image = decode_base64_image(base64_string)
    if bgr_image is None:
        return dict(NO_FACE)

    rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)

    result = landmarker.detect(mp_image)

    if not result.face_landmarks:
        return dict(NO_FACE)

    landmarks = result.face_landmarks[0]
    nose = landmarks[NOSE_TIP_INDEX]

    all_x = [point.x for point in landmarks]
    box_min_x, box_max_x = min(all_x), max(all_x)
    box_width = box_max_x - box_min_x
    horizontal_offset_ratio = (nose.x - box_min_x) / box_width if box_width > 0 else 0.5

    return {
        "faceDetected": True,
        "noseX": round(nose.x, 4),
        "noseY": round(nose.y, 4),
        "horizontalOffsetRatio": round(horizontal_offset_ratio, 4),
        "expression": extract_expression(result),
    }