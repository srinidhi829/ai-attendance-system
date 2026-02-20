from flask import Flask, request, jsonify
import face_recognition
import numpy as np
import faiss
import pickle
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ExifTags
import base64
import io

app = Flask(__name__)

# ---------------- LOAD SAVED DATA ----------------
index = faiss.read_index("faces.index")

with open("names.pkl", "rb") as f:
    names = pickle.load(f)


# -------- Helper: Extract Date from Image --------
def get_image_datetime(image):
    try:
        exif_data = image._getexif()
        if not exif_data:
            return None

        date_tags = ["DateTimeOriginal", "DateTime", "DateTimeDigitized"]

        for tag, value in exif_data.items():
            tag_name = ExifTags.TAGS.get(tag, tag)

            if tag_name in date_tags:
                try:
                    return datetime.strptime(value, "%Y:%m:%d %H:%M:%S")
                except:
                    continue

        return None
    except:
        return None


# ---------------- ATTENDANCE API ----------------
@app.route("/process-attendance", methods=["POST"])
def process_attendance():

    if "group_image" not in request.files:
        return jsonify({"error": "No group image uploaded"}), 400

    expected_date = request.form.get("date")

    group_image_file = request.files["group_image"]
    pil_original = Image.open(group_image_file)

    # -------- Date Validation (Optional if EXIF exists) --------
    photo_datetime = get_image_datetime(pil_original)

    if photo_datetime is not None:
        photo_date = photo_datetime.strftime("%Y-%m-%d")

        if photo_date != expected_date:
            return jsonify({
                "error": f"Date mismatch. Photo date: {photo_date}"
            }), 400
    # If no EXIF → skip validation

    # -------- Face Detection --------
    group_image = np.array(pil_original)

    face_locations = face_recognition.face_locations(group_image)
    face_encodings = face_recognition.face_encodings(group_image, face_locations)

    draw = ImageDraw.Draw(pil_original)

    try:
        font = ImageFont.truetype("arial.ttf", 18)
    except:
        font = ImageFont.load_default()

    face_assignments = []

    for face_encoding in face_encodings:
        face_encoding_np = np.array([face_encoding]).astype("float32")
        D, I = index.search(face_encoding_np, k=len(names))
        face_assignments.append(list(zip(I[0], D[0])))

    assigned_names = {}
    final_labels = []
    threshold = 0.6

    # -------- Duplicate Handling --------
    for i, distances in enumerate(face_assignments):
        for idx, dist in distances:
            candidate_name = names[idx]

            if dist < threshold:

                if candidate_name not in assigned_names:
                    assigned_names[candidate_name] = i
                    final_labels.append(candidate_name)
                    break

                else:
                    prev_i = assigned_names[candidate_name]
                    prev_dist = face_assignments[prev_i][0][1]

                    if dist < prev_dist:
                        final_labels[prev_i] = "Unknown"
                        assigned_names[candidate_name] = i
                        final_labels.append(candidate_name)
                        break
        else:
            final_labels.append("Unknown")

    attendance = set(label for label in final_labels if label != "Unknown")
    absent_students = [student for student in names if student not in attendance]

    # -------- Draw Boxes --------
    for face_location, label in zip(face_locations, final_labels):
        top, right, bottom, left = face_location

        draw.rectangle(
            ((left, top), (right, bottom)),
            outline=(0, 255, 0),
            width=2
        )

        draw.rectangle(
            ((left, bottom - 20), (right, bottom)),
            fill=(0, 255, 0)
        )

        draw.text(
            (left + 2, bottom - 18),
            label,
            fill=(0, 0, 0),
            font=font
        )

    # -------- Convert Image to Base64 --------
    buffered = io.BytesIO()
    pil_original.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()

    return jsonify({
        "presentStudents": list(attendance),
        "absentStudents": absent_students,
        "totalFaces": len(face_locations),
        "recognizedFaces": len(attendance),
        "processedImage": img_str
    })


if __name__ == "__main__":
    app.run(port=5001, debug=True)
