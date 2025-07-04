import os
import tempfile
import logging
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import openai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

whisper_bp = Blueprint('whisper', __name__)

# Configure OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')

ALLOWED_EXTENSIONS = {'wav', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'webm'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@whisper_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """
    Transcribe audio using OpenAI Whisper API
    Expects multipart/form-data with audio file
    """
    try:
        # Check if API key is configured
        if not openai.api_key or openai.api_key == 'your_openai_api_key_here':
            logger.error("OpenAI API key not configured")
            return jsonify({
                'error': 'OpenAI API key not configured',
                'transcript': '',
                'confidence': 0.0
            }), 500

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

        # Create a temporary file to save the uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name

        try:
            # Call OpenAI Whisper API
            with open(temp_file_path, 'rb') as audio_file:
                transcript_response = openai.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language,
                    prompt=prompt,
                    response_format="verbose_json"
                )

            # Extract transcript and confidence
            transcript = transcript_response.text.strip()
            
            # Whisper doesn't provide confidence scores in the API response
            # We'll estimate based on transcript length and content
            confidence = estimate_confidence(transcript)

            logger.info(f"Transcription successful: '{transcript}' (confidence: {confidence})")

            return jsonify({
                'transcript': transcript,
                'confidence': confidence,
                'language': language,
                'duration': getattr(transcript_response, 'duration', None)
            }), 200

        except openai.OpenAIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return jsonify({
                'error': f'OpenAI API error: {str(e)}',
                'transcript': '',
                'confidence': 0.0
            }), 500

        except Exception as e:
            logger.error(f"Error processing audio: {str(e)}")
            return jsonify({
                'error': f'Error processing audio: {str(e)}',
                'transcript': '',
                'confidence': 0.0
            }), 500

        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except OSError:
                pass

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            'error': f'Unexpected error: {str(e)}',
            'transcript': '',
            'confidence': 0.0
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

@whisper_bp.route('/health', methods=['GET'])
def whisper_health():
    """Health check for Whisper service"""
    api_key_configured = bool(openai.api_key and openai.api_key != 'your_openai_api_key_here')
    
    return jsonify({
        'status': 'healthy',
        'service': 'whisper-api',
        'api_key_configured': api_key_configured,
        'supported_formats': list(ALLOWED_EXTENSIONS)
    }), 200

