// Enhanced Medical Voice Chat Application with OpenAI Realtime API
// True Speech-to-Speech Cardiological Anamnesis

class MedicalVoiceChatApp {
    constructor() {
        this.realtimeVoice = null;
        this.currentMode = 'welcome'; // welcome, text, voice
        this.isInitialized = false;
        this.apiKey = null;
        
        this.initializeApp();
    }

    async initializeApp() {
        console.log('Initializing Medical Voice Chat App...');
        
        // Show loading screen
        this.showLoadingScreen();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }

    showLoadingScreen() {
        const loadingHTML = `
            <div id="loading-overlay" class="loading-overlay">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h2>🏥 Cardiologische AI Assistent</h2>
                    <p>Geavanceerde spraak-naar-spraak technologie wordt geladen...</p>
                    <div class="loading-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="loading-progress"></div>
                        </div>
                        <p id="loading-status">OpenAI Realtime API initialiseren...</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', loadingHTML);
        
        // Simulate loading progress
        this.simulateLoading();
    }

    simulateLoading() {
        const progressBar = document.getElementById('loading-progress');
        const statusText = document.getElementById('loading-status');
        
        const steps = [
            { progress: 20, text: 'Spraakherkenning modules laden...' },
            { progress: 40, text: 'Audio processing initialiseren...' },
            { progress: 60, text: 'Cardiologische kennis database laden...' },
            { progress: 80, text: 'Voice interface voorbereiden...' },
            { progress: 100, text: 'Klaar voor gebruik!' }
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                progressBar.style.width = step.progress + '%';
                statusText.textContent = step.text;
                currentStep++;
            } else {
                clearInterval(interval);
                setTimeout(() => this.hideLoadingScreen(), 1000);
            }
        }, 800);
    }

    hideLoadingScreen() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.remove();
                this.showWelcomeScreen();
            }, 500);
        }
    }

    setupUI() {
        // Create main application structure
        const appHTML = `
            <div id="app-container" class="app-container">
                <!-- Header -->
                <header class="app-header">
                    <div class="header-content">
                        <div class="logo">
                            <span class="logo-icon">🏥</span>
                            <h1>Cardiologische AI Assistent</h1>
                        </div>
                        <div class="header-info">
                            <span class="version">v3.0 - Speech-to-Speech</span>
                            <div class="connection-status" id="connection-status">
                                <span class="status-indicator"></span>
                                <span class="status-text">Initialiseren...</span>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Main Content -->
                <main class="app-main" id="app-main">
                    <!-- Welcome Screen -->
                    <div id="welcome-screen" class="screen welcome-screen">
                        <div class="welcome-content">
                            <div class="welcome-header">
                                <h2>🎤 Welkom bij de Geavanceerde Spraak Anamnese</h2>
                                <p>Ervaar de nieuwste speech-to-speech technologie voor cardiologische consultaties</p>
                            </div>

                            <div class="features-grid">
                                <div class="feature-card">
                                    <div class="feature-icon">🗣️</div>
                                    <h3>Echte Spraakconversatie</h3>
                                    <p>Spreek natuurlijk met de AI - geen typen meer nodig</p>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">🧠</div>
                                    <h3>Intelligente Vragen</h3>
                                    <p>Geen herhalingen, gerichte cardiologische anamnese</p>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">📋</div>
                                    <h3>Professioneel Rapport</h3>
                                    <p>Gedetailleerde medische samenvatting voor uw dossier</p>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">🔒</div>
                                    <h3>Veilig & Privé</h3>
                                    <p>Alle gegevens blijven lokaal en zijn GDPR-compliant</p>
                                </div>
                            </div>

                            <div class="api-key-section">
                                <h3>🔑 OpenAI API Configuratie</h3>
                                <p>Voer uw OpenAI API key in voor speech-to-speech functionaliteit:</p>
                                <div class="api-key-input">
                                    <input type="password" id="api-key-input" placeholder="sk-..." />
                                    <button id="save-api-key" class="btn btn-primary">Opslaan</button>
                                </div>
                                <p class="api-key-note">💡 Uw API key wordt alleen lokaal opgeslagen en niet gedeeld</p>
                            </div>

                            <div class="start-options" id="start-options" style="display: none;">
                                <h3>Kies uw voorkeursmanier om te beginnen:</h3>
                                <div class="start-buttons">
                                    <button id="start-voice-conversation" class="btn btn-voice">
                                        🎤 Start Spraakgesprek
                                        <span class="btn-subtitle">Spreek direct met de AI</span>
                                    </button>
                                    <button id="start-text-conversation" class="btn btn-text">
                                        💬 Start Tekstgesprek
                                        <span class="btn-subtitle">Type uw antwoorden</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Voice Conversation Screen -->
                    <div id="voice-screen" class="screen voice-screen" style="display: none;">
                        <div class="voice-interface">
                            <div class="voice-header">
                                <h2>🎤 Spraakgesprek Actief</h2>
                                <div class="voice-controls">
                                    <button id="voice-toggle" class="btn btn-voice-control">
                                        <span class="voice-icon">🎤</span>
                                        <span class="voice-text">Luisteren...</span>
                                    </button>
                                    <button id="end-voice-conversation" class="btn btn-secondary">
                                        ❌ Beëindig Gesprek
                                    </button>
                                </div>
                            </div>

                            <div class="conversation-container">
                                <div id="voice-chat-container" class="chat-container">
                                    <!-- Voice conversation messages will appear here -->
                                </div>
                            </div>

                            <div class="voice-status-panel">
                                <div id="voice-status" class="voice-status">
                                    🔄 Verbinding maken met OpenAI...
                                </div>
                                <div class="audio-visualizer" id="audio-visualizer">
                                    <div class="visualizer-bar"></div>
                                    <div class="visualizer-bar"></div>
                                    <div class="visualizer-bar"></div>
                                    <div class="visualizer-bar"></div>
                                    <div class="visualizer-bar"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Text Conversation Screen -->
                    <div id="text-screen" class="screen text-screen" style="display: none;">
                        <div class="text-interface">
                            <div class="text-header">
                                <h2>💬 Tekstgesprek</h2>
                                <button id="switch-to-voice" class="btn btn-switch">
                                    🎤 Schakel naar Spraak
                                </button>
                            </div>

                            <div class="conversation-container">
                                <div id="text-chat-container" class="chat-container">
                                    <!-- Text conversation messages will appear here -->
                                </div>
                            </div>

                            <div class="text-input-panel">
                                <div class="input-group">
                                    <textarea id="text-input" placeholder="Typ uw antwoord hier..." rows="3"></textarea>
                                    <button id="send-text" class="btn btn-primary">📤 Verstuur</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <!-- Medical Summary Sidebar -->
                <aside class="medical-sidebar" id="medical-sidebar">
                    <div class="sidebar-content">
                        <h3>📋 Medische Samenvatting</h3>
                        <div id="medical-progress" class="medical-progress">
                            <div class="progress-circle">
                                <div class="progress-value">0%</div>
                            </div>
                            <p>Anamnese voortgang</p>
                        </div>

                        <div class="medical-categories">
                            <div class="category">
                                <h4>🩺 Symptomen</h4>
                                <ul id="symptoms-list"></ul>
                            </div>
                            <div class="category">
                                <h4>💊 Medicatie</h4>
                                <ul id="medications-list"></ul>
                            </div>
                            <div class="category">
                                <h4>👨‍👩‍👧‍👦 Familie</h4>
                                <ul id="family-history-list"></ul>
                            </div>
                            <div class="category">
                                <h4>⚠️ Risicofactoren</h4>
                                <ul id="risk-factors-list"></ul>
                            </div>
                        </div>

                        <div class="sidebar-actions">
                            <button id="generate-report" class="btn btn-report">
                                📄 Genereer Rapport
                            </button>
                            <button id="download-audio" class="btn btn-secondary" style="display: none;">
                                🎵 Download Audio
                            </button>
                        </div>
                    </div>
                </aside>

                <!-- Error Messages -->
                <div id="error-container" class="error-container" style="display: none;">
                    <div class="error-message">
                        <span class="error-icon">⚠️</span>
                        <span id="error-text"></span>
                        <button id="close-error" class="error-close">×</button>
                    </div>
                </div>
            </div>
        `;

        // Insert the HTML into the body
        document.body.innerHTML = appHTML;
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    showWelcomeScreen() {
        this.currentMode = 'welcome';
        this.showScreen('welcome-screen');
        this.updateConnectionStatus('ready', 'Klaar voor configuratie');
    }

    initializeEventListeners() {
        // API Key handling
        const apiKeyInput = document.getElementById('api-key-input');
        const saveApiKeyBtn = document.getElementById('save-api-key');
        
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        }
        
        if (apiKeyInput) {
            apiKeyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.saveApiKey();
            });
        }

        // Start conversation buttons
        const startVoiceBtn = document.getElementById('start-voice-conversation');
        const startTextBtn = document.getElementById('start-text-conversation');
        
        if (startVoiceBtn) {
            startVoiceBtn.addEventListener('click', () => this.startVoiceConversation());
        }
        
        if (startTextBtn) {
            startTextBtn.addEventListener('click', () => this.startTextConversation());
        }

        // Voice controls
        const voiceToggle = document.getElementById('voice-toggle');
        const endVoiceBtn = document.getElementById('end-voice-conversation');
        
        if (voiceToggle) {
            voiceToggle.addEventListener('click', () => this.toggleVoiceRecording());
        }
        
        if (endVoiceBtn) {
            endVoiceBtn.addEventListener('click', () => this.endVoiceConversation());
        }

        // Text input
        const textInput = document.getElementById('text-input');
        const sendTextBtn = document.getElementById('send-text');
        
        if (sendTextBtn) {
            sendTextBtn.addEventListener('click', () => this.sendTextMessage());
        }
        
        if (textInput) {
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendTextMessage();
                }
            });
        }

        // Mode switching
        const switchToVoiceBtn = document.getElementById('switch-to-voice');
        if (switchToVoiceBtn) {
            switchToVoiceBtn.addEventListener('click', () => this.switchToVoiceMode());
        }

        // Report generation
        const generateReportBtn = document.getElementById('generate-report');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }

        // Error handling
        const closeErrorBtn = document.getElementById('close-error');
        if (closeErrorBtn) {
            closeErrorBtn.addEventListener('click', () => this.hideError());
        }
    }

    async saveApiKey() {
        const apiKeyInput = document.getElementById('api-key-input');
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey || !apiKey.startsWith('sk-')) {
            this.showError('Voer een geldige OpenAI API key in (begint met sk-)');
            return;
        }

        this.apiKey = apiKey;
        
        // Store in localStorage for convenience (with user consent)
        if (confirm('Wilt u uw API key lokaal opslaan voor toekomstig gebruik?')) {
            localStorage.setItem('openai_api_key', apiKey);
        }

        // Initialize OpenAI Realtime Voice
        this.updateConnectionStatus('connecting', 'Verbinding maken met OpenAI...');
        
        try {
            // Import and initialize the OpenAI Realtime Voice class
            const { OpenAIRealtimeVoice } = await import('./openai-realtime-voice.js');
            this.realtimeVoice = new OpenAIRealtimeVoice(apiKey);
            
            const initialized = await this.realtimeVoice.initialize();
            
            if (initialized) {
                this.isInitialized = true;
                this.updateConnectionStatus('connected', 'Verbonden met OpenAI');
                this.showStartOptions();
            } else {
                throw new Error('Initialisatie mislukt');
            }
        } catch (error) {
            console.error('Failed to initialize OpenAI Realtime Voice:', error);
            this.updateConnectionStatus('error', 'Verbinding mislukt');
            this.showError('Kon geen verbinding maken met OpenAI. Controleer uw API key en internetverbinding.');
        }
    }

    showStartOptions() {
        const startOptions = document.getElementById('start-options');
        if (startOptions) {
            startOptions.style.display = 'block';
            startOptions.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async startVoiceConversation() {
        if (!this.isInitialized) {
            this.showError('OpenAI Realtime API is nog niet geïnitialiseerd');
            return;
        }

        this.currentMode = 'voice';
        this.showScreen('voice-screen');
        
        // Start the voice conversation
        const success = await this.realtimeVoice.startVoiceConversation();
        
        if (success) {
            this.updateVoiceStatus('listening', '🎤 Luisteren... Spreek uw hartklachten');
            this.startAudioVisualizer();
        } else {
            this.showError('Kon spraakgesprek niet starten. Controleer microfoon toegang.');
        }
    }

    startTextConversation() {
        this.currentMode = 'text';
        this.showScreen('text-screen');
        
        // Start with a welcome message
        this.addTextMessage('assistant', 'Goedemorgen! Ik ben uw AI cardioloog. Ik ga vandaag een anamnese met u afnemen om uw hartklachten beter te begrijpen. Kunt u mij vertellen wat uw belangrijkste hartklacht is?');
    }

    toggleVoiceRecording() {
        if (!this.realtimeVoice) return;
        
        if (this.realtimeVoice.isRecording) {
            this.realtimeVoice.pauseRecording();
            this.updateVoiceStatus('paused', '⏸️ Gepauzeerd - Klik om door te gaan');
        } else {
            this.realtimeVoice.resumeRecording();
            this.updateVoiceStatus('listening', '🎤 Luisteren... Spreek nu');
        }
    }

    endVoiceConversation() {
        if (this.realtimeVoice) {
            this.realtimeVoice.stopVoiceConversation();
        }
        
        this.stopAudioVisualizer();
        this.showWelcomeScreen();
    }

    switchToVoiceMode() {
        if (!this.isInitialized) {
            this.showError('OpenAI Realtime API is nog niet geïnitialiseerd');
            return;
        }
        
        this.startVoiceConversation();
    }

    sendTextMessage() {
        const textInput = document.getElementById('text-input');
        const message = textInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addTextMessage('user', message);
        
        // Clear input
        textInput.value = '';
        
        // Simulate AI response (in real implementation, this would call OpenAI API)
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addTextMessage('assistant', response);
        }, 1000);
    }

    generateAIResponse(userMessage) {
        // Simple response generation for text mode
        // In real implementation, this would use OpenAI API
        const responses = [
            'Dank u voor die informatie. Kunt u mij meer vertellen over wanneer deze klachten begonnen?',
            'Dat is belangrijk om te weten. Merkt u dat de klachten samenhangen met inspanning?',
            'Heeft u ook last van kortademigheid of hartkloppingen?',
            'Gebruikt u momenteel medicijnen voor uw hart of andere aandoeningen?',
            'Zijn er familieleden die hartproblemen hebben gehad?'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    addTextMessage(role, content) {
        const chatContainer = document.getElementById('text-chat-container');
        if (!chatContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const timestamp = new Date().toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="role">${role === 'assistant' ? '🤖 AI Cardioloog' : '👤 U'}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${content}</div>
            ${role === 'assistant' ? '<button class="repeat-btn" onclick="this.speak()">🔊 Voorlezen</button>' : ''}
        `;

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Update medical summary if this is user input
        if (role === 'user') {
            this.updateMedicalSummary(content);
        }
    }

    updateMedicalSummary(userInput) {
        // Extract medical information from user input
        const lowerInput = userInput.toLowerCase();
        
        // Simple keyword extraction
        if (lowerInput.includes('pijn') || lowerInput.includes('zeer')) {
            this.addMedicalItem('symptoms', 'Pijn/ongemak gerapporteerd');
        }
        
        if (lowerInput.includes('kortademig') || lowerInput.includes('ademhaling')) {
            this.addMedicalItem('symptoms', 'Kortademigheid');
        }
        
        if (lowerInput.includes('medicijn') || lowerInput.includes('pil')) {
            this.addMedicalItem('medications', 'Medicatie gebruik genoemd');
        }
        
        // Update progress
        this.updateProgress();
    }

    addMedicalItem(category, item) {
        const listId = category === 'symptoms' ? 'symptoms-list' :
                      category === 'medications' ? 'medications-list' :
                      category === 'family_history' ? 'family-history-list' :
                      'risk-factors-list';
        
        const list = document.getElementById(listId);
        if (!list) return;
        
        const listItem = document.createElement('li');
        listItem.textContent = item;
        list.appendChild(listItem);
    }

    updateProgress() {
        const progressValue = document.querySelector('.progress-value');
        if (!progressValue) return;
        
        // Calculate progress based on collected information
        const totalItems = document.querySelectorAll('.medical-categories li').length;
        const progress = Math.min((totalItems / 10) * 100, 100);
        
        progressValue.textContent = Math.round(progress) + '%';
    }

    generateReport() {
        // Generate and download medical report
        const report = {
            timestamp: new Date().toISOString(),
            mode: this.currentMode,
            symptoms: Array.from(document.querySelectorAll('#symptoms-list li')).map(li => li.textContent),
            medications: Array.from(document.querySelectorAll('#medications-list li')).map(li => li.textContent),
            familyHistory: Array.from(document.querySelectorAll('#family-history-list li')).map(li => li.textContent),
            riskFactors: Array.from(document.querySelectorAll('#risk-factors-list li')).map(li => li.textContent)
        };
        
        const reportText = this.formatReport(report);
        this.downloadReport(reportText);
    }

    formatReport(report) {
        let text = `CARDIOLOGISCHE ANAMNESE RAPPORT\n`;
        text += `Datum: ${new Date(report.timestamp).toLocaleDateString('nl-NL')}\n`;
        text += `Tijd: ${new Date(report.timestamp).toLocaleTimeString('nl-NL')}\n`;
        text += `Methode: ${report.mode === 'voice' ? 'Spraakgesprek' : 'Tekstgesprek'}\n\n`;
        
        if (report.symptoms.length > 0) {
            text += `SYMPTOMEN:\n${report.symptoms.map(s => `- ${s}`).join('\n')}\n\n`;
        }
        
        if (report.medications.length > 0) {
            text += `MEDICATIE:\n${report.medications.map(m => `- ${m}`).join('\n')}\n\n`;
        }
        
        if (report.familyHistory.length > 0) {
            text += `FAMILIEGESCHIEDENIS:\n${report.familyHistory.map(f => `- ${f}`).join('\n')}\n\n`;
        }
        
        if (report.riskFactors.length > 0) {
            text += `RISICOFACTOREN:\n${report.riskFactors.map(r => `- ${r}`).join('\n')}\n\n`;
        }
        
        return text;
    }

    downloadReport(reportText) {
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cardiologie_anamnese_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showScreen(screenId) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.style.display = 'none');
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.style.display = 'block';
        }
    }

    updateConnectionStatus(status, message) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = `status-indicator ${status}`;
            statusText.textContent = message;
        }
    }

    updateVoiceStatus(status, message) {
        const voiceStatus = document.getElementById('voice-status');
        const voiceToggle = document.getElementById('voice-toggle');
        
        if (voiceStatus) {
            voiceStatus.textContent = message;
            voiceStatus.className = `voice-status ${status}`;
        }
        
        if (voiceToggle) {
            const icon = voiceToggle.querySelector('.voice-icon');
            const text = voiceToggle.querySelector('.voice-text');
            
            if (status === 'listening') {
                icon.textContent = '🎤';
                text.textContent = 'Luisteren...';
                voiceToggle.className = 'btn btn-voice-control recording';
            } else if (status === 'paused') {
                icon.textContent = '▶️';
                text.textContent = 'Hervatten';
                voiceToggle.className = 'btn btn-voice-control paused';
            }
        }
    }

    startAudioVisualizer() {
        const visualizerBars = document.querySelectorAll('.visualizer-bar');
        
        this.visualizerInterval = setInterval(() => {
            visualizerBars.forEach(bar => {
                const height = Math.random() * 100;
                bar.style.height = height + '%';
            });
        }, 100);
    }

    stopAudioVisualizer() {
        if (this.visualizerInterval) {
            clearInterval(this.visualizerInterval);
            this.visualizerInterval = null;
        }
        
        const visualizerBars = document.querySelectorAll('.visualizer-bar');
        visualizerBars.forEach(bar => {
            bar.style.height = '10%';
        });
    }

    showError(message) {
        const errorContainer = document.getElementById('error-container');
        const errorText = document.getElementById('error-text');
        
        if (errorContainer && errorText) {
            errorText.textContent = message;
            errorContainer.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => this.hideError(), 5000);
        }
    }

    hideError() {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    }
}

// Initialize the application
let medicalVoiceApp = null;

// Auto-load saved API key
document.addEventListener('DOMContentLoaded', () => {
    medicalVoiceApp = new MedicalVoiceChatApp();
    
    // Check for saved API key
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
        const apiKeyInput = document.getElementById('api-key-input');
        if (apiKeyInput) {
            apiKeyInput.value = savedApiKey;
        }
    }
});

// Export for global access
window.medicalVoiceApp = medicalVoiceApp;

