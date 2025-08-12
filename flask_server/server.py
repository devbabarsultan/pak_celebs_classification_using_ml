from flask import Flask, request, jsonify, render_template
from utils import classify_b64_image
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/classify_image', methods=['POST'])
def classify_image():
    try:

        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        result = classify_b64_image(data['image'])
        
        return jsonify({
            "status": "success",
            "result": result
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=8080, debug=True)