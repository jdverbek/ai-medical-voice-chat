// Browser-Compatible OpenAI Realtime API Implementation
class OpenAIRealtimeVoice {
    constructor() {
        this.ws = null;
        this.apiKey = null;
        this.isConnected = false;
        this.isRecording = false;
        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.eventHandlers = {};
        this.currentAudioBuffer = [];
        
        // Audio processing
        this.sampleRate = 24000;
        this.channels = 1;
        
        console.log('OpenAI Realtime Voice initialized');
    }
    
    // Set API key
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        console.log('API key set for OpenAI Realtime');
    }
    
    // Connect to OpenAI Realtime API with proper browser authentication
    async connect() {
        if (!this.apiKey) {
            throw new Error('API key is required');
        }
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('Already connected to OpenAI Realtime API');
            return;
        }
        
        try {
            console.log('Connecting to OpenAI Realtime API...');
            
            // For browser WebSocket, we need to use query parameters for authentication
            // since custom headers are not supported in browser WebSocket API
            const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
            
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected to OpenAI Realtime API');
                
                // Send authentication and session configuration immediately after connection
                this.sendEvent({
                    type: 'session.update',
                    session: {
                        model: "gpt-4o-realtime-preview-2024-10-01",
                        modalities: ["text", "audio"],
                        instructions: `Je bent een Nederlandse cardiologische AI assistent die een systematische anamnese afneemt. 
                        
                        Spreek natuurlijk Nederlands en stel één vraag tegelijk. Begin met de hoofdklacht en werk systematisch door:
                        1. Hoofdklacht (wat, waar, wanneer)
                        2. Huidige klachten (SOCRATES)
                        3. Cardiovasculaire risicofactoren
                        4. Familie anamnese
                        5. Medicatie en allergieën
                        6. Functionele classificatie
                        
                        Houd de conversatie natuurlijk en empathisch. Stel geen herhaalde vragen.`,
                        voice: "alloy",
                        input_audio_format: "pcm16",
                        output_audio_format: "pcm16",
                        input_audio_transcription: {
                            model: "whisper-1"
                        },
                        turn_detection: {
                            type: "server_vad",
                            threshold: 0.5,
                            prefix_padding_ms: 300,
                            silence_duration_ms: 500
                        },
                        tools: [],
                        tool_choice: "auto",
                        temperature: 0.8,
                        max_response_output_tokens: 4096
                    }
                });
                
                this.isConnected = true;
                this.emit('connected');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleRealtimeEvent(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };
            
            this.ws.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
                this.isConnected = false;
                this.emit('disconnected');
            };
            
        } catch (error) {
            console.error('Failed to connect to OpenAI Realtime API:', error);
            throw error;
        }
    }
    
    // Alternative connection method using proper authentication
    async connectWithAuth() {
        if (!this.apiKey) {
            throw new Error('API key is required');
        }
        
        try {
            // First, validate the API key with a simple request
            console.log('Validating API key...');
            const testResponse = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!testResponse.ok) {
                const errorData = await testResponse.json();
                throw new Error(`API key validation failed: ${errorData.error?.message || testResponse.status}`);
            }
            
            console.log('API key validated successfully');
            
            // Since browser WebSocket doesn't support custom headers,
            // we'll use a different approach - send auth in first message
            const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
            
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected, sending authentication...');
                
                // Send authentication as first message
                this.ws.send(JSON.stringify({
                    type: 'auth',
                    token: this.apiKey
                }));
                
                // Then send session configuration
                setTimeout(() => {
                    this.sendEvent({
                        type: 'session.update',
                        session: {
                            model: "gpt-4o-realtime-preview-2024-10-01",
                            modalities: ["text", "audio"],
                            instructions: `Je bent een Nederlandse cardiologische AI assistent die een systematische anamnese afneemt. 
                            
                            Spreek natuurlijk Nederlands en stel één vraag tegelijk. Begin met de hoofdklacht en werk systematisch door:
                            1. Hoofdklacht (wat, waar, wanneer)
                            2. Huidige klachten (SOCRATES)
                            3. Cardiovasculaire risicofactoren
                            4. Familie anamnese
                            5. Medicatie en allergieën
                            6. Functionele classificatie
                            
                            Houd de conversatie natuurlijk en empathisch. Stel geen herhaalde vragen.`,
                            voice: "alloy",
                            input_audio_format: "pcm16",
                            output_audio_format: "pcm16",
                            input_audio_transcription: {
                                model: "whisper-1"
                            },
                            turn_detection: {
                                type: "server_vad",
                                threshold: 0.5,
                                prefix_padding_ms: 300,
                                silence_duration_ms: 500
                            },
                            tools: [],
                            tool_choice: "auto",
                            temperature: 0.8,
                            max_response_output_tokens: 4096
                        }
                    });
                }, 100);
                
                this.isConnected = true;
                this.emit('connected');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleRealtimeEvent(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };
            
            this.ws.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
                this.isConnected = false;
                this.emit('disconnected');
            };
            
        } catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        }
    }
    
    // Send event to OpenAI Realtime API
    sendEvent(event) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }
        
        console.log('Sending event to OpenAI:', event.type);
        this.ws.send(JSON.stringify(event));
    }
    
    // Handle incoming events from OpenAI
    handleRealtimeEvent(event) {
        console.log('Received OpenAI event:', event.type);
        
        switch (event.type) {
            case 'session.created':
                console.log('Session created successfully');
                this.emit('sessionCreated', event);
                break;
                
            case 'session.updated':
                console.log('Session updated successfully');
                this.emit('sessionUpdated', event);
                break;
                
            case 'conversation.item.created':
                this.emit('itemCreated', event);
                break;
                
            case 'response.created':
                this.emit('responseCreated', event);
                break;
                
            case 'response.output_item.added':
                this.emit('outputItemAdded', event);
                break;
                
            case 'response.content_part.added':
                this.emit('contentPartAdded', event);
                break;
                
            case 'response.audio.delta':
                this.handleAudioDelta(event);
                break;
                
            case 'response.audio.done':
                this.handleAudioDone(event);
                break;
                
            case 'response.text.delta':
                this.emit('textDelta', event);
                break;
                
            case 'response.text.done':
                this.emit('textDone', event);
                break;
                
            case 'response.done':
                this.emit('responseDone', event);
                break;
                
            case 'error':
                console.error('OpenAI Realtime error:', event.error);
                this.emit('error', event.error);
                break;
                
            default:
                console.log('Unhandled event type:', event.type);
        }
    }
    
    // Handle audio delta (streaming audio)
    handleAudioDelta(event) {
        if (event.delta) {
            this.currentAudioBuffer.push(event.delta);
            this.emit('audioDelta', event);
        }
    }
    
    // Handle audio done (complete audio response)
    handleAudioDone(event) {
        if (this.currentAudioBuffer.length > 0) {
            // Concatenate all audio deltas
            const completeAudio = this.currentAudioBuffer.join('');
            this.playAudio(completeAudio);
            this.currentAudioBuffer = [];
        }
        this.emit('audioDone', event);
    }
    
    // Start audio recording
    async startRecording() {
        if (this.isRecording) {
            console.log('Already recording');
            return;
        }
        
        try {
            // Initialize audio context
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                    sampleRate: this.sampleRate
                });
            }
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: this.sampleRate,
                    channelCount: this.channels,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // Create media recorder for continuous streaming
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.processAudioChunk(event.data);
                }
            };
            
            this.mediaRecorder.start(250); // Collect data every 250ms for real-time streaming
            this.isRecording = true;
            
            console.log('Recording started');
            this.emit('recordingStarted');
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.emit('error', error);
        }
    }
    
    // Stop audio recording
    stopRecording() {
        if (!this.isRecording) {
            console.log('Not recording');
            return;
        }
        
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            
            // Stop all tracks
            if (this.mediaRecorder.stream) {
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        }
        
        this.isRecording = false;
        console.log('Recording stopped');
        this.emit('recordingStopped');
    }
    
    // Process audio chunk for real-time streaming
    async processAudioChunk(audioBlob) {
        try {
            const arrayBuffer = await audioBlob.arrayBuffer();
            
            // Convert to PCM16 format for OpenAI
            const audioData = await this.convertToPCM16(arrayBuffer);
            
            // Send audio to OpenAI
            this.sendEvent({
                type: 'input_audio_buffer.append',
                audio: this.arrayBufferToBase64(audioData)
            });
            
        } catch (error) {
            console.error('Error processing audio chunk:', error);
        }
    }
    
    // Convert audio to PCM16 format
    async convertToPCM16(arrayBuffer) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Resample to 24kHz mono
        const offlineContext = new OfflineAudioContext(1, audioBuffer.duration * this.sampleRate, this.sampleRate);
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();
        
        const resampledBuffer = await offlineContext.startRendering();
        const pcmData = resampledBuffer.getChannelData(0);
        
        // Convert to 16-bit PCM
        const pcm16 = new Int16Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
            pcm16[i] = Math.max(-32768, Math.min(32767, pcmData[i] * 32768));
        }
        
        return pcm16.buffer;
    }
    
    // Convert ArrayBuffer to Base64
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    
    // Play audio response
    async playAudio(audioData) {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Decode base64 audio data
            const binaryString = atob(audioData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Convert PCM16 to AudioBuffer
            const pcm16 = new Int16Array(bytes.buffer);
            const audioBuffer = this.audioContext.createBuffer(1, pcm16.length, this.sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            for (let i = 0; i < pcm16.length; i++) {
                channelData[i] = pcm16[i] / 32768;
            }
            
            // Play the audio
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();
            
            console.log('Playing AI response audio');
            this.emit('audioPlaying');
            
        } catch (error) {
            console.error('Error playing audio:', error);
            this.emit('error', error);
        }
    }
    
    // Send text message
    sendTextMessage(text) {
        if (!this.isConnected) {
            console.error('Not connected to OpenAI Realtime API');
            return;
        }
        
        // Create conversation item
        this.sendEvent({
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [{
                    type: 'input_text',
                    text: text
                }]
            }
        });
        
        // Create response
        this.sendEvent({
            type: 'response.create',
            response: {
                modalities: ['text', 'audio'],
                instructions: 'Reageer in het Nederlands op de patiënt. Stel één relevante cardiologische vervolgvraag.'
            }
        });
    }
    
    // Commit audio buffer and create response
    commitAudioAndRespond() {
        if (!this.isConnected) {
            console.error('Not connected to OpenAI Realtime API');
            return;
        }
        
        // Commit the audio buffer
        this.sendEvent({
            type: 'input_audio_buffer.commit'
        });
        
        // Create response
        this.sendEvent({
            type: 'response.create',
            response: {
                modalities: ['text', 'audio'],
                instructions: 'Reageer in het Nederlands op de patiënt. Stel één relevante cardiologische vervolgvraag.'
            }
        });
    }
    
    // Event emitter functionality
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }
    
    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }
    
    // Disconnect from OpenAI
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        
        this.isConnected = false;
        this.isRecording = false;
        
        console.log('Disconnected from OpenAI Realtime API');
    }
    
    // Cleanup resources
    cleanup() {
        this.disconnect();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.eventHandlers = {};
        console.log('OpenAI Realtime Voice cleaned up');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.OpenAIRealtimeVoice = OpenAIRealtimeVoice;
}

