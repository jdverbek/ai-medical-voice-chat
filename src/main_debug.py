import os
import sys
import traceback
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Enable CORS for all routes
CORS(app)

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Simple test endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'API is working',
        'python_version': sys.version,
        'flask_working': True
    }), 200

@app.route('/api/whisper/test', methods=['GET'])
def whisper_test():
    """Test Whisper-specific endpoint"""
    try:
        # Test environment variables
        openai_key = os.getenv('OPENAI_API_KEY')
        has_key = bool(openai_key and openai_key != 'your_openai_api_key_here')
        
        # Test OpenAI import
        try:
            import openai
            openai_import = True
            openai_version = getattr(openai, '__version__', 'unknown')
        except ImportError as e:
            openai_import = False
            openai_version = f"Import error: {str(e)}"
        
        return jsonify({
            'status': 'success',
            'message': 'Whisper test endpoint working',
            'openai_key_configured': has_key,
            'openai_import_success': openai_import,
            'openai_version': openai_version,
            'environment_vars': {
                'PORT': os.getenv('PORT'),
                'FLASK_ENV': os.getenv('FLASK_ENV'),
                'CORS_ORIGINS': os.getenv('CORS_ORIGINS')
            }
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error in whisper test: {str(e)}',
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/whisper/health', methods=['GET'])
def whisper_health():
    """Health check for Whisper service"""
    try:
        openai_api_key = os.getenv('OPENAI_API_KEY')
        api_key_configured = bool(openai_api_key and openai_api_key != 'your_openai_api_key_here')
        
        openai_available = False
        openai_error = None
        try:
            from openai import OpenAI
            # Try to create client
            client = OpenAI(api_key=openai_api_key if api_key_configured else "test")
            openai_available = True
        except Exception as e:
            openai_available = False
            openai_error = str(e)
        
        return jsonify({
            'status': 'healthy',
            'service': 'whisper-api',
            'api_key_configured': api_key_configured,
            'openai_available': openai_available,
            'openai_error': openai_error,
            'mode': 'production' if (api_key_configured and openai_available) else 'demo'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'service': 'whisper-api',
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/health')
def health_check():
    return {'status': 'healthy', 'service': 'medical-voice-chat-backend'}, 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

