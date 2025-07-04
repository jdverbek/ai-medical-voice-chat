import os
import sys
import json
import asyncio
import logging
import threading
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
import websockets
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'medical-voice-chat-secret-key-2024')

# Enable CORS for all routes
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

# Initialize SocketIO with proper configuration
socketio = SocketIO(
    app, 
    cors_allowed_origins="*",
    async_mode='threading',
    logger=True,
    engineio_logger=True
)

class OpenAIRealtimeClient:
    def __init__(self, api_key, client_sid):
        self.api_key = api_key
        self.client_sid = client_sid
        self.websocket = None
        self.connected = False
        self.conversation_history = []
        self.asked_questions = set()
        self.current_phase = 'hoofdklacht'
        self.patient_data = {}
        self.loop = None
        self.thread = None
        
        # Comprehensive cardiological question database
        self.question_phases = {
            'hoofdklacht': [
                "Wat is uw belangrijkste hartklacht op dit moment?",
                "Kunt u uw klachten in uw eigen woorden beschrijven?"
            ],
            'symptomen': [
                "Sinds wanneer heeft u deze klachten?",
                "Hoe zou u de pijn beschrijven - is het drukkend, stekend, of brandend?",
                "Straalt de pijn uit naar uw arm, kaak, rug of andere delen?",
                "Merkt u dat de klachten samenhangen met inspanning of stress?",
                "Heeft u ook last van kortademigheid tijdens de klachten?",
                "Ervaart u hartkloppingen of een onregelmatige hartslag?",
                "Heeft u last van duizeligheid, zweten of misselijkheid?",
                "Zijn er momenten dat u flauw bent gevallen?"
            ],
            'triggers': [
                "Wat maakt uw klachten erger?",
                "Wat helpt om de klachten te verminderen?",
                "Merkt u verschil tussen rust en inspanning?",
                "Zijn er specifieke situaties die de klachten uitlokken?",
                "Hoe reageren uw klachten op rust of nitraat?"
            ],
            'voorgeschiedenis': [
                "Heeft u eerder hartproblemen gehad?",
                "Bent u wel eens opgenomen geweest voor hartklachten?",
                "Heeft u een hoge bloeddruk?",
                "Heeft u diabetes of suikerziekte?",
                "Heeft u een hoog cholesterol?",
                "Heeft u eerder een hartinfarct gehad?"
            ],
            'medicatie': [
                "Welke medicijnen gebruikt u momenteel?",
                "Gebruikt u bloedverdunners?",
                "Gebruikt u medicijnen voor uw bloeddruk?",
                "Heeft u bekende allergieën voor medicijnen?",
                "Gebruikt u pijnstillers regelmatig?"
            ],
            'familie': [
                "Zijn er hartaandoeningen bekend in uw familie?",
                "Heeft u familie met jonge hartinfarcten?",
                "Komen hoge bloeddruk of diabetes veel voor in uw familie?",
                "Zijn er familieleden jong overleden aan hartproblemen?"
            ],
            'leefstijl': [
                "Rookt u of heeft u gerookt?",
                "Hoeveel alcohol gebruikt u per week?",
                "Hoe zou u uw conditie en fitheid beschrijven?",
                "Doet u regelmatig aan sport of beweging?",
                "Ervaart u veel stress in uw werk of privéleven?"
            ]
        }
        
        logger.info(f"OpenAI Realtime Client initialized for session {client_sid}")
    
    def start_connection(self):
        """Start the WebSocket connection in a separate thread"""
        try:
            self.thread = threading.Thread(target=self._run_connection)
            self.thread.daemon = True
            self.thread.start()
            logger.info("Connection thread started")
            return True
        except Exception as e:
            logger.error(f"Failed to start connection thread: {e}")
            return False
    
    def _run_connection(self):
        """Run the WebSocket connection in its own event loop"""
        try:
            self.loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.loop)
            self.loop.run_until_complete(self._connect_and_listen())
        except Exception as e:
            logger.error(f"Connection thread error: {e}")
            self._emit_error(f"Connection failed: {str(e)}")
        finally:
            if self.loop:
                self.loop.close()
    
    async def _connect_and_listen(self):
        """Connect to OpenAI Realtime API and listen for messages"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'OpenAI-Beta': 'realtime=v1'
            }
            
            uri = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01"
            
            logger.info("Connecting to OpenAI Realtime API...")
            
            async with websockets.connect(uri, extra_headers=headers) as websocket:
                self.websocket = websocket
                self.connected = True
                
                logger.info("Successfully connected to OpenAI Realtime API")
                self._emit_connected()
                
                # Send initial session configuration
                await self._send_session_config()
                
                # Start the first question
                await self._start_conversation()
                
                # Listen for messages
                async for message in websocket:
                    await self._handle_openai_message(message)
                    
        except websockets.exceptions.InvalidStatusCode as e:
            logger.error(f"WebSocket connection failed with status {e.status_code}")
            if e.status_code == 401:
                self._emit_error("Invalid API key. Please check your OpenAI API key.")
            elif e.status_code == 403:
                self._emit_error("Access denied. Your API key may not have access to the Realtime API.")
            else:
                self._emit_error(f"Connection failed with status {e.status_code}")
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            self._emit_error(f"Connection error: {str(e)}")
        finally:
            self.connected = False
            self.websocket = None
    
    async def _send_session_config(self):
        """Send session configuration to OpenAI"""
        try:
            config = {
                "type": "session.update",
                "session": {
                    "modalities": ["text", "audio"],
                    "instructions": self._get_system_instructions(),
                    "voice": "alloy",
                    "input_audio_format": "pcm16",
                    "output_audio_format": "pcm16",
                    "input_audio_transcription": {
                        "model": "whisper-1"
                    },
                    "turn_detection": {
                        "type": "server_vad",
                        "threshold": 0.5,
                        "prefix_padding_ms": 300,
                        "silence_duration_ms": 500
                    },
                    "temperature": 0.7,
                    "max_response_output_tokens": 4096
                }
            }
            
            await self.websocket.send(json.dumps(config))
            logger.info("Session configuration sent successfully")
            
        except Exception as e:
            logger.error(f"Failed to send session config: {e}")
            raise
    
    async def _start_conversation(self):
        """Start the conversation with the first question"""
        try:
            first_question = self._get_next_question()
            if first_question:
                await self._send_ai_message(first_question)
                self.asked_questions.add(first_question)
                logger.info(f"Started conversation with: {first_question}")
        except Exception as e:
            logger.error(f"Failed to start conversation: {e}")
    
    def _get_system_instructions(self):
        """Get comprehensive system instructions for the AI"""
        asked_list = list(self.asked_questions)
        next_questions = self._get_available_questions()
        
        return f"""Je bent een ervaren Nederlandse cardioloog die een systematische anamnese afneemt.

KRITIEKE REGELS:
1. Stel NOOIT een vraag die je al hebt gesteld
2. Stel altijd maar één vraag per keer
3. Wees empathisch en professioneel
4. Spreek uitsluitend Nederlands
5. Analyseer elk antwoord grondig voor medische informatie

REEDS GESTELDE VRAGEN (NOOIT HERHALEN):
{chr(10).join(asked_list)}

HUIDIGE FASE: {self.current_phase}
TOTAAL GESTELDE VRAGEN: {len(self.asked_questions)}

BESCHIKBARE VRAGEN VOOR DEZE FASE:
{chr(10).join(next_questions[:5])}

INSTRUCTIES:
- Analyseer het antwoord van de patiënt zorgvuldig
- Extraheer alle relevante medische informatie
- Kies de meest logische vervolgvraag uit de beschikbare vragen
- Stel de vraag op een empathische, professionele manier
- Gebruik geen vragen die al zijn gesteld

Als alle vragen in de huidige fase zijn gesteld, ga dan naar de volgende fase."""
    
    def _get_available_questions(self):
        """Get available questions for current phase"""
        current_questions = self.question_phases.get(self.current_phase, [])
        return [q for q in current_questions if q not in self.asked_questions]
    
    def _get_next_question(self):
        """Get the next question to ask"""
        available = self._get_available_questions()
        if available:
            return available[0]
        
        # Move to next phase if current phase is complete
        phases = list(self.question_phases.keys())
        try:
            current_index = phases.index(self.current_phase)
            if current_index < len(phases) - 1:
                self.current_phase = phases[current_index + 1]
                logger.info(f"Moving to next phase: {self.current_phase}")
                return self._get_next_question()
        except ValueError:
            pass
        
        return "Dank u wel voor uw antwoorden. Heeft u nog andere klachten of vragen?"
    
    async def _handle_openai_message(self, message):
        """Handle messages from OpenAI Realtime API"""
        try:
            data = json.loads(message)
            message_type = data.get('type')
            
            logger.debug(f"Received from OpenAI: {message_type}")
            
            if message_type == 'response.text.done':
                text = data.get('text', '').strip()
                if text and '?' in text:
                    # This is likely a question from the AI
                    self.asked_questions.add(text)
                    self._update_conversation_phase()
                    
                    self._emit_ai_response({
                        'text': text,
                        'phase': self.current_phase,
                        'questions_asked': len(self.asked_questions),
                        'total_phases': len(self.question_phases)
                    })
                    
                    logger.info(f"AI asked: {text}")
            
            elif message_type == 'response.audio.delta':
                if 'delta' in data:
                    self._emit_audio_delta(data['delta'])
            
            elif message_type == 'response.audio.done':
                self._emit_audio_done()
            
            elif message_type == 'input_audio_buffer.speech_started':
                self._emit_speech_started()
            
            elif message_type == 'input_audio_buffer.speech_stopped':
                self._emit_speech_stopped()
            
            elif message_type == 'error':
                error_msg = data.get('error', {}).get('message', 'Unknown error')
                logger.error(f"OpenAI API error: {error_msg}")
                self._emit_error(f"OpenAI error: {error_msg}")
            
            elif message_type == 'session.created':
                logger.info("Session created successfully")
            
            elif message_type == 'session.updated':
                logger.info("Session updated successfully")
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI message: {e}")
        except Exception as e:
            logger.error(f"Error handling OpenAI message: {e}")
    
    def _update_conversation_phase(self):
        """Update conversation phase based on questions asked"""
        total_questions = len(self.asked_questions)
        phases = list(self.question_phases.keys())
        
        # Determine phase based on question count
        if total_questions <= 2:
            self.current_phase = 'symptomen'
        elif total_questions <= 5:
            self.current_phase = 'triggers'
        elif total_questions <= 8:
            self.current_phase = 'voorgeschiedenis'
        elif total_questions <= 11:
            self.current_phase = 'medicatie'
        elif total_questions <= 14:
            self.current_phase = 'familie'
        elif total_questions <= 17:
            self.current_phase = 'leefstijl'
        
        logger.info(f"Updated phase to: {self.current_phase} (questions: {total_questions})")
    
    async def _send_ai_message(self, text):
        """Send a text message as the AI"""
        try:
            message = {
                "type": "conversation.item.create",
                "item": {
                    "type": "message",
                    "role": "assistant",
                    "content": [{
                        "type": "text",
                        "text": text
                    }]
                }
            }
            await self.websocket.send(json.dumps(message))
            
            # Request audio response
            response_message = {
                "type": "response.create",
                "response": {
                    "modalities": ["audio"]
                }
            }
            await self.websocket.send(json.dumps(response_message))
            
        except Exception as e:
            logger.error(f"Failed to send AI message: {e}")
    
    async def send_audio(self, audio_data):
        """Send audio data to OpenAI"""
        try:
            if not self.connected or not self.websocket:
                raise Exception("Not connected to OpenAI")
            
            message = {
                "type": "input_audio_buffer.append",
                "audio": audio_data
            }
            await asyncio.run_coroutine_threadsafe(
                self.websocket.send(json.dumps(message)), 
                self.loop
            )
            
        except Exception as e:
            logger.error(f"Failed to send audio: {e}")
            raise
    
    async def commit_audio(self):
        """Commit audio buffer and request response"""
        try:
            if not self.connected or not self.websocket:
                raise Exception("Not connected to OpenAI")
            
            # Commit audio
            commit_message = {
                "type": "input_audio_buffer.commit"
            }
            await asyncio.run_coroutine_threadsafe(
                self.websocket.send(json.dumps(commit_message)), 
                self.loop
            )
            
            # Request response with updated instructions
            response_message = {
                "type": "response.create",
                "response": {
                    "modalities": ["text", "audio"],
                    "instructions": self._get_system_instructions()
                }
            }
            await asyncio.run_coroutine_threadsafe(
                self.websocket.send(json.dumps(response_message)), 
                self.loop
            )
            
        except Exception as e:
            logger.error(f"Failed to commit audio: {e}")
            raise
    
    def _emit_connected(self):
        """Emit connected event to client"""
        try:
            socketio.emit('realtime_connected', {
                'message': 'Successfully connected to OpenAI Realtime API',
                'phase': self.current_phase
            }, room=self.client_sid)
        except Exception as e:
            logger.error(f"Failed to emit connected event: {e}")
    
    def _emit_error(self, message):
        """Emit error event to client"""
        try:
            socketio.emit('realtime_error', {
                'message': message
            }, room=self.client_sid)
        except Exception as e:
            logger.error(f"Failed to emit error event: {e}")
    
    def _emit_ai_response(self, data):
        """Emit AI response to client"""
        try:
            socketio.emit('ai_response', data, room=self.client_sid)
        except Exception as e:
            logger.error(f"Failed to emit AI response: {e}")
    
    def _emit_audio_delta(self, audio_data):
        """Emit audio delta to client"""
        try:
            socketio.emit('audio_delta', {
                'audio': audio_data
            }, room=self.client_sid)
        except Exception as e:
            logger.error(f"Failed to emit audio delta: {e}")
    
    def _emit_audio_done(self):
        """Emit audio done event"""
        try:
            socketio.emit('audio_done', {}, room=self.client_sid)
        except Exception as e:
            logger.error(f"Failed to emit audio done: {e}")
    
    def _emit_speech_started(self):
        """Emit speech started event"""
        try:
            socketio.emit('speech_started', {}, room=self.client_sid)
        except Exception as e:
            logger.error(f"Failed to emit speech started: {e}")
    
    def _emit_speech_stopped(self):
        """Emit speech stopped event"""
        try:
            socketio.emit('speech_stopped', {}, room=self.client_sid)
        except Exception as e:
            logger.error(f"Failed to emit speech stopped: {e}")
    
    def disconnect(self):
        """Disconnect from OpenAI"""
        try:
            self.connected = False
            if self.websocket and self.loop:
                asyncio.run_coroutine_threadsafe(
                    self.websocket.close(), 
                    self.loop
                )
            logger.info(f"Disconnected client {self.client_sid}")
        except Exception as e:
            logger.error(f"Error during disconnect: {e}")

# Global storage for client connections
clients = {}

# SocketIO Event Handlers
@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")
    if request.sid in clients:
        clients[request.sid].disconnect()
        del clients[request.sid]

@socketio.on('connect_realtime')
def handle_connect_realtime(data):
    try:
        api_key = data.get('api_key', '').strip()
        
        if not api_key:
            emit('realtime_error', {'message': 'API key is required'})
            return
        
        if not api_key.startswith('sk-'):
            emit('realtime_error', {'message': 'Invalid API key format'})
            return
        
        logger.info(f"Connecting to OpenAI Realtime API for client {request.sid}")
        
        # Create and store client
        client = OpenAIRealtimeClient(api_key, request.sid)
        clients[request.sid] = client
        
        # Start connection
        success = client.start_connection()
        if not success:
            emit('realtime_error', {'message': 'Failed to start connection'})
            if request.sid in clients:
                del clients[request.sid]
        
    except Exception as e:
        logger.error(f"Error in connect_realtime: {e}")
        emit('realtime_error', {'message': f'Connection failed: {str(e)}'})

@socketio.on('send_audio')
def handle_send_audio(data):
    try:
        if request.sid not in clients:
            emit('realtime_error', {'message': 'Not connected to OpenAI'})
            return
        
        client = clients[request.sid]
        audio_data = data.get('audio')
        
        if not audio_data:
            emit('realtime_error', {'message': 'No audio data provided'})
            return
        
        # Send audio in the client's event loop
        if client.loop and client.connected:
            asyncio.run_coroutine_threadsafe(
                client.send_audio(audio_data),
                client.loop
            )
        else:
            emit('realtime_error', {'message': 'Client not properly connected'})
            
    except Exception as e:
        logger.error(f"Error in send_audio: {e}")
        emit('realtime_error', {'message': f'Failed to send audio: {str(e)}'})

@socketio.on('commit_audio')
def handle_commit_audio():
    try:
        if request.sid not in clients:
            emit('realtime_error', {'message': 'Not connected to OpenAI'})
            return
        
        client = clients[request.sid]
        
        if client.loop and client.connected:
            asyncio.run_coroutine_threadsafe(
                client.commit_audio(),
                client.loop
            )
        else:
            emit('realtime_error', {'message': 'Client not properly connected'})
            
    except Exception as e:
        logger.error(f"Error in commit_audio: {e}")
        emit('realtime_error', {'message': f'Failed to commit audio: {str(e)}'})

# Flask Routes
@app.route('/')
def index():
    """Serve the main application"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory(app.static_folder, filename)

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'medical-voice-chat',
        'realtime_api': 'available',
        'connected_clients': len(clients)
    })

@app.route('/api/test-realtime')
def test_realtime():
    """Test endpoint for Realtime API functionality"""
    return jsonify({
        'status': 'OpenAI Realtime API proxy is running',
        'endpoints': {
            'websocket': '/socket.io/',
            'events': [
                'connect_realtime',
                'send_audio', 
                'commit_audio',
                'disconnect'
            ]
        },
        'features': [
            'Speech-to-speech conversation',
            'Intelligent question tracking',
            'No question repetition',
            'Cardiological anamnesis',
            'Real-time audio processing'
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting Medical Voice Chat application on port {port}")
    
    # Run with SocketIO
    socketio.run(
        app, 
        host='0.0.0.0', 
        port=port, 
        debug=False,
        allow_unsafe_werkzeug=True
    )

