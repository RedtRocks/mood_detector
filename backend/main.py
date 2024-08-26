from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import base64
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

model_path = r"D:\Projects\mood_detector\backend\facialemotionmodel.h5"
try:
    model = load_model(model_path)
    print(f"Model loaded successfully from {model_path}")
except FileNotFoundError:
    print(f"Error: Model file not found at {model_path}")
    print("Please ensure the 'facialemotionmodel.h5' file is in the same directory as this script.")
    exit(1)
except Exception as e:
    print(f"Error loading model: {str(e)}")
    exit(1)

haar_file = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(haar_file)

def extract_features(image):
    feature = np.array(image)
    feature = feature.reshape(1, 48, 48, 1)  
    return feature / 255.0

labels = {0: 'chal na chutiye gussa kise dikhara hai', 1: 'mummy kyu bnre ho', 2: 'phat gyi ?', 3: 'dekh dekh khush hoye jra hai', 4: 'chachaa thoda emotion please', 5: 'itna depression me kyu hoo', 6: 'ohooo aisaa kya dekh liya'}

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict_emotion():
    if request.method == 'OPTIONS':
        return jsonify({"message": "OK"}), 200
    
    image_data = request.json['image']
    
    image_bytes = base64.b64decode(image_data.split(',')[1])
    nparr = np.frombuffer(image_bytes, np.uint8)
    im = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    results = []
    for (p, q, r, s) in faces:
        face = gray[q:q+s, p:p+r]
        face = cv2.resize(face, (48, 48))
        img = extract_features(face)
        pred = model.predict(img)
        prediction_label = labels[pred.argmax()]
        
        results.append({
            'emotion': prediction_label,
            'position': {'x': int(p), 'y': int(q), 'width': int(r), 'height': int(s)}
        })
    
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)