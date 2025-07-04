// Intelligent Medical Voice Chat App with Real OpenAI Realtime API
class IntelligentVoiceApp {
    constructor() {
        this.realtimeClient = null;
        this.apiKey = null;
        this.isConnected = false;
        this.currentMode = null;
        this.conversationActive = false;
        this.currentAudioElement = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        console.log('Intelligent Voice App initialized');
    }
    
    bindEvents() {
        // API Key handling
        document.getElementById('save-api-key').addEventListener('click', () => {
            this.saveApiKey();
        });
        
        // Start buttons
        document.getElementById('start-voice-btn')?.addEventListener('click', () => {
            this.startVoiceMode();
        });
        
        document.getElementById('start-text-btn')?.addEventListener('click', () => {
            this.startTextMode();
        });
        
        // Voice controls
        document.getElementById('record-btn')?.addEventListener('click', () => {
            this.startRecording();
        });
        
        document.getElementById('stop-btn')?.addEventListener('click', () => {
            this.stopRecording();
        });
        
        // Text controls
        document.getElementById('send-btn')?.addEventListener('click', () => {
            this.sendTextMessage();
        });
        
        document.getElementById('text-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendTextMessage();
            }
        });
        
        // Back button
        document.getElementById('back-btn')?.addEventListener('click', () => {
            this.goBack();
        });
    }
    
    async saveApiKey() {
        const apiKey = document.getElementById('api-key-input').value.trim();
        
        if (!apiKey) {
            this.showError('Voer een geldige API key in');
            return;
        }
        
        if (!apiKey.startsWith('sk-')) {
            this.showError('API key moet beginnen met "sk-"');
            return;
        }
        
        this.updateStatus('connecting', 'OpenAI Realtime API verbinden...');
        
        try {
            // Initialize OpenAI Realtime Client
            this.realtimeClient = new OpenAIRealtimeClient();
            this.realtimeClient.setApiKey(apiKey);
            
            // Setup event listeners
            this.setupRealtimeEventListeners();
            
            // Test connection
            await this.realtimeClient.connect();
            
            this.apiKey = apiKey;
            this.isConnected = true;
            
            this.updateStatus('connected', 'OpenAI Realtime API verbonden');
            this.showSuccess('OpenAI Realtime API succesvol verbonden! Kies uw conversatie modus.');
            
            // Show start options
            document.getElementById('start-section').style.display = 'grid';
            
        } catch (error) {
            console.error('OpenAI Realtime API connection failed:', error);
            this.updateStatus('error', 'Verbinding mislukt');
            this.showError('OpenAI Realtime API verbinding mislukt: ' + error.message);
        }
    }
    
    setupRealtimeEventListeners() {
        this.realtimeClient.on('connected', () => {
            console.log('OpenAI Realtime API connected');
            this.updateStatus('connected', 'Realtime API verbonden');
        });
        
        this.realtimeClient.on('disconnected', () => {
            console.log('OpenAI Realtime API disconnected');
            this.updateStatus('ready', 'Verbinding verbroken');
        });
        
        this.realtimeClient.on('error', (error) => {
            console.error('OpenAI Realtime API error:', error);
            this.showError('Realtime API fout: ' + (error.message || 'Onbekende fout'));
        });
        
        this.realtimeClient.on('text_done', (event) => {
            if (event.text) {
                this.addMessage('assistant', event.text, this.currentMode);
                this.updateConversationProgress();
            }
        });
        
        this.realtimeClient.on('recording_started', () => {
            this.updateVoiceStatus('listening', '🎤 Luisteren... spreek nu');
            document.getElementById('record-btn').style.display = 'none';
            document.getElementById('stop-btn').style.display = 'inline-block';
        });
        
        this.realtimeClient.on('recording_stopped', () => {
            this.updateVoiceStatus('processing', '⏳ Verwerken...');
            document.getElementById('record-btn').style.display = 'inline-block';
            document.getElementById('stop-btn').style.display = 'none';
        });
        
        this.realtimeClient.on('speech_started', () => {
            this.updateVoiceStatus('user_speaking', '👤 U spreekt...');
        });
        
        this.realtimeClient.on('speech_stopped', () => {
            this.updateVoiceStatus('processing', '🤖 AI verwerkt...');
        });
        
        this.realtimeClient.on('response_done', () => {
            this.updateVoiceStatus('ready', '✅ Klaar voor volgende vraag');
        });
    }
    
    startVoiceMode() {
        this.currentMode = 'voice';
        this.conversationActive = true;
        this.showConversationArea('🎤 Spraakgesprek Modus - OpenAI Realtime API');
        
        document.getElementById('voice-controls').style.display = 'flex';
        document.getElementById('text-controls').style.display = 'none';
        
        // Start with initial cardiological question
        this.addMessage('assistant', 'Welkom! Ik ben uw cardiologische AI assistent met OpenAI Realtime API. Klik op "Start Opname" en vertel mij wat uw belangrijkste hartklacht is.', 'voice');
        
        this.updateVoiceStatus('ready', 'Klik op "🎤 Start Opname" om te beginnen');
        this.showSuccess('Spraakgesprek modus geactiveerd met OpenAI Realtime API!');
    }
    
    startTextMode() {
        this.currentMode = 'text';
        this.conversationActive = true;
        this.showConversationArea('💬 Tekstgesprek Modus - OpenAI Realtime API');
        
        document.getElementById('voice-controls').style.display = 'none';
        document.getElementById('text-controls').style.display = 'block';
        
        // Start with initial cardiological question
        this.addMessage('assistant', 'Welkom! Ik ben uw cardiologische AI assistent met OpenAI Realtime API. Wat is uw belangrijkste hartklacht?', 'text');
        
        this.showSuccess('Tekstgesprek modus geactiveerd met OpenAI Realtime API!');
    }
    
    showConversationArea(title) {
        document.getElementById('conversation-title').textContent = title;
        document.getElementById('conversation-area').classList.add('active');
        document.getElementById('start-section').style.display = 'none';
    }
    
    async startRecording() {
        if (!this.realtimeClient || !this.isConnected) {
            this.showError('Geen verbinding met OpenAI Realtime API');
            return;
        }
        
        try {
            await this.realtimeClient.startRecording();
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showError('Microfoon fout: ' + error.message);
        }
    }
    
    stopRecording() {
        if (this.realtimeClient) {
            this.realtimeClient.stopRecording();
        }
    }
    
    sendTextMessage() {
        const input = document.getElementById('text-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (!this.realtimeClient || !this.isConnected) {
            this.showError('Geen verbinding met OpenAI Realtime API');
            return;
        }
        
        // Add user message to chat
        this.addMessage('user', message, 'text');
        
        // Send to OpenAI Realtime API
        this.realtimeClient.sendTextMessage(message);
        
        // Clear input
        input.value = '';
        
        this.updateVoiceStatus('processing', '🤖 AI verwerkt uw bericht...');
    }
    
    addMessage(role, content, mode) {
        const container = document.getElementById('messages-container');
        if (!container) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const timestamp = new Date().toLocaleTimeString('nl-NL');
        
        messageDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong>${role === 'assistant' ? '🤖 AI Cardioloog (Realtime API)' : '👤 Patiënt'}</strong>
                <span style="opacity: 0.7; font-size: 0.9rem;">${timestamp}</span>
            </div>
            <div style="margin-bottom: 8px;">${content}</div>
            ${role === 'assistant' ? `
                <button onclick="window.speechSynthesis.speak(new SpeechSynthesisUtterance('${content.replace(/'/g, "\\'")}'))" 
                        style="padding: 5px 10px; background: rgba(255,255,255,0.2); border: none; border-radius: 5px; color: white; cursor: pointer; margin-right: 10px;">
                    🔊 Herhaal
                </button>
                <span style="font-size: 0.8rem; opacity: 0.8;">
                    Vraag ${this.realtimeClient ? this.realtimeClient.askedQuestions.size + 1 : '?'} | 
                    Fase: ${this.realtimeClient ? this.realtimeClient.currentPhase : 'onbekend'}
                </span>
            ` : ''}
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        
        // Auto-speak assistant messages in voice mode
        if (role === 'assistant' && mode === 'voice') {
            this.speakText(content);
        }
    }
    
    speakText(text) {
        try {
            // Stop any current speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'nl-NL';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            
            // Try to find a Dutch voice
            const voices = speechSynthesis.getVoices();
            const dutchVoice = voices.find(voice => voice.lang.startsWith('nl'));
            if (dutchVoice) {
                utterance.voice = dutchVoice;
            }
            
            utterance.onstart = () => {
                this.updateVoiceStatus('speaking', '🔊 AI spreekt...');
            };
            
            utterance.onend = () => {
                this.updateVoiceStatus('ready', '✅ Klaar voor volgende vraag');
            };
            
            window.speechSynthesis.speak(utterance);
            
        } catch (error) {
            console.error('Speech synthesis error:', error);
        }
    }
    
    updateConversationProgress() {
        if (!this.realtimeClient) return;
        
        const summary = this.realtimeClient.getConversationSummary();
        const progressElement = document.getElementById('conversation-progress');
        
        if (progressElement) {
            const progressPercentage = Math.min(100, (summary.totalQuestions / 15) * 100);
            progressElement.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong>Anamnese Voortgang: ${Math.round(progressPercentage)}%</strong>
                </div>
                <div style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 20px; overflow: hidden;">
                    <div style="background: #4CAF50; height: 100%; width: ${progressPercentage}%; transition: width 0.3s ease;"></div>
                </div>
                <div style="margin-top: 10px; font-size: 0.9rem;">
                    <div>📊 Vragen gesteld: ${summary.totalQuestions}</div>
                    <div>📋 Huidige fase: ${summary.currentPhase}</div>
                    <div>🩺 Symptomen: ${summary.patientData.symptoms.length}</div>
                    <div>💊 Medicijnen: ${summary.patientData.medications.length}</div>
                </div>
            `;
        }
    }
    
    goBack() {
        if (this.realtimeClient) {
            this.realtimeClient.disconnect();
        }
        
        document.getElementById('conversation-area').classList.remove('active');
        document.getElementById('start-section').style.display = 'grid';
        document.getElementById('messages-container').innerHTML = '';
        
        this.conversationActive = false;
        this.currentMode = null;
        
        // Stop any ongoing speech
        window.speechSynthesis.cancel();
    }
    
    updateStatus(status, text) {
        const indicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (indicator) indicator.className = `status-indicator ${status}`;
        if (statusText) statusText.textContent = text;
    }
    
    updateVoiceStatus(status, text) {
        const statusElement = document.getElementById('voice-status');
        if (statusElement) {
            statusElement.textContent = text;
            statusElement.className = `voice-status ${status}`;
        }
        
        // Also update main status
        this.updateStatus(status === 'ready' ? 'connected' : 'connecting', text);
    }
    
    showError(message) {
        console.error('Error:', message);
        
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 8000);
        }
    }
    
    showSuccess(message) {
        console.log('Success:', message);
        
        const successDiv = document.getElementById('success-message');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Intelligent Voice App...');
    window.intelligentVoiceApp = new IntelligentVoiceApp();
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, initializing Intelligent Voice App...');
    window.intelligentVoiceApp = new IntelligentVoiceApp();
}

// Export for global access
if (typeof window !== 'undefined') {
    window.IntelligentVoiceApp = IntelligentVoiceApp;
}

