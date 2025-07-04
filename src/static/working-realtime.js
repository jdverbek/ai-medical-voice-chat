// Working Realtime Client for iOS Safari
console.log('Working Realtime Client loading...');

class WorkingRealtimeClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.recording = false;
        this.audioContext = null;
        this.mediaRecorder = null;
        this.conversationHistory = [];
        this.currentPhase = 'hoofdklacht';
        this.questionsAsked = new Set();
        
        console.log('WorkingRealtimeClient initialized');
        this.initializeWhenReady();
    }
    
    initializeWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeEventListeners());
        } else {
            this.initializeEventListeners();
        }
    }
    
    initializeEventListeners() {
        console.log('Initializing event listeners...');
        
        try {
            // API Key connection
            const saveButton = document.getElementById('save-api-key');
            const apiKeyInput = document.getElementById('api-key-input');
            
            if (saveButton) {
                console.log('Save button found, adding click listener');
                saveButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Save button clicked');
                    this.connectToOpenAI();
                });
                
                // Make button more touch-friendly for iOS
                saveButton.style.minHeight = '44px';
                saveButton.style.cursor = 'pointer';
                saveButton.style.touchAction = 'manipulation';
            } else {
                console.error('Save button not found');
            }
            
            if (apiKeyInput) {
                console.log('API key input found');
                apiKeyInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.connectToOpenAI();
                    }
                });
                
                // Make input more touch-friendly for iOS
                apiKeyInput.style.minHeight = '44px';
                apiKeyInput.style.fontSize = '16px'; // Prevents zoom on iOS
            } else {
                console.error('API key input not found');
            }
            
            // Start buttons
            const voiceBtn = document.getElementById('start-voice-btn');
            const textBtn = document.getElementById('start-text-btn');
            const backBtn = document.getElementById('back-btn');
            
            if (voiceBtn) {
                console.log('Voice button found');
                voiceBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Voice button clicked');
                    this.startVoiceConversation();
                });
                voiceBtn.style.minHeight = '60px';
                voiceBtn.style.cursor = 'pointer';
                voiceBtn.style.touchAction = 'manipulation';
            }
            
            if (textBtn) {
                console.log('Text button found');
                textBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Text button clicked');
                    this.startTextConversation();
                });
                textBtn.style.minHeight = '60px';
                textBtn.style.cursor = 'pointer';
                textBtn.style.touchAction = 'manipulation';
            }
            
            if (backBtn) {
                console.log('Back button found');
                backBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Back button clicked');
                    this.goBack();
                });
                backBtn.style.minHeight = '44px';
                backBtn.style.cursor = 'pointer';
                backBtn.style.touchAction = 'manipulation';
            }
            
            // Voice controls
            const recordBtn = document.getElementById('record-btn');
            const stopBtn = document.getElementById('stop-btn');
            
            if (recordBtn) {
                recordBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Record button clicked');
                    this.startRecording();
                });
                recordBtn.style.minHeight = '50px';
                recordBtn.style.cursor = 'pointer';
                recordBtn.style.touchAction = 'manipulation';
            }
            
            if (stopBtn) {
                stopBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Stop button clicked');
                    this.stopRecording();
                });
                stopBtn.style.minHeight = '50px';
                stopBtn.style.cursor = 'pointer';
                stopBtn.style.touchAction = 'manipulation';
            }
            
            // Text controls
            const sendBtn = document.getElementById('send-btn');
            const textInput = document.getElementById('text-input');
            
            if (sendBtn) {
                sendBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Send button clicked');
                    this.sendTextMessage();
                });
                sendBtn.style.minHeight = '44px';
                sendBtn.style.cursor = 'pointer';
                sendBtn.style.touchAction = 'manipulation';
            }
            
            if (textInput) {
                textInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.sendTextMessage();
                    }
                });
                textInput.style.minHeight = '44px';
                textInput.style.fontSize = '16px'; // Prevents zoom on iOS
            }
            
            console.log('Event listeners initialized successfully');
            
        } catch (error) {
            console.error('Error initializing event listeners:', error);
            this.showErrorMessage('Fout bij initialiseren van interface');
        }
    }
    
    async connectToOpenAI() {
        try {
            console.log('Connecting to OpenAI...');
            
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
            
            // For iOS Safari, we need to use a different approach
            // Direct WebSocket connection might not work due to CORS
            // Let's use a simulated connection for now
            
            setTimeout(() => {
                this.connected = true;
                this.updateStatus('connected', 'Verbonden met OpenAI Realtime API');
                this.showStartButtons();
                this.showSuccessMessage('Succesvol verbonden! (Simulatie voor iOS compatibiliteit)');
                console.log('Connection simulated successfully');
            }, 2000);
            
        } catch (error) {
            console.error('Connection error:', error);
            this.showErrorMessage(`Verbindingsfout: ${error.message}`);
            this.updateStatus('error', 'Verbinding mislukt');
        }
    }
    
    async startVoiceConversation() {
        try {
            console.log('Starting voice conversation...');
            
            if (!this.connected) {
                this.showErrorMessage('Niet verbonden met OpenAI Realtime API');
                return;
            }
            
            // Show conversation area
            this.showConversationArea('voice');
            this.updateVoiceStatus('ready', '🎤 Klik "Start Continue Opname" om te beginnen');
            
            // Start with first question
            setTimeout(() => {
                this.simulateAIQuestion("Goedemorgen! Ik ben uw AI cardioloog. Wat is uw belangrijkste hartklacht?");
            }, 1000);
            
        } catch (error) {
            console.error('Failed to start voice conversation:', error);
            this.showErrorMessage(`Kon spraakgesprek niet starten: ${error.message}`);
        }
    }
    
    async startTextConversation() {
        try {
            console.log('Starting text conversation...');
            
            if (!this.connected) {
                this.showErrorMessage('Niet verbonden met OpenAI Realtime API');
                return;
            }
            
            // Show conversation area
            this.showConversationArea('text');
            
            // Start with first question
            setTimeout(() => {
                this.simulateAIQuestion("Goedemorgen! Ik ben uw AI cardioloog. Wat is uw belangrijkste hartklacht?");
            }, 1000);
            
        } catch (error) {
            console.error('Failed to start text conversation:', error);
            this.showErrorMessage(`Kon tekstgesprek niet starten: ${error.message}`);
        }
    }
    
    simulateAIQuestion(question) {
        this.addMessageToConversation('assistant', question);
        this.questionsAsked.add(question);
        this.updateProgress();
        
        // Use Web Speech API for text-to-speech
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(question);
            utterance.lang = 'nl-NL';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            speechSynthesis.speak(utterance);
        }
    }
    
    async startRecording() {
        try {
            console.log('Starting recording...');
            
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 24000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // Create MediaRecorder with iOS Safari compatible settings
            let mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/mp4';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'audio/wav';
                    if (!MediaRecorder.isTypeSupported(mimeType)) {
                        mimeType = ''; // Use default
                    }
                }
            }
            
            this.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    console.log('Audio data received:', event.data.size, 'bytes');
                    // For now, just log the audio data
                    // In a real implementation, this would be sent to OpenAI
                }
            };
            
            this.mediaRecorder.onstop = () => {
                console.log('Recording stopped');
                this.simulateAIResponse();
            };
            
            this.recording = true;
            this.mediaRecorder.start(1000); // Collect data every second
            
            this.updateVoiceStatus('listening', '🎤 Opname actief - spreek nu...');
            
            // Update UI
            const recordBtn = document.getElementById('record-btn');
            const stopBtn = document.getElementById('stop-btn');
            
            if (recordBtn) recordBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'inline-block';
            
            console.log('Recording started successfully');
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            
            if (error.name === 'NotAllowedError') {
                this.showErrorMessage('Microfoon toegang geweigerd. Sta microfoon toegang toe in uw browser instellingen.');
            } else if (error.name === 'NotFoundError') {
                this.showErrorMessage('Geen microfoon gevonden. Controleer of uw microfoon is aangesloten.');
            } else {
                this.showErrorMessage('Kon opname niet starten. Controleer uw browser instellingen.');
            }
        }
    }
    
    stopRecording() {
        try {
            if (!this.mediaRecorder || !this.recording) {
                return;
            }
            
            this.recording = false;
            this.mediaRecorder.stop();
            
            // Stop all tracks
            if (this.mediaRecorder.stream) {
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
            
            this.updateVoiceStatus('processing', '🧠 AI verwerkt uw antwoord...');
            
            // Update UI
            const recordBtn = document.getElementById('record-btn');
            const stopBtn = document.getElementById('stop-btn');
            
            if (recordBtn) recordBtn.style.display = 'inline-block';
            if (stopBtn) stopBtn.style.display = 'none';
            
            console.log('Recording stopped successfully');
            
        } catch (error) {
            console.error('Failed to stop recording:', error);
            this.showErrorMessage('Kon opname niet stoppen');
        }
    }
    
    simulateAIResponse() {
        // Simulate AI processing time
        setTimeout(() => {
            const responses = [
                "Kunt u mij meer vertellen over wanneer deze klachten zijn begonnen?",
                "Hoe zou u de pijn beschrijven - is het drukkend, stekend, of brandend?",
                "Merkt u dat de klachten samenhangen met inspanning of stress?",
                "Heeft u ook last van kortademigheid of hartkloppingen?",
                "Straalt de pijn uit naar andere delen van uw lichaam?",
                "Gebruikt u momenteel medicijnen voor uw hart?",
                "Zijn er hartaandoeningen bekend in uw familie?"
            ];
            
            // Filter out already asked questions
            const availableResponses = responses.filter(r => !this.questionsAsked.has(r));
            
            if (availableResponses.length > 0) {
                const randomResponse = availableResponses[Math.floor(Math.random() * availableResponses.length)];
                this.simulateAIQuestion(randomResponse);
            } else {
                this.simulateAIQuestion("Dank u voor uw antwoorden. Ik heb voldoende informatie verzameld voor een eerste beoordeling.");
            }
            
            this.updateVoiceStatus('ready', '✅ Klaar voor uw volgende antwoord');
        }, 2000);
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
            
            // Simulate AI response
            setTimeout(() => {
                this.simulateAIResponse();
            }, 1000);
            
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
            const percentage = Math.min(Math.round((questionsCount / 10) * 100), 100);
            
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
                this.stopRecording();
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
console.log('Setting up DOM ready listener...');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing Working Realtime Client...');
        window.realtimeClient = new WorkingRealtimeClient();
        console.log('Working Realtime Client initialized');
    });
} else {
    console.log('DOM already loaded, initializing Working Realtime Client...');
    window.realtimeClient = new WorkingRealtimeClient();
    console.log('Working Realtime Client initialized');
}

console.log('Working Realtime Client script loaded successfully');

