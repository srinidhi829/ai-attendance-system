import os
import face_recognition
import numpy as np
import faiss
import pickle
from PIL import Image

dataset_path = 'Atendence_test_dataset'
embeddings = []
names = []

def resize_image(image, max_width=1000):
    if image.shape[1] > max_width:
        pil_img = Image.fromarray(image)
        w, h = pil_img.size
        new_w = max_width
        new_h = int(h * (new_w / w))
        pil_img = pil_img.resize((new_w, new_h))
        return np.array(pil_img)
    return image

for person_name in os.listdir(dataset_path):
    person_folder = os.path.join(dataset_path, person_name)
    if not os.path.isdir(person_folder):
        continue
    
    person_embeddings = []
    for img_name in os.listdir(person_folder):
        img_path = os.path.join(person_folder, img_name)
        if not img_name.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue

        image = face_recognition.load_image_file(img_path)
        image = resize_image(image)

        face_locations = face_recognition.face_locations(image, model='hog')
        if len(face_locations) == 0:
            print(f"No face found in {img_path}")
            continue

        encodings = face_recognition.face_encodings(image, face_locations)
        person_embeddings.extend(encodings)

    if person_embeddings:
        avg_embedding = np.mean(person_embeddings, axis=0)
        embeddings.append(avg_embedding)
        names.append(person_name)
        print(f"Processed {person_name}")

embeddings = np.array(embeddings).astype('float32')
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

faiss.write_index(index, 'faces.index')

with open('names.pkl', 'wb') as f:
    pickle.dump(names, f)

print("Enrollment complete:", names)
