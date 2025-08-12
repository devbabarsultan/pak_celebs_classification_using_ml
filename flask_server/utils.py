import cv2
import numpy as np
import joblib
from wavelet import wavelet_transform
import json
import base64

global model
model = joblib.load('./artifects/celebrity_recognition_model.pkl')

global class_dict
with open('./artifects/class_dict.json', 'r') as f:
    class_dict = json.load(f)

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade  = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

def get_cropped_image_if_2_eyes(img):
    # img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    for (x,y,w,h) in faces:
        roi_gray = gray[y:y+h, x:x+w]
        image = img[y:y+h, x:x+w]
        eyes = eye_cascade.detectMultiScale(roi_gray)
        if len(eyes) >= 2:
            return image

def classify_image(image):
    scalled_raw_img = cv2.resize(image, (32, 32))
    img_har = wavelet_transform(image,'db1',5)
    scalled_img_har = cv2.resize(img_har, (32, 32))
    combined_img = np.vstack((scalled_raw_img.reshape(32*32*3,1),scalled_img_har.reshape(32*32,1)))
    
    val = model.predict(combined_img.reshape(1,-1))
    for key, value in class_dict.items():
        if val == value:
            return key
        
# print(class_dict.items())

# def classify_image_from_path(image_path):
#     image = get_cropped_image_if_2_eyes(image_path)
#     if image is None:
#         return "No face detected or not enough eyes"
    
#     return classify_image(image)

def classify_b64_image(img_b64_str):
    img_data = base64.b64decode(img_b64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    image = get_cropped_image_if_2_eyes(img)
    if image is None:
        return "No face detected or not enough eyes"
    
    return classify_image(image)
def read_b64(path):
    with open(path,'r') as file:
        cont = file.read()
    return cont

if __name__ == "__main__":
    # image_path = input("Enter the path to the image: ")
    # # result = classify_image_from_path(image_path)
    img = input('str_img')
    abc = read_b64(img)
    result = classify_b64_image(abc)
    print(f"Classified as: {result}")