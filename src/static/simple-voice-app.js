// Simplified Medical Voice Chat App with Working Buttons
class SimpleMedicalVoiceApp {
    constructor() {
        this.realtimeVoice = null;
        this.currentScreen = 'welcome';
        this.conversationHistory = [];
        this.isVoiceMode = false;
        this.apiKey = null;
        this.isConnecting = false;
        
        console.log('Simple Medical Voice Chat App initializing...');
        this.init();
    }
    
    async init() {
        try {
            // Initialize OpenAI Realtime Voice
            this.realtimeVoice = new OpenAIRealtimeVoice();
            this.setupRealtimeEventHandlers();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Simple Medical Voice Chat App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Initialisatie mislukt: ' + error.message);
        }
    }
    
    setupEventListeners() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.bindEventListeners();
            });
        } else {
            this.bindEventListeners();
        }
    }
    
    bindEventListeners() {
        // API Key handling
        const apiKeyInput = document.getElementById('api-key-input');
        const saveApiKeyBtn = document.getElementById('save-api-key');
        
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', () => {
                const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
                if (apiKey) {
                    this.setApiKey(apiKey);
                } else {
                    this.showError('Voer een geldige API key in');
                }
            });
        }
        
        // Start buttons
        const startVoiceBtn = document.getElementById('start-voice-btn');
        const startTextBtn = document.getElementById('start-text-btn');
        
        if (startVoiceBtn) {
            startVoiceBtn.addEventListener('click', () => {
                console.log('Start voice button clicked');
                this.startVoiceConversation();
            });
        }
        
        if (startTextBtn) {
            startTextBtn.addEventListener('click', () => {
                console.log('Start text button clicked');
                this.startTextConversation();
            });
        }
        
        // Voice controls
        const voiceToggle = document.getElementById('voice-toggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('click', () => {
                this.toggleVoiceRecording();
            });
        }
        
        // Text input
        const textInput = document.getElementById('text-input');
        const sendTextBtn = document.getElementById('send-text');
        
        if (sendTextBtn) {
            sendTextBtn.addEventListener('click', () => {
                this.sendTextMessage();
            });
        }
        
        if (textInput) {
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendTextMessage();
                }
            });
        }
        
        console.log('Event listeners bound successfully');
    }
    
    async setApiKey(apiKey) {
        if (this.isConnecting) {
            console.log('Already connecting...');
            return;
        }
        
        try {
            this.isConnecting = true;
            this.updateConnectionStatus('connecting', 'Verbinden...');
            
            // Set API key in realtime voice
            this.realtimeVoice.setApiKey(apiKey);
            
            // Test connection
            await this.realtimeVoice.connectWithAuth();
            
            this.apiKey = apiKey;
            this.updateConnectionStatus('connected', 'Verbonden');
            
            // Enable start buttons
            const startVoiceBtn = document.getElementById('start-voice-btn');
            const startTextBtn = document.getElementById('start-text-btn');
            
            if (startVoiceBtn) startVoiceBtn.disabled = false;
            if (startTextBtn) startTextBtn.disabled = false;
            
            this.showSuccess('OpenAI API verbinding succesvol!');
            
        } catch (error) {
            console.error('API key validation failed:', error);
            this.updateConnectionStatus('error', 'Fout');
            this.showError('API key validatie mislukt: ' + error.message);
        } finally {
            this.isConnecting = false;
        }
    }
    
    updateConnectionStatus(status, text) {
        const statusIndicator = document.getElementById('connection-status');
        const statusText = document.getElementById('connection-text');
        
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${status}`;
        }
        if (statusText) {
            statusText.textContent = text;
        }
    }
    
    setupRealtimeEventHandlers() {
        this.realtimeVoice.on('connected', () => {
            console.log('Connected to OpenAI Realtime API');
            this.updateConnectionStatus('connected', 'Verbonden');
            this.hideError();
        });
        
        this.realtimeVoice.on('disconnected', () => {
            console.log('Disconnected from OpenAI Realtime API');
            this.updateConnectionStatus('ready', 'Klaar');
        });
        
        this.realtimeVoice.on('error', (error) => {
            console.error('OpenAI Realtime error:', error);
            this.showError('OpenAI fout: ' + (error.message || 'Onbekende fout'));
        });
        
        this.realtimeVoice.on('textDelta', (event) => {
            this.handleTextResponse(event.delta);
        });
        
        this.realtimeVoice.on('textDone', (event) => {
            if (event.text) {
                this.addMessage('assistant', event.text, this.isVoiceMode ? 'voice' : 'text');
            }
        });
        
        this.realtimeVoice.on('audioDelta', (event) => {
            // Audio is handled automatically in the OpenAI class
        });
        
        this.realtimeVoice.on('responseDone', (event) => {
            this.handleResponseComplete(event);
        });
        
        this.realtimeVoice.on('recordingStarted', () => {
            this.updateVoiceStatus('listening', 'Luisteren...');
        });
        
        this.realtimeVoice.on('recordingStopped', () => {
            this.updateVoiceStatus('processing', 'Verwerken...');
            // Commit audio and get response
            this.realtimeVoice.commitAudioAndRespond();
        });
        
        this.realtimeVoice.on('audioPlaying', () => {
            this.updateVoiceStatus('speaking', 'AI spreekt...');
        });
    }
    
    async startVoiceConversation() {
        if (!this.apiKey) {
            this.showError('Voer eerst uw OpenAI API key in');
            return;
        }
        
        try {
            console.log('Starting voice conversation...');
            this.isVoiceMode = true;
            this.currentScreen = 'voice';
            
            // Hide welcome screen and show voice screen
            const welcomeScreen = document.getElementById('welcome-screen');
            const voiceScreen = document.getElementById('voice-screen');
            
            if (welcomeScreen) welcomeScreen.style.display = 'none';
            if (voiceScreen) voiceScreen.style.display = 'block';
            
            // Add initial AI message
            this.addMessage('assistant', 'Welkom! Ik ben uw cardiologische AI assistent. Wat is uw belangrijkste hartklacht?', 'voice');
            
            this.updateVoiceStatus('ready', 'Klaar om te beginnen - klik op de microfoon');
            
        } catch (error) {
            console.error('Failed to start voice conversation:', error);
            this.showError('Kon spraakgesprek niet starten: ' + error.message);
        }
    }
    
    startTextConversation() {
        if (!this.apiKey) {
            this.showError('Voer eerst uw OpenAI API key in');
            return;
        }
        
        console.log('Starting text conversation...');
        this.isVoiceMode = false;
        this.currentScreen = 'text';
        
        // Hide welcome screen and show text screen
        const welcomeScreen = document.getElementById('welcome-screen');
        const textScreen = document.getElementById('text-screen');
        
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (textScreen) textScreen.style.display = 'block';
        
        // Add initial AI message
        this.addMessage('assistant', 'Welkom! Ik ben uw cardiologische AI assistent. Wat is uw belangrijkste hartklacht?', 'text');
    }
    
    async toggleVoiceRecording() {
        try {
            if (!this.realtimeVoice.isRecording) {
                await this.realtimeVoice.startRecording();
                const voiceToggle = document.getElementById('voice-toggle');
                if (voiceToggle) {
                    voiceToggle.innerHTML = '<span class="voice-icon">⏹️</span><span>Stop Opname</span>';
                }
            } else {
                this.realtimeVoice.stopRecording();
                const voiceToggle = document.getElementById('voice-toggle');
                if (voiceToggle) {
                    voiceToggle.innerHTML = '<span class="voice-icon">🎤</span><span>Start Opname</span>';
                }
            }
        } catch (error) {
            console.error('Error toggling voice recording:', error);
            this.showError('Microfoon fout: ' + error.message);
        }
    }
    
    sendTextMessage() {
        const textInput = document.getElementById('text-input');
        if (!textInput) return;
        
        const message = textInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addMessage('user', message, 'text');
        
        // Send to OpenAI
        this.realtimeVoice.sendTextMessage(message);
        
        // Clear input
        textInput.value = '';
    }
    
    addMessage(role, content, mode) {
        const container = mode === 'voice' ? 
            document.getElementById('voice-chat-container') : 
            document.getElementById('text-chat-container');
        
        if (!container) {
            console.error('Chat container not found for mode:', mode);
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const timestamp = new Date().toLocaleTimeString('nl-NL');
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="role">${role === 'assistant' ? '🤖 AI Cardioloog' : '👤 Patiënt'}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${content}</div>
            ${role === 'assistant' ? '<button class="repeat-btn" onclick="window.speechSynthesis.speak(new SpeechSynthesisUtterance(\'' + content.replace(/'/g, "\\'") + '\'))">🔊 Herhaal</button>' : ''}
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        
        // Update conversation history
        this.conversationHistory.push({ role, content, timestamp });
        
        // If it's an assistant message in voice mode, speak it
        if (role === 'assistant' && mode === 'voice') {
            this.speakText(content);
        }
    }
    
    speakText(text) {
        try {
            // Use browser's speech synthesis as fallback
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'nl-NL';
            utterance.rate = 1.1;
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Error speaking text:', error);
        }
    }
    
    handleTextResponse(delta) {
        // Handle streaming text response
        console.log('Text delta:', delta);
    }
    
    handleResponseComplete(event) {
        // Handle complete response
        console.log('Response complete:', event);
        this.updateVoiceStatus('ready', 'Klaar voor volgende vraag');
    }
    
    updateVoiceStatus(status, text) {
        const statusElement = document.getElementById('voice-status');
        if (statusElement) {
            statusElement.textContent = text;
            statusElement.className = `voice-status ${status}`;
        }
    }
    
    showError(message) {
        console.error('Error:', message);
        
        // Show error in UI
        let errorContainer = document.getElementById('error-container');
        if (!errorContainer) {
            // Create error container if it doesn't exist
            errorContainer = document.createElement('div');
            errorContainer.id = 'error-container';
            errorContainer.className = 'error-container';
            errorContainer.innerHTML = `
                <div class="error-message">
                    <span class="error-icon">⚠️</span>
                    <span id="error-text">${message}</span>
                    <button class="error-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
                </div>
            `;
            document.body.appendChild(errorContainer);
        } else {
            const errorText = document.getElementById('error-text');
            if (errorText) errorText.textContent = message;
        }
        
        errorContainer.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (errorContainer) errorContainer.style.display = 'none';
        }, 10000);
    }
    
    hideError() {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    }
    
    showSuccess(message) {
        console.log('Success:', message);
        this.hideError();
        
        // You could implement a success notification here
        // For now, just log it
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Simple Medical Voice Chat App...');
    window.simpleMedicalVoiceApp = new SimpleMedicalVoiceApp();
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, initializing Simple Medical Voice Chat App...');
    window.simpleMedicalVoiceApp = new SimpleMedicalVoiceApp();
}

// Export for global access
if (typeof window !== 'undefined') {
    window.SimpleMedicalVoiceApp = SimpleMedicalVoiceApp;
}

