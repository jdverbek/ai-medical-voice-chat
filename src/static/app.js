// Main AI Medical Chat Application

class MedicalChatApp {
    constructor() {
        this.conversationEngine = new ConversationEngine();
        this.voiceHandler = new WhisperVoiceHandler(); // Use Whisper instead of Web Speech API
        this.currentMode = 'voice'; // 'voice' or 'text'
        this.isInitialized = false;
        this.messageHistory = [];
        
        this.init();
    }

    async init() {
        try {
            // Initialize UI event listeners
            this.setupEventListeners();
            
            // Check voice support
            this.checkVoiceSupport();
            
            // Initialize settings
            this.loadSettings();
            
            // Show welcome screen
            this.showScreen('welcomeScreen');
            
            this.isInitialized = true;
            console.log('AI Medical Chat App initialized successfully');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Er is een probleem opgetreden bij het opstarten van de applicatie.');
        }
    }

    setupEventListeners() {
        // Welcome screen buttons
        const startVoiceBtn = document.getElementById('startVoiceChat');
        const startTextBtn = document.getElementById('startTextChat');
        
        if (startVoiceBtn) {
            startVoiceBtn.addEventListener('click', () => this.startChat('voice'));
        }
        
        if (startTextBtn) {
            startTextBtn.addEventListener('click', () => this.startChat('text'));
        }

        // Chat interface buttons
        const backBtn = document.getElementById('backBtn');
        const toggleModeBtn = document.getElementById('toggleModeBtn');
        const recordBtn = document.getElementById('recordBtn');
        const sendBtn = document.getElementById('sendBtn');
        const messageInput = document.getElementById('messageInput');

        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }

        if (toggleModeBtn) {
            toggleModeBtn.addEventListener('click', () => this.toggleInputMode());
        }

        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.handleVoiceInput());
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleTextInput());
        }

        if (messageInput) {
            messageInput.addEventListener('input', () => this.updateSendButton());
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleTextInput();
                }
            });
        }

        // Modal controls
        this.setupModalControls();

        // Settings controls
        this.setupSettingsControls();
    }

    setupModalControls() {
        const settingsBtn = document.getElementById('settingsBtn');
        const helpBtn = document.getElementById('helpBtn');
        const modals = document.querySelectorAll('.modal');
        const modalCloses = document.querySelectorAll('.modal-close');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showModal('settingsModal'));
        }

        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showModal('helpModal'));
        }

        modalCloses.forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    setupSettingsControls() {
        const speechRate = document.getElementById('speechRate');
        const speechVolume = document.getElementById('speechVolume');
        const fontSize = document.getElementById('fontSize');

        if (speechRate) {
            speechRate.addEventListener('change', (e) => {
                this.updateVoiceSettings({ rate: parseFloat(e.target.value) });
            });
        }

        if (speechVolume) {
            speechVolume.addEventListener('change', (e) => {
                this.updateVoiceSettings({ volume: parseFloat(e.target.value) });
            });
        }

        if (fontSize) {
            fontSize.addEventListener('change', (e) => {
                this.updateFontSize(e.target.value);
            });
        }
    }

    checkVoiceSupport() {
        const support = this.voiceHandler.isSupported;
        
        if (!support.full) {
            const startVoiceBtn = document.getElementById('startVoiceChat');
            if (startVoiceBtn) {
                startVoiceBtn.disabled = true;
                startVoiceBtn.innerHTML = '<span class="btn-icon">❌</span>Spraak niet ondersteund';
            }
        }
    }

    async startChat(mode) {
        try {
            this.currentMode = mode;
            this.showScreen('chatScreen');
            
            // Update UI for selected mode
            this.updateInputMode(mode);
            
            // Start conversation
            const opening = this.conversationEngine.startConversation();
            await this.addAIMessage(opening.response);
            
            // Speak the opening if in voice mode
            if (mode === 'voice') {
                await this.voiceHandler.speak(opening.response);
            }
            
        } catch (error) {
            console.error('Error starting chat:', error);
            this.showError('Er is een probleem opgetreden bij het starten van het gesprek.');
        }
    }

    async handleVoiceInput() {
        try {
            if (this.voiceHandler.isListening) {
                this.voiceHandler.stopListening();
            } else {
                await this.voiceHandler.startListening();
            }
        } catch (error) {
            console.error('Voice input error:', error);
            this.showError(error.message || 'Er is een probleem opgetreden met spraakherkenning.');
        }
    }

    async handleTextInput() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        const text = messageInput.value.trim();
        if (!text) return;

        try {
            // Clear input
            messageInput.value = '';
            this.updateSendButton();

            // Process input
            await this.processUserInput(text);

        } catch (error) {
            console.error('Text input error:', error);
            this.showError('Er is een probleem opgetreden bij het verwerken van uw bericht.');
        }
    }

    async processUserInput(userInput) {
        try {
            // Add user message to chat
            this.addUserMessage(userInput);

            // Show typing indicator
            this.showTypingIndicator();

            // Process with conversation engine
            const response = await this.conversationEngine.processUserResponse(userInput);

            // Hide typing indicator
            this.hideTypingIndicator();

            // Add AI response to chat
            await this.addAIMessage(response.response, response);

            // Speak response if in voice mode
            if (this.currentMode === 'voice') {
                await this.voiceHandler.speak(response.response);
            }

            // Handle urgent situations
            if (response.requiresImmediateAttention) {
                this.handleUrgentSituation(response);
            }

        } catch (error) {
            console.error('Error processing user input:', error);
            this.hideTypingIndicator();
            this.showError('Er is een probleem opgetreden bij het verwerken van uw antwoord.');
        }
    }

    // This method is called by the voice handler
    async processVoiceInput(transcript) {
        console.log('Processing voice input:', transcript);
        
        try {
            // Ensure we're in voice mode
            if (this.currentMode !== 'voice') {
                this.currentMode = 'voice';
                this.updateInputMode('voice');
            }
            
            // Process the transcript as user input
            await this.processUserInput(transcript);
            
        } catch (error) {
            console.error('Error processing voice input:', error);
            this.showError('Er is een probleem opgetreden bij het verwerken van uw spraak.');
        }
    }

    addUserMessage(text) {
        const message = {
            type: 'user',
            text: text,
            timestamp: new Date()
        };

        this.messageHistory.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    async addAIMessage(text, analysis = null) {
        const message = {
            type: 'ai',
            text: text,
            timestamp: new Date(),
            analysis: analysis
        };

        this.messageHistory.push(message);
        this.renderMessage(message);
        this.scrollToBottom();

        // Update chat status
        this.updateChatStatus(analysis);
    }

    renderMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = message.type === 'ai' ? '🤖' : '👤';

        const content = document.createElement('div');
        content.className = 'message-content';

        const text = document.createElement('div');
        text.className = 'message-text';
        text.textContent = message.text;

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatTime(message.timestamp);

        content.appendChild(text);
        content.appendChild(time);

        messageElement.appendChild(avatar);
        messageElement.appendChild(content);

        chatMessages.appendChild(messageElement);
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const typingElement = document.createElement('div');
        typingElement.className = 'message ai typing-indicator';
        typingElement.id = 'typingIndicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';

        const content = document.createElement('div');
        content.className = 'message-content';

        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';
        typingContent.innerHTML = `
            <span>AI denkt na</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        content.appendChild(typingContent);
        typingElement.appendChild(avatar);
        typingElement.appendChild(content);

        chatMessages.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateChatStatus(analysis) {
        const chatStatus = document.getElementById('chatStatus');
        if (!chatStatus) return;

        if (analysis) {
            if (analysis.urgency === 'immediate') {
                chatStatus.textContent = 'Urgente situatie gedetecteerd';
                chatStatus.style.color = 'var(--danger-color)';
            } else if (analysis.urgency === 'urgent') {
                chatStatus.textContent = 'Aandacht vereist';
                chatStatus.style.color = 'var(--warning-color)';
            } else {
                chatStatus.textContent = `Vertrouwen: ${Math.round(analysis.confidence * 100)}%`;
                chatStatus.style.color = 'var(--text-secondary)';
            }
        } else {
            chatStatus.textContent = 'Gesprek actief';
            chatStatus.style.color = 'var(--text-secondary)';
        }
    }

    handleUrgentSituation(response) {
        // Show urgent notification
        this.showUrgentNotification(response.analysis);
        
        // Update UI to indicate urgency
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.style.borderLeft = '4px solid var(--danger-color)';
        }
    }

    showUrgentNotification(analysis) {
        // Create urgent notification overlay
        const notification = document.createElement('div');
        notification.className = 'urgent-notification';
        notification.innerHTML = `
            <div class="urgent-content">
                <div class="urgent-icon">⚠️</div>
                <h3>Urgente Situatie</h3>
                <p>Uw klachten vereisen mogelijk onmiddellijke medische aandacht.</p>
                <div class="urgent-actions">
                    <button class="primary-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Begrepen
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    toggleInputMode() {
        this.currentMode = this.currentMode === 'voice' ? 'text' : 'voice';
        this.updateInputMode(this.currentMode);
    }

    updateInputMode(mode) {
        const voiceInput = document.getElementById('voiceInput');
        const textInput = document.getElementById('textInput');
        const modeIcon = document.getElementById('modeIcon');
        const modeText = document.getElementById('modeText');

        if (voiceInput && textInput) {
            if (mode === 'voice') {
                voiceInput.classList.add('active');
                textInput.classList.remove('active');
                if (modeIcon) modeIcon.textContent = '🎤';
                if (modeText) modeText.textContent = 'Spraak';
            } else {
                voiceInput.classList.remove('active');
                textInput.classList.add('active');
                if (modeIcon) modeIcon.textContent = '💬';
                if (modeText) modeText.textContent = 'Tekst';
            }
        }
    }

    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput && sendBtn) {
            sendBtn.disabled = messageInput.value.trim().length === 0;
        }
    }

    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    goBack() {
        // Stop any ongoing speech
        this.voiceHandler.stopSpeaking();
        this.voiceHandler.stopListening();
        
        // Clear chat
        this.clearChat();
        
        // Show welcome screen
        this.showScreen('welcomeScreen');
    }

    clearChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        this.messageHistory = [];
        
        // Reset conversation engine
        this.conversationEngine = new ConversationEngine();
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    updateVoiceSettings(settings) {
        this.voiceHandler.updateSettings(settings);
        this.saveSettings();
    }

    updateFontSize(size) {
        document.body.classList.remove('font-large', 'font-extra-large');
        
        if (size === 'large') {
            document.body.classList.add('font-large');
        } else if (size === 'extra-large') {
            document.body.classList.add('font-extra-large');
        }
        
        this.saveSettings();
    }

    loadSettings() {
        try {
            const settings = localStorage.getItem('medicalChatSettings');
            if (settings) {
                const parsed = JSON.parse(settings);
                
                // Apply voice settings
                if (parsed.voice) {
                    this.voiceHandler.updateSettings(parsed.voice);
                    
                    // Update UI controls
                    const speechRate = document.getElementById('speechRate');
                    const speechVolume = document.getElementById('speechVolume');
                    
                    if (speechRate) speechRate.value = parsed.voice.rate || 0.8;
                    if (speechVolume) speechVolume.value = parsed.voice.volume || 1.0;
                }
                
                // Apply font size
                if (parsed.fontSize) {
                    this.updateFontSize(parsed.fontSize);
                    
                    const fontSize = document.getElementById('fontSize');
                    if (fontSize) fontSize.value = parsed.fontSize;
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    saveSettings() {
        try {
            const settings = {
                voice: this.voiceHandler.getSettings(),
                fontSize: this.getCurrentFontSize()
            };
            
            localStorage.setItem('medicalChatSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    getCurrentFontSize() {
        if (document.body.classList.contains('font-extra-large')) {
            return 'extra-large';
        } else if (document.body.classList.contains('font-large')) {
            return 'large';
        }
        return 'normal';
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">❌</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Public API for external access
    getSummary() {
        return this.conversationEngine.getSummary();
    }

    exportConversation() {
        const summary = this.getSummary();
        const exportData = {
            timestamp: new Date().toISOString(),
            conversation: this.messageHistory,
            summary: summary
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical-conversation-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Diagnostic methods
    runDiagnostics() {
        const diagnostics = {
            app: this.isInitialized,
            voice: this.voiceHandler.runVoiceDiagnostics(),
            conversation: {
                messagesCount: this.messageHistory.length,
                currentMode: this.currentMode
            }
        };
        
        console.log('App Diagnostics:', diagnostics);
        return diagnostics;
    }
}

// CSS for notifications (add to existing styles)
const additionalStyles = `
.urgent-notification {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(220, 38, 38, 0.9);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
}

.urgent-content {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    text-align: center;
    max-width: 400px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.urgent-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.urgent-content h3 {
    color: var(--danger-color);
    margin-bottom: 1rem;
}

.urgent-actions {
    margin-top: 1.5rem;
}

.error-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    animation: slideInRight 0.3s ease-out;
}

.error-content {
    background: var(--danger-color);
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: var(--shadow-lg);
    max-width: 400px;
}

.error-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: auto;
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
`;

// Add additional styles to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MedicalChatApp();
});

// Export for external access
window.MedicalChatApp = MedicalChatApp;

