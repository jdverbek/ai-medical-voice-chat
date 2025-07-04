// True OpenAI Realtime API Client - Continuous Speech-to-Speech
class TrueRealtimeClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.recording = false;
        this.mediaRecorder = null;
        this.audioContext = null;
        this.audioWorklet = null;
        this.conversationHistory = [];
        this.currentPhase = 'hoofdklacht';
        this.questionsAsked = new Set();
        
        // Audio configuration for OpenAI Realtime API
        this.sampleRate = 24000;
        this.channels = 1;
        
        this.initializeEventListeners();
        console.log('TrueRealtimeClient initialized');
    }
    
    initializeEventListeners() {
        // API Key connection
        const saveButton = document.getElementById('save-api-key');
        const apiKeyInput = document.getElementById('api-key-input');
        
        if (saveButton) {
            saveButton.addEventListener('click', () => this.connectToOpenAI());
        }
        
        if (apiKeyInput) {
            apiKeyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.connectToOpenAI();
                }
            });
        }
        
        // Start buttons
        const voiceBtn = document.getElementById('start-voice-btn');
        const textBtn = document.getElementById('start-text-btn');
        const backBtn = document.getElementById('back-btn');
        
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.startVoiceConversation());
        }
        
        if (textBtn) {
            textBtn.addEventListener('click', () => this.startTextConversation());
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }
        
        // Voice controls - continuous recording
        const recordBtn = document.getElementById('record-btn');
        const stopBtn = document.getElementById('stop-btn');
        
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.startContinuousRecording());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopContinuousRecording());
        }
        
        // Text controls
        const sendBtn = document.getElementById('send-btn');
        const textInput = document.getElementById('text-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendTextMessage());
        }
        
        if (textInput) {
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendTextMessage();
                }
            });
        }
    }
    
    async connectToOpenAI() {
        try {
            const apiKeyInput = document.getElementById('api-key-input');
            const apiKey = apiKeyInput?.value?.trim();
            
            if (!apiKey) {
                this.showErrorMessage('Voer een geldige OpenAI API key in');
                return;
            }
            
            if (!apiKey.startsWith('sk-')) {
                this.showErrorMessage('Ongeldige API key format. Moet beginnen met "sk-"');
                return;
            }
            
            this.updateStatus('connecting', 'Verbinden met OpenAI Realtime API...');
            this.hideMessages();
            
            // Direct WebSocket connection to OpenAI Realtime API
            const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
            
            this.ws = new WebSocket(wsUrl, [], {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'OpenAI-Beta': 'realtime=v1'
                }
            });
            
            this.ws.onopen = () => {
                console.log('Connected to OpenAI Realtime API');
                this.connected = true;
                this.updateStatus('connected', 'Verbonden met OpenAI Realtime API');
                this.showStartButtons();
                this.showSuccessMessage('Succesvol verbonden met OpenAI Realtime API!');
                this.sendSessionConfig();
            };
            
            this.ws.onmessage = (event) => {
                this.handleOpenAIMessage(JSON.parse(event.data));
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.connected = false;
                this.updateStatus('error', 'Verbindingsfout');
                this.showErrorMessage('Kon geen verbinding maken met OpenAI Realtime API');
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket connection closed');
                this.connected = false;
                this.updateStatus('error', 'Verbinding verbroken');
            };
            
        } catch (error) {
            console.error('Connection error:', error);
            this.showErrorMessage(`Verbindingsfout: ${error.message}`);
            this.updateStatus('error', 'Verbinding mislukt');
        }
    }
    
    sendSessionConfig() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        
        const config = {
            type: "session.update",
            session: {
                modalities: ["text", "audio"],
                instructions: this.getSystemInstructions(),
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
                    silence_duration_ms: 200
                },
                temperature: 0.7,
                max_response_output_tokens: 4096
            }
        };
        
        this.ws.send(JSON.stringify(config));
        console.log('Session configuration sent');
    }
    
    getSystemInstructions() {
        const askedQuestions = Array.from(this.questionsAsked);
        
        return `Je bent een ervaren Nederlandse cardioloog die een systematische anamnese afneemt.

BELANGRIJKE REGELS:
1. Stel NOOIT dezelfde vraag twee keer
2. Stel één vraag per keer
3. Wees empathisch en professioneel
4. Spreek Nederlands
5. Geef korte, duidelijke antwoorden

REEDS GESTELDE VRAGEN (NIET HERHALEN):
${askedQuestions.join(', ')}

HUIDIGE FASE: ${this.currentPhase}

Analyseer het antwoord van de patiënt, extraheer relevante medische informatie, en stel dan de meest logische vervolgvraag die je nog NIET hebt gesteld.

Begin met: "Wat is uw belangrijkste hartklacht?" als dit de eerste vraag is.`;
    }
    
    handleOpenAIMessage(data) {
        const messageType = data.type;
        console.log('OpenAI message:', messageType, data);
        
        switch (messageType) {
            case 'session.created':
                console.log('Session created successfully');
                break;
                
            case 'session.updated':
                console.log('Session updated successfully');
                break;
                
            case 'input_audio_buffer.speech_started':
                this.updateVoiceStatus('listening', '🎤 Luisteren...');
                break;
                
            case 'input_audio_buffer.speech_stopped':
                this.updateVoiceStatus('processing', '🧠 AI denkt na...');
                break;
                
            case 'response.created':
                console.log('Response created');
                break;
                
            case 'response.output_item.added':
                if (data.item?.type === 'message') {
                    console.log('AI message item added');
                }
                break;
                
            case 'response.content_part.added':
                if (data.part?.type === 'text') {
                    console.log('Text content part added');
                } else if (data.part?.type === 'audio') {
                    console.log('Audio content part added');
                    this.updateVoiceStatus('speaking', '🗣️ AI spreekt...');
                }
                break;
                
            case 'response.audio.delta':
                // Stream audio directly - no processing delay!
                this.playAudioDelta(data.delta);
                break;
                
            case 'response.audio.done':
                this.updateVoiceStatus('ready', '✅ Klaar voor uw antwoord');
                break;
                
            case 'response.text.delta':
                // Handle text streaming
                this.handleTextDelta(data.delta);
                break;
                
            case 'response.text.done':
                // Complete text response
                this.handleTextComplete(data.text);
                break;
                
            case 'response.done':
                console.log('Response completed');
                this.updateVoiceStatus('ready', '✅ Uw beurt om te spreken');
                break;
                
            case 'error':
                console.error('OpenAI error:', data.error);
                this.showErrorMessage(`OpenAI fout: ${data.error.message}`);
                break;
                
            default:
                console.log('Unhandled message type:', messageType);
        }
    }
    
    async startVoiceConversation() {
        try {
            if (!this.connected) {
                this.showErrorMessage('Niet verbonden met OpenAI Realtime API');
                return;
            }
            
            console.log('Starting voice conversation...');
            
            // Initialize audio
            await this.initializeAudio();
            
            // Show conversation area
            this.showConversationArea('voice');
            this.updateVoiceStatus('ready', '🎤 Klik "Start Opname" om te beginnen');
            
        } catch (error) {
            console.error('Failed to start voice conversation:', error);
            this.showErrorMessage(`Kon spraakgesprek niet starten: ${error.message}`);
        }
    }
    
    async initializeAudio() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: this.sampleRate,
                    channelCount: this.channels,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // Initialize audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.sampleRate
            });
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            console.log('Audio initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            
            if (error.name === 'NotAllowedError') {
                this.showErrorMessage('Microfoon toegang geweigerd. Sta microfoon toegang toe in uw browser instellingen.');
            } else if (error.name === 'NotFoundError') {
                this.showErrorMessage('Geen microfoon gevonden. Controleer of uw microfoon is aangesloten.');
            } else {
                this.showErrorMessage('Kon audio niet initialiseren. Controleer uw browser instellingen.');
            }
            
            throw error;
        }
    }
    
    async startContinuousRecording() {
        try {
            if (!this.audioContext) {
                await this.initializeAudio();
            }
            
            // Get microphone stream
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: this.sampleRate,
                    channelCount: this.channels,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // Create audio worklet for real-time processing
            await this.audioContext.audioWorklet.addModule(this.createAudioWorkletProcessor());
            
            const source = this.audioContext.createMediaStreamSource(stream);
            this.audioWorklet = new AudioWorkletNode(this.audioContext, 'realtime-processor');
            
            // Connect audio pipeline
            source.connect(this.audioWorklet);
            
            // Handle audio data from worklet
            this.audioWorklet.port.onmessage = (event) => {
                if (event.data.type === 'audio') {
                    this.sendAudioToOpenAI(event.data.buffer);
                }
            };
            
            this.recording = true;
            this.updateVoiceStatus('listening', '🎤 Opname actief - spreek nu...');
            
            // Update UI
            const recordBtn = document.getElementById('record-btn');
            const stopBtn = document.getElementById('stop-btn');
            
            if (recordBtn) recordBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'inline-block';
            
            console.log('Continuous recording started');
            
        } catch (error) {
            console.error('Failed to start continuous recording:', error);
            this.showErrorMessage('Kon continue opname niet starten');
        }
    }
    
    createAudioWorkletProcessor() {
        const processorCode = `
            class RealtimeProcessor extends AudioWorkletProcessor {
                constructor() {
                    super();
                    this.bufferSize = 4096;
                    this.buffer = new Float32Array(this.bufferSize);
                    this.bufferIndex = 0;
                }
                
                process(inputs, outputs, parameters) {
                    const input = inputs[0];
                    if (input.length > 0) {
                        const inputChannel = input[0];
                        
                        for (let i = 0; i < inputChannel.length; i++) {
                            this.buffer[this.bufferIndex] = inputChannel[i];
                            this.bufferIndex++;
                            
                            if (this.bufferIndex >= this.bufferSize) {
                                // Convert to PCM16 and send
                                const pcm16 = this.floatToPCM16(this.buffer);
                                this.port.postMessage({
                                    type: 'audio',
                                    buffer: pcm16
                                });
                                
                                this.bufferIndex = 0;
                            }
                        }
                    }
                    
                    return true;
                }
                
                floatToPCM16(float32Array) {
                    const pcm16 = new Int16Array(float32Array.length);
                    for (let i = 0; i < float32Array.length; i++) {
                        const s = Math.max(-1, Math.min(1, float32Array[i]));
                        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }
                    return pcm16;
                }
            }
            
            registerProcessor('realtime-processor', RealtimeProcessor);
        `;
        
        const blob = new Blob([processorCode], { type: 'application/javascript' });
        return URL.createObjectURL(blob);
    }
    
    sendAudioToOpenAI(pcm16Buffer) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        
        // Convert PCM16 to base64
        const base64Audio = this.pcm16ToBase64(pcm16Buffer);
        
        // Send audio buffer append message
        const message = {
            type: "input_audio_buffer.append",
            audio: base64Audio
        };
        
        this.ws.send(JSON.stringify(message));
    }
    
    pcm16ToBase64(pcm16Array) {
        const bytes = new Uint8Array(pcm16Array.buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    
    base64ToPCM16(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new Int16Array(bytes.buffer);
    }
    
    playAudioDelta(base64Audio) {
        try {
            if (!this.audioContext) return;
            
            // Convert base64 to PCM16
            const pcm16 = this.base64ToPCM16(base64Audio);
            
            // Convert PCM16 to Float32
            const float32 = new Float32Array(pcm16.length);
            for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32768.0;
            }
            
            // Create audio buffer
            const audioBuffer = this.audioContext.createBuffer(1, float32.length, this.sampleRate);
            audioBuffer.getChannelData(0).set(float32);
            
            // Play audio immediately
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();
            
        } catch (error) {
            console.error('Failed to play audio delta:', error);
        }
    }
    
    stopContinuousRecording() {
        try {
            this.recording = false;
            
            if (this.audioWorklet) {
                this.audioWorklet.disconnect();
                this.audioWorklet = null;
            }
            
            this.updateVoiceStatus('ready', '✅ Opname gestopt');
            
            // Update UI
            const recordBtn = document.getElementById('record-btn');
            const stopBtn = document.getElementById('stop-btn');
            
            if (recordBtn) recordBtn.style.display = 'inline-block';
            if (stopBtn) stopBtn.style.display = 'none';
            
            console.log('Continuous recording stopped');
            
        } catch (error) {
            console.error('Failed to stop continuous recording:', error);
        }
    }
    
    handleTextDelta(delta) {
        // Handle streaming text response
        console.log('Text delta:', delta);
    }
    
    handleTextComplete(text) {
        if (text) {
            this.questionsAsked.add(text);
            this.addMessageToConversation('assistant', text);
            this.updateProgress();
        }
    }
    
    sendTextMessage() {
        try {
            const textInput = document.getElementById('text-input');
            const message = textInput?.value?.trim();
            
            if (!message) return;
            
            if (!this.connected) {
                this.showErrorMessage('Niet verbonden met OpenAI Realtime API');
                return;
            }
            
            // Add user message to conversation
            this.addMessageToConversation('user', message);
            
            // Clear input
            textInput.value = '';
            
            // Send to OpenAI
            const conversationItem = {
                type: "conversation.item.create",
                item: {
                    type: "message",
                    role: "user",
                    content: [{
                        type: "input_text",
                        text: message
                    }]
                }
            };
            
            this.ws.send(JSON.stringify(conversationItem));
            
            // Request response
            const responseCreate = {
                type: "response.create",
                response: {
                    modalities: ["text", "audio"],
                    instructions: this.getSystemInstructions()
                }
            };
            
            this.ws.send(JSON.stringify(responseCreate));
            
        } catch (error) {
            console.error('Failed to send text message:', error);
            this.showErrorMessage('Kon bericht niet verzenden');
        }
    }
    
    addMessageToConversation(role, text) {
        try {
            const messagesContainer = document.getElementById('messages-container');
            if (!messagesContainer) return;
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${role}`;
            
            const timestamp = new Date().toLocaleTimeString('nl-NL');
            messageDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">
                    ${role === 'user' ? 'U' : 'AI Cardioloog'} - ${timestamp}
                </div>
                <div>${text}</div>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Store in conversation history
            this.conversationHistory.push({ role, text, timestamp });
            
        } catch (error) {
            console.error('Failed to add message to conversation:', error);
        }
    }
    
    updateProgress() {
        try {
            const progressContainer = document.getElementById('conversation-progress');
            if (!progressContainer) return;
            
            const questionsCount = this.questionsAsked.size;
            const percentage = Math.min(Math.round((questionsCount / 15) * 100), 100);
            
            progressContainer.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <strong>Huidige fase:</strong> ${this.currentPhase}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Vragen gesteld:</strong> ${questionsCount}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Voortgang:</strong> ${percentage}%
                </div>
                <div style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 20px; overflow: hidden;">
                    <div style="background: #4CAF50; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
                </div>
            `;
            
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    }
    
    updateStatus(type, message) {
        try {
            const indicator = document.getElementById('status-indicator');
            const text = document.getElementById('status-text');
            
            if (indicator) {
                indicator.className = `status-indicator ${type}`;
            }
            
            if (text) {
                text.textContent = message;
            }
            
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    }
    
    updateVoiceStatus(type, message) {
        try {
            const voiceStatus = document.getElementById('voice-status');
            if (!voiceStatus) return;
            
            voiceStatus.className = `voice-status ${type}`;
            voiceStatus.textContent = message;
            voiceStatus.style.display = 'block';
            
        } catch (error) {
            console.error('Failed to update voice status:', error);
        }
    }
    
    showStartButtons() {
        try {
            const startSection = document.getElementById('start-section');
            if (startSection) {
                startSection.style.display = 'grid';
            }
        } catch (error) {
            console.error('Failed to show start buttons:', error);
        }
    }
    
    showConversationArea(mode) {
        try {
            // Hide start section
            const startSection = document.getElementById('start-section');
            if (startSection) {
                startSection.style.display = 'none';
            }
            
            // Show conversation area
            const conversationArea = document.getElementById('conversation-area');
            if (conversationArea) {
                conversationArea.classList.add('active');
            }
            
            // Update title
            const title = document.getElementById('conversation-title');
            if (title) {
                title.textContent = mode === 'voice' ? '🎤 Realtime Spraakgesprek' : '💬 Tekstgesprek';
            }
            
            // Show appropriate controls
            const voiceControls = document.getElementById('voice-controls');
            const textControls = document.getElementById('text-controls');
            
            if (mode === 'voice') {
                if (voiceControls) voiceControls.style.display = 'flex';
                if (textControls) textControls.style.display = 'none';
            } else {
                if (voiceControls) voiceControls.style.display = 'none';
                if (textControls) textControls.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Failed to show conversation area:', error);
        }
    }
    
    goBack() {
        try {
            // Stop recording if active
            if (this.recording) {
                this.stopContinuousRecording();
            }
            
            // Hide conversation area
            const conversationArea = document.getElementById('conversation-area');
            if (conversationArea) {
                conversationArea.classList.remove('active');
            }
            
            // Show start section
            const startSection = document.getElementById('start-section');
            if (startSection) {
                startSection.style.display = 'grid';
            }
            
        } catch (error) {
            console.error('Failed to go back:', error);
        }
    }
    
    showErrorMessage(message) {
        try {
            const errorDiv = document.getElementById('error-message');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                
                // Auto-hide after 10 seconds
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                }, 10000);
            }
            
            console.error('Error:', message);
            
        } catch (error) {
            console.error('Failed to show error message:', error);
        }
    }
    
    showSuccessMessage(message) {
        try {
            const successDiv = document.getElementById('success-message');
            if (successDiv) {
                successDiv.textContent = message;
                successDiv.style.display = 'block';
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    successDiv.style.display = 'none';
                }, 5000);
            }
            
            console.log('Success:', message);
            
        } catch (error) {
            console.error('Failed to show success message:', error);
        }
    }
    
    hideMessages() {
        try {
            const errorDiv = document.getElementById('error-message');
            const successDiv = document.getElementById('success-message');
            
            if (errorDiv) errorDiv.style.display = 'none';
            if (successDiv) successDiv.style.display = 'none';
            
        } catch (error) {
            console.error('Failed to hide messages:', error);
        }
    }
}

// Initialize client when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing True Realtime Client...');
    window.realtimeClient = new TrueRealtimeClient();
    console.log('True Realtime Client initialized');
});

