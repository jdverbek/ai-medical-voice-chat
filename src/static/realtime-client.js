// Working OpenAI Realtime API Client with comprehensive error handling
class RealtimeVoiceClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.recording = false;
        this.mediaRecorder = null;
        this.audioContext = null;
        this.audioQueue = [];
        this.isPlaying = false;
        this.conversationHistory = [];
        this.currentPhase = 'hoofdklacht';
        this.questionsAsked = 0;
        
        // Audio configuration
        this.sampleRate = 24000;
        this.bufferSize = 4096;
        
        this.initializeEventListeners();
        this.initializeSocket();
        
        console.log('RealtimeVoiceClient initialized');
    }
    
    initializeSocket() {
        try {
            // Initialize Socket.IO connection
            this.socket = io({
                transports: ['websocket', 'polling'],
                timeout: 20000,
                forceNew: true
            });
            
            this.socket.on('connect', () => {
                console.log('Socket.IO connected');
                this.updateStatus('connected', 'Verbonden met server');
            });
            
            this.socket.on('disconnect', () => {
                console.log('Socket.IO disconnected');
                this.connected = false;
                this.updateStatus('error', 'Verbinding verbroken');
            });
            
            this.socket.on('realtime_connected', (data) => {
                console.log('OpenAI Realtime API connected:', data);
                this.connected = true;
                this.currentPhase = data.phase || 'hoofdklacht';
                this.updateStatus('connected', 'OpenAI Realtime API verbonden');
                this.showStartButtons();
                this.showSuccessMessage('Succesvol verbonden met OpenAI Realtime API!');
            });
            
            this.socket.on('realtime_error', (data) => {
                console.error('Realtime API error:', data);
                this.connected = false;
                this.updateStatus('error', `Fout: ${data.message}`);
                this.showErrorMessage(data.message);
            });
            
            this.socket.on('ai_response', (data) => {
                console.log('AI response received:', data);
                this.handleAIResponse(data);
            });
            
            this.socket.on('audio_delta', (data) => {
                this.handleAudioDelta(data.audio);
            });
            
            this.socket.on('audio_done', () => {
                this.handleAudioDone();
            });
            
            this.socket.on('speech_started', () => {
                this.updateVoiceStatus('listening', 'AI luistert...');
            });
            
            this.socket.on('speech_stopped', () => {
                this.updateVoiceStatus('processing', 'AI verwerkt...');
            });
            
        } catch (error) {
            console.error('Failed to initialize socket:', error);
            this.showErrorMessage('Kon geen verbinding maken met de server');
        }
    }
    
    initializeEventListeners() {
        // API Key connection
        const saveButton = document.getElementById('save-api-key');
        const apiKeyInput = document.getElementById('api-key-input');
        
        if (saveButton) {
            saveButton.addEventListener('click', () => this.connectToRealtime());
        }
        
        if (apiKeyInput) {
            apiKeyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.connectToRealtime();
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
        
        // Voice controls
        const recordBtn = document.getElementById('record-btn');
        const stopBtn = document.getElementById('stop-btn');
        
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.startRecording());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopRecording());
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
    
    async connectToRealtime() {
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
            
            // Connect via Socket.IO
            this.socket.emit('connect_realtime', {
                api_key: apiKey
            });
            
            console.log('Connection request sent to OpenAI Realtime API');
            
        } catch (error) {
            console.error('Connection error:', error);
            this.showErrorMessage(`Verbindingsfout: ${error.message}`);
            this.updateStatus('error', 'Verbinding mislukt');
        }
    }
    
    async startVoiceConversation() {
        try {
            if (!this.connected) {
                this.showErrorMessage('Niet verbonden met OpenAI Realtime API');
                return;
            }
            
            console.log('Starting voice conversation...');
            
            // Initialize audio context
            await this.initializeAudio();
            
            // Show conversation area
            this.showConversationArea('voice');
            this.updateVoiceStatus('ready', 'Klaar om te beginnen - klik op "Start Opname"');
            
        } catch (error) {
            console.error('Failed to start voice conversation:', error);
            this.showErrorMessage(`Kon spraakgesprek niet starten: ${error.message}`);
        }
    }
    
    async startTextConversation() {
        try {
            if (!this.connected) {
                this.showErrorMessage('Niet verbonden met OpenAI Realtime API');
                return;
            }
            
            console.log('Starting text conversation...');
            
            // Show conversation area
            this.showConversationArea('text');
            
        } catch (error) {
            console.error('Failed to start text conversation:', error);
            this.showErrorMessage(`Kon tekstgesprek niet starten: ${error.message}`);
        }
    }
    
    async initializeAudio() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: this.sampleRate,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
            
            // Initialize audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.sampleRate
            });
            
            // Create media recorder
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.processAudioData(event.data);
                }
            };
            
            console.log('Audio initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            this.showErrorMessage('Kon geen toegang krijgen tot de microfoon. Controleer uw browser instellingen.');
            throw error;
        }
    }
    
    async processAudioData(audioBlob) {
        try {
            // Convert blob to array buffer
            const arrayBuffer = await audioBlob.arrayBuffer();
            
            // Convert to base64 for transmission
            const base64Audio = this.arrayBufferToBase64(arrayBuffer);
            
            // Send to server
            this.socket.emit('send_audio', {
                audio: base64Audio
            });
            
        } catch (error) {
            console.error('Failed to process audio data:', error);
        }
    }
    
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    
    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
    
    startRecording() {
        try {
            if (!this.mediaRecorder) {
                this.showErrorMessage('Audio niet geïnitialiseerd');
                return;
            }
            
            this.recording = true;
            this.mediaRecorder.start(100); // Collect data every 100ms
            
            this.updateVoiceStatus('listening', 'Luisteren... Spreek nu');
            
            // Update UI
            const recordBtn = document.getElementById('record-btn');
            const stopBtn = document.getElementById('stop-btn');
            
            if (recordBtn) recordBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'inline-block';
            
            console.log('Recording started');
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.showErrorMessage('Kon opname niet starten');
        }
    }
    
    stopRecording() {
        try {
            if (!this.mediaRecorder || !this.recording) {
                return;
            }
            
            this.recording = false;
            this.mediaRecorder.stop();
            
            this.updateVoiceStatus('processing', 'Verwerken...');
            
            // Update UI
            const recordBtn = document.getElementById('record-btn');
            const stopBtn = document.getElementById('stop-btn');
            
            if (recordBtn) recordBtn.style.display = 'inline-block';
            if (stopBtn) stopBtn.style.display = 'none';
            
            // Commit audio to OpenAI
            this.socket.emit('commit_audio');
            
            console.log('Recording stopped');
            
        } catch (error) {
            console.error('Failed to stop recording:', error);
            this.showErrorMessage('Kon opname niet stoppen');
        }
    }
    
    sendTextMessage() {
        try {
            const textInput = document.getElementById('text-input');
            const message = textInput?.value?.trim();
            
            if (!message) {
                return;
            }
            
            if (!this.connected) {
                this.showErrorMessage('Niet verbonden met OpenAI Realtime API');
                return;
            }
            
            // Add user message to conversation
            this.addMessageToConversation('user', message);
            
            // Clear input
            textInput.value = '';
            
            // Send to OpenAI (implement text sending)
            console.log('Sending text message:', message);
            
        } catch (error) {
            console.error('Failed to send text message:', error);
            this.showErrorMessage('Kon bericht niet verzenden');
        }
    }
    
    handleAIResponse(data) {
        try {
            const { text, phase, questions_asked, total_phases } = data;
            
            // Update conversation state
            this.currentPhase = phase;
            this.questionsAsked = questions_asked;
            
            // Add AI message to conversation
            this.addMessageToConversation('assistant', text);
            
            // Update progress
            this.updateProgress(phase, questions_asked, total_phases);
            
            // Update voice status
            this.updateVoiceStatus('ready', 'Klaar voor uw antwoord');
            
            console.log(`AI response: ${text} (Phase: ${phase}, Questions: ${questions_asked})`);
            
        } catch (error) {
            console.error('Failed to handle AI response:', error);
        }
    }
    
    handleAudioDelta(audioData) {
        try {
            // Add audio to queue for playback
            this.audioQueue.push(audioData);
            
            // Start playback if not already playing
            if (!this.isPlaying) {
                this.playAudioQueue();
            }
            
        } catch (error) {
            console.error('Failed to handle audio delta:', error);
        }
    }
    
    handleAudioDone() {
        try {
            this.updateVoiceStatus('ready', 'AI heeft gesproken - uw beurt');
            console.log('Audio playback completed');
            
        } catch (error) {
            console.error('Failed to handle audio done:', error);
        }
    }
    
    async playAudioQueue() {
        if (this.isPlaying || this.audioQueue.length === 0) {
            return;
        }
        
        try {
            this.isPlaying = true;
            this.updateVoiceStatus('speaking', 'AI spreekt...');
            
            while (this.audioQueue.length > 0) {
                const audioData = this.audioQueue.shift();
                await this.playAudioChunk(audioData);
            }
            
        } catch (error) {
            console.error('Failed to play audio queue:', error);
        } finally {
            this.isPlaying = false;
        }
    }
    
    async playAudioChunk(base64Audio) {
        try {
            if (!this.audioContext) {
                return;
            }
            
            // Convert base64 to array buffer
            const arrayBuffer = this.base64ToArrayBuffer(base64Audio);
            
            // Decode audio data
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Create and play audio source
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();
            
            // Wait for audio to finish
            return new Promise((resolve) => {
                source.onended = resolve;
            });
            
        } catch (error) {
            console.error('Failed to play audio chunk:', error);
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
    
    updateProgress(phase, questionsAsked, totalPhases) {
        try {
            const progressContainer = document.getElementById('conversation-progress');
            if (!progressContainer) return;
            
            const phaseNames = {
                'hoofdklacht': 'Hoofdklacht',
                'symptomen': 'Symptomen',
                'triggers': 'Triggers',
                'voorgeschiedenis': 'Voorgeschiedenis',
                'medicatie': 'Medicatie',
                'familie': 'Familie anamnese',
                'leefstijl': 'Leefstijl'
            };
            
            const phaseName = phaseNames[phase] || phase;
            const percentage = Math.round((questionsAsked / 20) * 100); // Estimate 20 total questions
            
            progressContainer.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <strong>Huidige fase:</strong> ${phaseName}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Vragen gesteld:</strong> ${questionsAsked}
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
                title.textContent = mode === 'voice' ? '🎤 Spraakgesprek' : '💬 Tekstgesprek';
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
            
            // Stop recording if active
            if (this.recording) {
                this.stopRecording();
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
    console.log('DOM loaded, initializing Realtime Voice Client...');
    window.realtimeClient = new RealtimeVoiceClient();
    console.log('Realtime Voice Client initialized');
});

