import os
import sys
import json
import asyncio
import logging
import base64
import websockets
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('realtime_api.log')
    ]
)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__, static_folder='static', template_folder='static')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# Global state
active_connections = {}

class OpenAIRealtimeClient:
    def __init__(self, api_key, socket_id):
        self.api_key = api_key
        self.socket_id = socket_id
        self.websocket = None
        self.connected = False
        self.conversation_history = []
        self.current_phase = 'hoofdklacht'
        self.questions_asked = 0
        
        # Medical conversation state
        self.medical_data = {
            'symptoms': [],
            'medications': [],
            'family_history': [],
            'risk_factors': []
        }
        
        # Cardiological phases
        self.phases = [
            'hoofdklacht',
            'symptomen', 
            'triggers',
            'voorgeschiedenis',
            'medicatie',
            'familie',
            'leefstijl'
        ]
        
        logger.info(f"OpenAI Realtime Client initialized for socket {socket_id}")
    
    async def connect(self):
        """Connect to OpenAI Realtime API"""
        try:
            url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "OpenAI-Beta": "realtime=v1"
            }
            
            logger.info(f"Connecting to OpenAI Realtime API for socket {self.socket_id}")
            
            self.websocket = await websockets.connect(url, extra_headers=headers)
            self.connected = True
            
            # Configure session
            await self.configure_session()
            
            # Start listening for events
            asyncio.create_task(self.listen_for_events())
            
            logger.info(f"Successfully connected to OpenAI Realtime API for socket {self.socket_id}")
            
            # Notify client of successful connection
            socketio.emit('realtime_connected', {
                'status': 'connected',
                'phase': self.current_phase,
                'message': 'Succesvol verbonden met OpenAI Realtime API'
            }, room=self.socket_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to OpenAI Realtime API: {e}")
            socketio.emit('realtime_error', {
                'message': f'Verbindingsfout: {str(e)}'
            }, room=self.socket_id)
            return False
    
    async def configure_session(self):
        """Configure the Realtime session"""
        try:
            # Session configuration
            session_config = {
                "type": "session.update",
                "session": {
                    "modalities": ["text", "audio"],
                    "instructions": self.get_medical_instructions(),
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
                        "silence_duration_ms": 200
                    },
                    "tools": [],
                    "tool_choice": "auto",
                    "temperature": 0.8,
                    "max_response_output_tokens": 4096
                }
            }
            
            await self.websocket.send(json.dumps(session_config))
            logger.info(f"Session configured for socket {self.socket_id}")
            
        except Exception as e:
            logger.error(f"Failed to configure session: {e}")
            raise
    
    def get_medical_instructions(self):
        """Get medical conversation instructions"""
        return f"""Je bent een Nederlandse AI cardioloog die een systematische anamnese afneemt. 

HUIDIGE FASE: {self.current_phase}
VRAGEN GESTELD: {self.questions_asked}

INSTRUCTIES:
1. Spreek alleen Nederlands
2. Stel één vraag per keer
3. Luister aandachtig naar het antwoord
4. Stel relevante vervolgvragen gebaseerd op het antwoord
5. Voorkom herhaalde vragen - onthoud wat al is gevraagd
6. Ga systematisch door de cardiologische anamnese

FASES:
- hoofdklacht: Wat is de hoofdklacht? Wanneer begon het?
- symptomen: Pijn op borst, kortademigheid, hartkloppingen, duizeligheid
- triggers: Wat maakt het erger/beter? Inspanning, rust, stress?
- voorgeschiedenis: Eerdere hartproblemen, operaties, ziekenhuis opnames
- medicatie: Huidige medicijnen, allergieën, bijwerkingen
- familie: Familie geschiedenis van hartproblemen
- leefstijl: Roken, alcohol, beweging, voeding

Begin met een warme begroeting en de eerste vraag over de hoofdklacht.
Houd de vragen kort en duidelijk.
Toon empathie en begrip.
"""
    
    async def listen_for_events(self):
        """Listen for events from OpenAI Realtime API"""
        try:
            async for message in self.websocket:
                try:
                    event = json.loads(message)
                    await self.handle_event(event)
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse event: {e}")
                except Exception as e:
                    logger.error(f"Error handling event: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"WebSocket connection closed for socket {self.socket_id}")
            self.connected = False
        except Exception as e:
            logger.error(f"Error in event listener: {e}")
            self.connected = False
    
    async def handle_event(self, event):
        """Handle events from OpenAI Realtime API"""
        event_type = event.get('type')
        
        logger.info(f"Received event: {event_type} for socket {self.socket_id}")
        
        if event_type == 'session.created':
            logger.info(f"Session created for socket {self.socket_id}")
            
        elif event_type == 'session.updated':
            logger.info(f"Session updated for socket {self.socket_id}")
            
        elif event_type == 'conversation.item.created':
            item = event.get('item', {})
            if item.get('type') == 'message':
                role = item.get('role')
                content = item.get('content', [])
                if content and role == 'assistant':
                    text_content = next((c.get('text') for c in content if c.get('type') == 'text'), '')
                    if text_content:
                        self.conversation_history.append({
                            'role': 'assistant',
                            'content': text_content,
                            'timestamp': datetime.now().isoformat()
                        })
                        
                        # Update conversation state
                        self.questions_asked += 1
                        
                        # Emit to client
                        socketio.emit('ai_response', {
                            'text': text_content,
                            'phase': self.current_phase,
                            'questions_asked': self.questions_asked,
                            'total_phases': len(self.phases)
                        }, room=self.socket_id)
            
        elif event_type == 'response.audio.delta':
            # Stream audio to client
            audio_data = event.get('delta')
            if audio_data:
                socketio.emit('audio_delta', {
                    'audio': audio_data
                }, room=self.socket_id)
                
        elif event_type == 'response.audio.done':
            socketio.emit('audio_done', {}, room=self.socket_id)
            
        elif event_type == 'input_audio_buffer.speech_started':
            socketio.emit('speech_started', {}, room=self.socket_id)
            
        elif event_type == 'input_audio_buffer.speech_stopped':
            socketio.emit('speech_stopped', {}, room=self.socket_id)
            
        elif event_type == 'conversation.item.input_audio_transcription.completed':
            transcript = event.get('transcript', '')
            if transcript:
                self.conversation_history.append({
                    'role': 'user',
                    'content': transcript,
                    'timestamp': datetime.now().isoformat()
                })
                
                # Extract medical information
                self.extract_medical_info(transcript)
                
        elif event_type == 'error':
            error_message = event.get('error', {}).get('message', 'Unknown error')
            logger.error(f"OpenAI API error: {error_message}")
            socketio.emit('realtime_error', {
                'message': f'OpenAI fout: {error_message}'
            }, room=self.socket_id)
    
    def extract_medical_info(self, text):
        """Extract medical information from user input"""
        text_lower = text.lower()
        
        # Extract symptoms
        symptoms = ['pijn', 'kortademig', 'hartkloppingen', 'duizelig', 'moe', 'zweten']
        for symptom in symptoms:
            if symptom in text_lower and symptom not in self.medical_data['symptoms']:
                self.medical_data['symptoms'].append(symptom)
        
        # Extract medications
        medications = ['aspirine', 'metoprolol', 'lisinopril', 'simvastatine', 'warfarine']
        for med in medications:
            if med in text_lower and med not in self.medical_data['medications']:
                self.medical_data['medications'].append(med)
    
    async def send_audio(self, audio_data):
        """Send audio data to OpenAI"""
        try:
            if not self.connected or not self.websocket:
                logger.error("Not connected to OpenAI Realtime API")
                return
            
            # Send audio data
            message = {
                "type": "input_audio_buffer.append",
                "audio": audio_data
            }
            await self.websocket.send(json.dumps(message))
            
        except Exception as e:
            logger.error(f"Failed to send audio: {e}")
    
    async def commit_audio(self):
        """Commit audio buffer and generate response"""
        try:
            if not self.connected or not self.websocket:
                logger.error("Not connected to OpenAI Realtime API")
                return
            
            # Commit audio buffer
            commit_message = {
                "type": "input_audio_buffer.commit"
            }
            await self.websocket.send(json.dumps(commit_message))
            
            # Create response
            response_message = {
                "type": "response.create",
                "response": {
                    "modalities": ["text", "audio"],
                    "instructions": self.get_medical_instructions()
                }
            }
            await self.websocket.send(json.dumps(response_message))
            
        except Exception as e:
            logger.error(f"Failed to commit audio: {e}")
    
    async def disconnect(self):
        """Disconnect from OpenAI Realtime API"""
        try:
            self.connected = False
            if self.websocket:
                await self.websocket.close()
                logger.info(f"Disconnected from OpenAI Realtime API for socket {self.socket_id}")
        except Exception as e:
            logger.error(f"Error disconnecting: {e}")

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")
    
    # Clean up OpenAI connection
    if request.sid in active_connections:
        client = active_connections[request.sid]
        asyncio.create_task(client.disconnect())
        del active_connections[request.sid]

@socketio.on('connect_realtime')
def handle_connect_realtime(data):
    """Handle OpenAI Realtime API connection request"""
    try:
        api_key = data.get('api_key')
        if not api_key:
            emit('realtime_error', {'message': 'API key is required'})
            return
        
        if not api_key.startswith('sk-'):
            emit('realtime_error', {'message': 'Invalid API key format'})
            return
        
        logger.info(f"Connecting to OpenAI Realtime API for socket {request.sid}")
        
        # Create OpenAI client
        client = OpenAIRealtimeClient(api_key, request.sid)
        active_connections[request.sid] = client
        
        # Connect in a new thread to avoid event loop issues
        def connect_in_thread():
            try:
                # Create new event loop for this thread
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                # Run the connection
                loop.run_until_complete(client.connect())
                
            except Exception as e:
                logger.error(f"Error in connection thread: {e}")
                socketio.emit('realtime_error', {
                    'message': f'Connection thread error: {str(e)}'
                }, room=request.sid)
            finally:
                loop.close()
        
        # Start connection in separate thread
        thread = threading.Thread(target=connect_in_thread)
        thread.daemon = True
        thread.start()
        
    except Exception as e:
        logger.error(f"Error connecting to Realtime API: {e}")
        emit('realtime_error', {'message': f'Connection error: {str(e)}'})

@socketio.on('send_audio')
def handle_send_audio(data):
    """Handle audio data from client"""
    try:
        if request.sid not in active_connections:
            emit('realtime_error', {'message': 'Not connected to OpenAI Realtime API'})
            return
        
        client = active_connections[request.sid]
        audio_data = data.get('audio')
        
        if audio_data:
            # Send audio in separate thread to avoid event loop issues
            def send_audio_in_thread():
                try:
                    # Create new event loop for this thread
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    
                    # Send the audio
                    loop.run_until_complete(client.send_audio(audio_data))
                    
                except Exception as e:
                    logger.error(f"Error in audio thread: {e}")
                    socketio.emit('realtime_error', {
                        'message': f'Audio thread error: {str(e)}'
                    }, room=request.sid)
                finally:
                    loop.close()
            
            # Start audio sending in separate thread
            thread = threading.Thread(target=send_audio_in_thread)
            thread.daemon = True
            thread.start()
        
    except Exception as e:
        logger.error(f"Error sending audio: {e}")
        emit('realtime_error', {'message': f'Audio error: {str(e)}'})

@socketio.on('commit_audio')
def handle_commit_audio():
    """Handle audio commit request"""
    try:
        if request.sid not in active_connections:
            emit('realtime_error', {'message': 'Not connected to OpenAI Realtime API'})
            return
        
        client = active_connections[request.sid]
        
        # Commit audio in separate thread to avoid event loop issues
        def commit_audio_in_thread():
            try:
                # Create new event loop for this thread
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                # Commit the audio
                loop.run_until_complete(client.commit_audio())
                
            except Exception as e:
                logger.error(f"Error in commit thread: {e}")
                socketio.emit('realtime_error', {
                    'message': f'Commit thread error: {str(e)}'
                }, room=request.sid)
            finally:
                loop.close()
        
        # Start commit in separate thread
        thread = threading.Thread(target=commit_audio_in_thread)
        thread.daemon = True
        thread.start()
        
    except Exception as e:
        logger.error(f"Error committing audio: {e}")
        emit('realtime_error', {'message': f'Commit error: {str(e)}'})

# Flask routes
@app.route('/')
def index():
    """Serve the fixed ChatGPT-style voice mode application"""
    return render_template('fixed-chatgpt-voice.html')

@app.route('/old')
def old_version():
    """Serve the old version for comparison"""
    return render_template('index.html')

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'active_connections': len(active_connections)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting OpenAI Realtime API Medical Voice Chat on port {port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=False, allow_unsafe_werkzeug=True)

