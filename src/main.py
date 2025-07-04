import os
import sys
import tempfile
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app)

ALLOWED_EXTENSIONS = {'wav', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'webm'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/whisper/health', methods=['GET'])
def whisper_health():
    """Health check for Whisper service"""
    try:
        openai_api_key = os.getenv('OPENAI_API_KEY')
        api_key_configured = bool(openai_api_key and openai_api_key != 'your_openai_api_key_here')
        
        openai_available = False
        openai_version = None
        try:
            import openai
            openai_available = True
            openai_version = getattr(openai, '__version__', 'unknown')
        except ImportError:
            openai_available = False
            openai_version = 'not installed'
        
        return jsonify({
            'status': 'healthy',
            'service': 'whisper-api',
            'api_key_configured': api_key_configured,
            'openai_available': openai_available,
            'openai_version': openai_version,
            'supported_formats': list(ALLOWED_EXTENSIONS),
            'mode': 'production' if (api_key_configured and openai_available) else 'demo'
        }), 200
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return jsonify({
            'status': 'error',
            'service': 'whisper-api',
            'error': str(e)
        }), 500

@app.route('/api/whisper/transcribe', methods=['POST'])
def transcribe_audio():
    """
    Transcribe audio using OpenAI Whisper API
    Expects multipart/form-data with audio file
    """
    try:
        # Check if API key is configured
        openai_api_key = os.getenv('OPENAI_API_KEY')
        if not openai_api_key or openai_api_key == 'your_openai_api_key_here':
            logger.warning("OpenAI API key not configured, using demo mode")
            
            # Demo mode - return simulated transcription
            demo_responses = [
                "Ik heb hoofdpijn",
                "Mijn keel doet pijn", 
                "Ik voel me niet goed",
                "Ik heb pijn op mijn borst",
                "Ik ben moe",
                "Ik heb buikpijn",
                "Ik kan niet slapen",
                "Ik heb koorts"
            ]
            
            import random
            transcript = random.choice(demo_responses)
            
            return jsonify({
                'transcript': transcript,
                'confidence': 0.85,
                'language': 'nl',
                'mode': 'demo'
            }), 200

        # Check if file is present
        if 'audio' not in request.files:
            logger.error("No audio file provided")
            return jsonify({
                'error': 'No audio file provided',
                'transcript': '',
                'confidence': 0.0
            }), 400

        file = request.files['audio']
        
        # Check if file is selected
        if file.filename == '':
            logger.error("No file selected")
            return jsonify({
                'error': 'No file selected',
                'transcript': '',
                'confidence': 0.0
            }), 400

        # Check file type
        if not allowed_file(file.filename):
            logger.error(f"File type not allowed: {file.filename}")
            return jsonify({
                'error': f'File type not allowed. Supported: {", ".join(ALLOWED_EXTENSIONS)}',
                'transcript': '',
                'confidence': 0.0
            }), 400

        # Get language parameter (default to Dutch)
        language = request.form.get('language', 'nl')
        
        # Get prompt for better context (optional)
        prompt = request.form.get('prompt', 'Dit is een medisch gesprek in het Nederlands.')

        logger.info(f"Processing audio file: {file.filename}, language: {language}")

        # For production deployment with OpenAI Whisper API
        try:
            # Import OpenAI here to handle import errors gracefully
            from openai import OpenAI
            
            # Initialize OpenAI client with API key
            client = OpenAI(api_key=openai_api_key)
            
            # Create a temporary file to save the uploaded audio
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
                file.save(temp_file.name)
                temp_file_path = temp_file.name

            try:
                # Call OpenAI Whisper API
                with open(temp_file_path, 'rb') as audio_file:
                    logger.info(f"Calling Whisper API with file: {temp_file_path}")
                    transcript_response = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        language=language,
                        prompt=prompt
                    )

                # Extract transcript from response
                transcript = transcript_response.text
                
                # Log the full response for debugging
                logger.info(f"Whisper API response: {transcript_response}")
                
                # Whisper doesn't provide confidence scores in the API response
                # We'll estimate based on transcript length and content
                confidence = estimate_confidence(transcript)

                logger.info(f"Transcription successful: '{transcript}' (confidence: {confidence})")

                return jsonify({
                    'transcript': transcript,
                    'confidence': confidence,
                    'language': language,
                    'mode': 'production'
                }), 200

            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_file_path)
                except OSError as e:
                    logger.error(f"Error removing temporary file: {e}")
                    pass

        except ImportError as e:
            logger.warning(f"OpenAI package not available: {e}, using demo mode")
            # Fallback to demo mode
            demo_responses = [
                "Ik heb hoofdpijn",
                "Mijn keel doet pijn", 
                "Ik voel me niet goed",
                "Ik heb pijn op mijn borst",
                "Ik ben moe"
            ]
            
            import random
            transcript = random.choice(demo_responses)
            
            return jsonify({
                'transcript': transcript,
                'confidence': 0.85,
                'language': language,
                'mode': 'demo (ImportError)'
            }), 200

        except Exception as e:
            logger.error(f"Error processing audio with Whisper API: {str(e)}")
            return jsonify({
                'error': f'Error processing audio: {str(e)}',
                'transcript': '',
                'confidence': 0.0,
                'mode': 'error'
            }), 500

    except Exception as e:
        logger.error(f"Unexpected error in transcribe_audio: {str(e)}")
        return jsonify({
            'error': f'Unexpected error: {str(e)}',
            'transcript': '',
            'confidence': 0.0,
            'mode': 'error'
        }), 500

def estimate_confidence(transcript):
    """
    Estimate confidence based on transcript characteristics
    This is a simple heuristic since Whisper API doesn't provide confidence scores
    """
    if not transcript:
        return 0.0
    
    # Base confidence
    confidence = 0.7
    
    # Adjust based on length
    if len(transcript) < 5:
        confidence -= 0.3
    elif len(transcript) > 20:
        confidence += 0.2
    
    # Adjust based on content quality
    if any(char in transcript for char in ['[', ']', '(', ')', '...']):
        confidence -= 0.2
    
    # Check for common Dutch medical terms
    dutch_medical_terms = [
        'pijn', 'hoofdpijn', 'buikpijn', 'koorts', 'hoest', 'verkoudheid',
        'griep', 'misselijk', 'duizelig', 'moe', 'slapen', 'eten',
        'medicijn', 'dokter', 'ziekenhuis', 'klacht', 'symptoom'
    ]
    
    if any(term in transcript.lower() for term in dutch_medical_terms):
        confidence += 0.1
    
    # Ensure confidence is between 0 and 1
    return max(0.0, min(1.0, confidence))

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'medical-voice-chat-backend'}), 200

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
