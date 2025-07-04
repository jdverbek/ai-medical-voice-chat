import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/test')
def test():
    return jsonify({'status': 'success', 'message': 'API working'})

@app.route('/api/whisper/health')
def whisper_health():
    return jsonify({'status': 'healthy', 'service': 'whisper'})

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

@app.route('/')
def home():
    return "Flask app is running"

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

