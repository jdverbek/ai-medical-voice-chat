"""
OpenAI Realtime API Proxy for Speech-to-Speech functionality
Handles WebSocket connections and audio streaming
"""

import asyncio
import websockets
import json
import base64
import logging
from flask import Blueprint, request, jsonify
from flask_socketio import SocketIO, emit, disconnect
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

realtime_bp = Blueprint('realtime', __name__)

class OpenAIRealtimeProxy:
    def __init__(self, api_key):
        self.api_key = api_key
        self.openai_ws = None
        self.client_sid = None
        self.conversation_history = []
        self.asked_questions = set()
        self.current_phase = 'initial'
        
        # Cardiological question phases
        self.question_phases = {
            'initial': [
                "Wat is uw belangrijkste hartklacht?",
                "Kunt u uw klachten beschrijven?"
            ],
            'symptoms': [
                "Sinds wanneer heeft u deze klachten?",
                "Hoe zou u de pijn beschrijven - drukkend, stekend, of brandend?",
                "Straalt de pijn uit naar andere delen van uw lichaam?",
                "Merkt u dat de klachten samenhangen met inspanning?",
                "Heeft u ook last van kortademigheid?",
                "Ervaart u hartkloppingen of een onregelmatige hartslag?",
                "Heeft u last van duizeligheid of flauwvallen?"
            ],
            'triggers': [
                "Wat maakt de klachten erger?",
                "Wat helpt om de klachten te verminderen?",
                "Merkt u verschil tussen rust en inspanning?",
                "Zijn er specifieke situaties die de klachten uitlokken?"
            ],
            'medical_history': [
                "Heeft u eerder hartproblemen gehad?",
                "Gebruikt u momenteel medicijnen?",
                "Heeft u bekende allergieën?",
                "Rookt u of heeft u gerookt?",
                "Hoeveel alcohol gebruikt u per week?"
            ],
            'family_history': [
                "Zijn er hartaandoeningen bekend in uw familie?",
                "Heeft u familie met hoge bloeddruk of diabetes?",
                "Zijn er familieleden jong overleden aan hartproblemen?"
            ],
            'lifestyle': [
                "Hoe zou u uw conditie beschrijven?",
                "Doet u regelmatig aan sport of beweging?",
                "Hoe is uw eetpatroon?",
                "Ervaart u veel stress?"
            ]
        }
    
    async def connect_to_openai(self):
        """Connect to OpenAI Realtime API"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'OpenAI-Beta': 'realtime=v1'
            }
            
            uri = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01"
            
            self.openai_ws = await websockets.connect(uri, extra_headers=headers)
            logger.info("Connected to OpenAI Realtime API")
            
            # Send session configuration
            await self.send_session_config()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to OpenAI Realtime API: {e}")
            return False
    
    async def send_session_config(self):
        """Send session configuration to OpenAI"""
        config = {
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": self.get_system_instructions(),
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
        
        await self.openai_ws.send(json.dumps(config))
        logger.info("Session configuration sent")
    
    def get_system_instructions(self):
        """Get system instructions for the AI"""
        asked_questions_list = list(self.asked_questions)
        next_questions = self.get_next_questions()
        
        return f"""Je bent een ervaren Nederlandse cardioloog die een systematische anamnese afneemt.

BELANGRIJKE REGELS:
1. Stel NOOIT dezelfde vraag twee keer
2. Houd bij welke vragen je al hebt gesteld
3. Stel één vraag per keer
4. Wees empathisch en professioneel
5. Spreek Nederlands

REEDS GESTELDE VRAGEN (NIET HERHALEN):
{', '.join(asked_questions_list)}

HUIDIGE FASE: {self.current_phase}

VOLGENDE VRAGEN OM TE STELLEN (kies er één die je nog NIET hebt gesteld):
{chr(10).join(next_questions)}

Analyseer het antwoord van de patiënt, extraheer relevante medische informatie, en stel dan de meest logische vervolgvraag die je nog NIET hebt gesteld."""
    
    def get_next_questions(self):
        """Get next questions for current phase"""
        current_phase_questions = self.question_phases.get(self.current_phase, [])
        return [q for q in current_phase_questions if q not in self.asked_questions]
    
    async def handle_openai_message(self, message):
        """Handle messages from OpenAI Realtime API"""
        try:
            data = json.loads(message)
            message_type = data.get('type')
            
            logger.info(f"Received from OpenAI: {message_type}")
            
            if message_type == 'response.text.done':
                text = data.get('text', '')
                if text:
                    self.asked_questions.add(text)
                    self.update_conversation_phase()
                    
                    # Send to client
                    if self.client_sid:
                        emit('ai_response', {
                            'text': text,
                            'phase': self.current_phase,
                            'questions_asked': len(self.asked_questions)
                        }, room=self.client_sid)
            
            elif message_type == 'response.audio.delta':
                # Forward audio to client
                if self.client_sid and 'delta' in data:
                    emit('audio_delta', {
                        'audio': data['delta']
                    }, room=self.client_sid)
            
            elif message_type == 'response.audio.done':
                if self.client_sid:
                    emit('audio_done', {}, room=self.client_sid)
            
            elif message_type == 'error':
                logger.error(f"OpenAI error: {data}")
                if self.client_sid:
                    emit('error', {
                        'message': data.get('error', {}).get('message', 'Unknown error')
                    }, room=self.client_sid)
                    
        except Exception as e:
            logger.error(f"Error handling OpenAI message: {e}")
    
    def update_conversation_phase(self):
        """Update conversation phase based on questions asked"""
        total_questions = len(self.asked_questions)
        
        if total_questions < 3:
            self.current_phase = 'symptoms'
        elif total_questions < 6:
            self.current_phase = 'triggers'
        elif total_questions < 9:
            self.current_phase = 'medical_history'
        elif total_questions < 12:
            self.current_phase = 'family_history'
        else:
            self.current_phase = 'lifestyle'
    
    async def send_audio_to_openai(self, audio_data):
        """Send audio data to OpenAI"""
        try:
            message = {
                "type": "input_audio_buffer.append",
                "audio": audio_data
            }
            await self.openai_ws.send(json.dumps(message))
            
        except Exception as e:
            logger.error(f"Error sending audio to OpenAI: {e}")
    
    async def commit_audio_and_respond(self):
        """Commit audio buffer and request response"""
        try:
            # Commit audio
            commit_message = {
                "type": "input_audio_buffer.commit"
            }
            await self.openai_ws.send(json.dumps(commit_message))
            
            # Request response
            response_message = {
                "type": "response.create",
                "response": {
                    "modalities": ["text", "audio"],
                    "instructions": self.get_system_instructions()
                }
            }
            await self.openai_ws.send(json.dumps(response_message))
            
        except Exception as e:
            logger.error(f"Error committing audio: {e}")
    
    async def send_text_to_openai(self, text):
        """Send text message to OpenAI"""
        try:
            # Add conversation item
            item_message = {
                "type": "conversation.item.create",
                "item": {
                    "type": "message",
                    "role": "user",
                    "content": [{
                        "type": "input_text",
                        "text": text
                    }]
                }
            }
            await self.openai_ws.send(json.dumps(item_message))
            
            # Request response
            response_message = {
                "type": "response.create",
                "response": {
                    "modalities": ["text", "audio"],
                    "instructions": self.get_system_instructions()
                }
            }
            await self.openai_ws.send(json.dumps(response_message))
            
        except Exception as e:
            logger.error(f"Error sending text to OpenAI: {e}")
    
    async def disconnect(self):
        """Disconnect from OpenAI"""
        if self.openai_ws:
            await self.openai_ws.close()
            self.openai_ws = None

# Global proxy instance
proxy_instance = None

def init_socketio(socketio):
    """Initialize SocketIO events"""
    
    @socketio.on('connect_realtime')
    def handle_connect_realtime(data):
        global proxy_instance
        
        api_key = data.get('api_key')
        if not api_key:
            emit('error', {'message': 'API key is required'})
            return
        
        # Create proxy instance
        proxy_instance = OpenAIRealtimeProxy(api_key)
        proxy_instance.client_sid = request.sid
        
        # Connect to OpenAI in background
        async def connect():
            success = await proxy_instance.connect_to_openai()
            if success:
                emit('connected', {'message': 'Connected to OpenAI Realtime API'})
                
                # Start listening for OpenAI messages
                async for message in proxy_instance.openai_ws:
                    await proxy_instance.handle_openai_message(message)
            else:
                emit('error', {'message': 'Failed to connect to OpenAI Realtime API'})
        
        # Run connection in event loop
        asyncio.create_task(connect())
    
    @socketio.on('send_audio')
    def handle_send_audio(data):
        global proxy_instance
        
        if not proxy_instance or not proxy_instance.openai_ws:
            emit('error', {'message': 'Not connected to OpenAI'})
            return
        
        audio_data = data.get('audio')
        if audio_data:
            asyncio.create_task(proxy_instance.send_audio_to_openai(audio_data))
    
    @socketio.on('commit_audio')
    def handle_commit_audio():
        global proxy_instance
        
        if not proxy_instance or not proxy_instance.openai_ws:
            emit('error', {'message': 'Not connected to OpenAI'})
            return
        
        asyncio.create_task(proxy_instance.commit_audio_and_respond())
    
    @socketio.on('send_text')
    def handle_send_text(data):
        global proxy_instance
        
        if not proxy_instance or not proxy_instance.openai_ws:
            emit('error', {'message': 'Not connected to OpenAI'})
            return
        
        text = data.get('text')
        if text:
            asyncio.create_task(proxy_instance.send_text_to_openai(text))
    
    @socketio.on('disconnect')
    def handle_disconnect():
        global proxy_instance
        
        if proxy_instance:
            asyncio.create_task(proxy_instance.disconnect())
            proxy_instance = None

@realtime_bp.route('/test', methods=['GET'])
def test_realtime():
    """Test endpoint for Realtime API proxy"""
    return jsonify({
        'status': 'Realtime API proxy is running',
        'endpoints': [
            'WebSocket: /socket.io/',
            'Events: connect_realtime, send_audio, commit_audio, send_text'
        ]
    })

