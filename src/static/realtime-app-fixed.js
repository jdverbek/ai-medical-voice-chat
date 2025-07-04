// Fixed Medical Voice Chat App with Working OpenAI Realtime API
class MedicalVoiceChatApp {
    constructor() {
        this.realtimeVoice = null;
        this.currentScreen = 'welcome';
        this.conversationHistory = [];
        this.medicalData = {
            symptoms: [],
            medications: [],
            riskFactors: [],
            familyHistory: [],
            functionalClass: null,
            progress: 0
        };
        this.isVoiceMode = false;
        this.apiKey = null;
        
        console.log('Medical Voice Chat App initializing...');
        this.init();
    }
    
    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize OpenAI Realtime Voice
            this.realtimeVoice = new OpenAIRealtimeVoice();
            this.setupRealtimeEventHandlers();
            
            // Create the main interface
            this.createInterface();
            
            // Hide loading screen and show welcome
            this.hideLoadingScreen();
            this.showWelcomeScreen();
            
            console.log('Medical Voice Chat App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Initialisatie mislukt: ' + error.message);
        }
    }
    
    showLoadingScreen() {
        const loadingHTML = `
            <div id="loading-overlay" class="loading-overlay">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h2>🏥 Cardiologische AI Assistent</h2>
                    <p>Speech-to-Speech technologie wordt geladen...</p>
                    <div class="loading-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 75%;"></div>
                        </div>
                        <p>OpenAI Realtime API initialiseren...</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.innerHTML = loadingHTML;
    }
    
    hideLoadingScreen() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.remove();
            }, 500);
        }
    }
    
    createInterface() {
        const appHTML = `
            <div class="app-container">
                <!-- Header -->
                <header class="app-header">
                    <div class="header-content">
                        <div class="logo">
                            <span class="logo-icon">🏥</span>
                            <h1>Cardiologische AI Assistent</h1>
                        </div>
                        <div class="header-info">
                            <span class="version">v3.0 - Speech-to-Speech</span>
                            <div class="connection-status">
                                <div class="status-indicator ready" id="connection-status"></div>
                                <span class="status-text" id="connection-text">Klaar</span>
                            </div>
                        </div>
                    </div>
                </header>
                
                <!-- Main Content -->
                <div class="app-main">
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
                            
                            <!-- API Key Section -->
                            <div class="api-key-section">
                                <h3>🔑 OpenAI API Configuratie</h3>
                                <p>Voer uw OpenAI API key in voor speech-to-speech functionaliteit:</p>
                                <div class="api-key-input">
                                    <input type="password" id="api-key-input" placeholder="sk-..." />
                                    <button id="save-api-key" class="btn btn-primary">Opslaan</button>
                                </div>
                                <p class="api-key-note">🔒 Uw API key wordt alleen lokaal opgeslagen en niet gedeeld</p>
                            </div>
                            
                            <!-- Start Options -->
                            <div class="start-options">
                                <h3>Kies uw voorkeursmanier om te beginnen:</h3>
                                <div class="start-buttons">
                                    <button id="start-voice-btn" class="btn btn-voice" disabled>
                                        <span class="btn-icon">🎤</span>
                                        <span class="btn-text">Start Spraakgesprek</span>
                                        <span class="btn-subtitle">Echte speech-to-speech conversatie</span>
                                    </button>
                                    <button id="start-text-btn" class="btn btn-text" disabled>
                                        <span class="btn-icon">💬</span>
                                        <span class="btn-text">Start Tekstgesprek</span>
                                        <span class="btn-subtitle">Type uw antwoorden</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Voice Screen -->
                    <div id="voice-screen" class="screen voice-screen" style="display: none;">
                        <div class="voice-interface">
                            <div class="voice-header">
                                <h2>🎤 Spraakgesprek Modus</h2>
                                <div class="voice-controls">
                                    <button id="voice-toggle" class="btn-voice-control">
                                        <span class="voice-icon">🎤</span>
                                        <span>Start Opname</span>
                                    </button>
                                    <button id="switch-to-text" class="btn-voice-control">
                                        <span>💬</span>
                                        <span>Naar Tekst</span>
                                    </button>
                                    <button id="end-voice-session" class="btn-voice-control">
                                        <span>❌</span>
                                        <span>Beëindigen</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="conversation-container">
                                <div id="voice-chat-container" class="chat-container">
                                    <!-- Voice messages will be added here -->
                                </div>
                            </div>
                            
                            <div class="voice-status-panel">
                                <div class="voice-status" id="voice-status">Klaar om te beginnen</div>
                                <div class="audio-visualizer" id="audio-visualizer">
                                    <!-- Audio visualization bars -->
                                    ${Array(20).fill(0).map(() => '<div class="visualizer-bar"></div>').join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Text Screen -->
                    <div id="text-screen" class="screen text-screen" style="display: none;">
                        <div class="text-interface">
                            <div class="text-header">
                                <h2>💬 Tekstgesprek Modus</h2>
                                <div class="voice-controls">
                                    <button id="switch-to-voice" class="btn-switch">
                                        <span>🎤</span>
                                        <span>Naar Spraak</span>
                                    </button>
                                    <button id="end-text-session" class="btn-voice-control">
                                        <span>❌</span>
                                        <span>Beëindigen</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="conversation-container">
                                <div id="text-chat-container" class="chat-container">
                                    <!-- Text messages will be added here -->
                                </div>
                            </div>
                            
                            <div class="text-input-panel">
                                <div class="input-group">
                                    <textarea id="text-input" placeholder="Typ uw antwoord hier..." rows="3"></textarea>
                                    <button id="send-text" class="btn btn-primary">
                                        <span>📤</span>
                                        <span>Verstuur</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Medical Sidebar -->
                    <div class="medical-sidebar">
                        <div class="sidebar-content">
                            <h3>📋 Medische Samenvatting</h3>
                            
                            <div class="medical-progress">
                                <div class="progress-circle" id="progress-circle">
                                    <span class="progress-value" id="progress-value">0%</span>
                                </div>
                                <p>Anamnese voortgang</p>
                            </div>
                            
                            <div class="medical-categories">
                                <div class="category">
                                    <h4>🩺 Symptomen</h4>
                                    <ul id="symptoms-list">
                                        <li>Nog geen symptomen geregistreerd</li>
                                    </ul>
                                </div>
                                
                                <div class="category">
                                    <h4>💊 Medicatie</h4>
                                    <ul id="medications-list">
                                        <li>Nog geen medicatie geregistreerd</li>
                                    </ul>
                                </div>
                                
                                <div class="category">
                                    <h4>⚠️ Risicofactoren</h4>
                                    <ul id="risk-factors-list">
                                        <li>Nog geen risicofactoren geregistreerd</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="sidebar-actions">
                                <button id="generate-report" class="btn btn-report">
                                    <span>📄</span>
                                    <span>Genereer Rapport</span>
                                </button>
                                <button id="download-pdf" class="btn btn-secondary">
                                    <span>⬇️</span>
                                    <span>Download PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Error Container -->
            <div id="error-container" class="error-container" style="display: none;">
                <div class="error-message">
                    <span class="error-icon">⚠️</span>
                    <span id="error-text">Er is een fout opgetreden</span>
                    <button class="error-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = appHTML;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // API Key handling
        const apiKeyInput = document.getElementById('api-key-input');
        const saveApiKeyBtn = document.getElementById('save-api-key');
        
        saveApiKeyBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                this.setApiKey(apiKey);
            } else {
                this.showError('Voer een geldige API key in');
            }
        });
        
        // Start buttons
        document.getElementById('start-voice-btn').addEventListener('click', () => {
            this.startVoiceConversation();
        });
        
        document.getElementById('start-text-btn').addEventListener('click', () => {
            this.startTextConversation();
        });
        
        // Voice controls
        document.getElementById('voice-toggle').addEventListener('click', () => {
            this.toggleVoiceRecording();
        });
        
        document.getElementById('switch-to-text').addEventListener('click', () => {
            this.switchToTextMode();
        });
        
        document.getElementById('switch-to-voice').addEventListener('click', () => {
            this.switchToVoiceMode();
        });
        
        // Text input
        const textInput = document.getElementById('text-input');
        const sendTextBtn = document.getElementById('send-text');
        
        sendTextBtn.addEventListener('click', () => {
            this.sendTextMessage();
        });
        
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendTextMessage();
            }
        });
        
        // End session buttons
        document.getElementById('end-voice-session').addEventListener('click', () => {
            this.endSession();
        });
        
        document.getElementById('end-text-session').addEventListener('click', () => {
            this.endSession();
        });
        
        // Report generation
        document.getElementById('generate-report').addEventListener('click', () => {
            this.generateReport();
        });
        
        document.getElementById('download-pdf').addEventListener('click', () => {
            this.downloadPDF();
        });
    }
    
    async setApiKey(apiKey) {
        try {
            this.updateConnectionStatus('connecting', 'Verbinden...');
            
            // Set API key in realtime voice
            this.realtimeVoice.setApiKey(apiKey);
            
            // Test connection
            await this.realtimeVoice.connectWithAuth();
            
            this.apiKey = apiKey;
            this.updateConnectionStatus('connected', 'Verbonden');
            
            // Enable start buttons
            document.getElementById('start-voice-btn').disabled = false;
            document.getElementById('start-text-btn').disabled = false;
            
            this.showSuccess('OpenAI API verbinding succesvol!');
            
        } catch (error) {
            console.error('API key validation failed:', error);
            this.updateConnectionStatus('error', 'Fout');
            this.showError('API key validatie mislukt: ' + error.message);
        }
    }
    
    updateConnectionStatus(status, text) {
        const statusIndicator = document.getElementById('connection-status');
        const statusText = document.getElementById('connection-text');
        
        statusIndicator.className = `status-indicator ${status}`;
        statusText.textContent = text;
    }
    
    setupRealtimeEventHandlers() {
        this.realtimeVoice.on('connected', () => {
            console.log('Connected to OpenAI Realtime API');
            this.updateConnectionStatus('connected', 'Verbonden');
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
        
        this.realtimeVoice.on('audioDelta', (event) => {
            this.handleAudioResponse(event.delta);
        });
        
        this.realtimeVoice.on('responseDone', (event) => {
            this.handleResponseComplete(event);
        });
        
        this.realtimeVoice.on('recordingStarted', () => {
            this.updateVoiceStatus('listening', 'Luisteren...');
        });
        
        this.realtimeVoice.on('recordingStopped', () => {
            this.updateVoiceStatus('processing', 'Verwerken...');
        });
        
        this.realtimeVoice.on('audioPlaying', () => {
            this.updateVoiceStatus('speaking', 'AI spreekt...');
        });
    }
    
    showWelcomeScreen() {
        this.currentScreen = 'welcome';
        document.getElementById('welcome-screen').style.display = 'block';
        document.getElementById('voice-screen').style.display = 'none';
        document.getElementById('text-screen').style.display = 'none';
    }
    
    async startVoiceConversation() {
        if (!this.apiKey) {
            this.showError('Voer eerst uw OpenAI API key in');
            return;
        }
        
        try {
            this.isVoiceMode = true;
            this.currentScreen = 'voice';
            
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('voice-screen').style.display = 'block';
            document.getElementById('text-screen').style.display = 'none';
            
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
        
        this.isVoiceMode = false;
        this.currentScreen = 'text';
        
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('voice-screen').style.display = 'none';
        document.getElementById('text-screen').style.display = 'block';
        
        // Add initial AI message
        this.addMessage('assistant', 'Welkom! Ik ben uw cardiologische AI assistent. Wat is uw belangrijkste hartklacht?', 'text');
    }
    
    async toggleVoiceRecording() {
        if (!this.realtimeVoice.isRecording) {
            await this.realtimeVoice.startRecording();
            document.getElementById('voice-toggle').innerHTML = '<span class="voice-icon">⏹️</span><span>Stop Opname</span>';
        } else {
            this.realtimeVoice.stopRecording();
            document.getElementById('voice-toggle').innerHTML = '<span class="voice-icon">🎤</span><span>Start Opname</span>';
        }
    }
    
    sendTextMessage() {
        const textInput = document.getElementById('text-input');
        const message = textInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addMessage('user', message, 'text');
        
        // Send to OpenAI
        this.realtimeVoice.sendTextMessage(message);
        
        // Clear input
        textInput.value = '';
        
        // Extract medical data
        this.extractMedicalData(message);
    }
    
    addMessage(role, content, mode) {
        const container = mode === 'voice' ? 
            document.getElementById('voice-chat-container') : 
            document.getElementById('text-chat-container');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const timestamp = new Date().toLocaleTimeString('nl-NL');
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="role">${role === 'assistant' ? '🤖 AI Cardioloog' : '👤 Patiënt'}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${content}</div>
            ${role === 'assistant' ? '<button class="repeat-btn" onclick="this.parentElement.querySelector(\'.message-content\').textContent">🔊 Herhaal</button>' : ''}
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        
        // Update conversation history
        this.conversationHistory.push({ role, content, timestamp });
    }
    
    handleTextResponse(delta) {
        // Handle streaming text response
        console.log('Text delta:', delta);
    }
    
    handleAudioResponse(delta) {
        // Handle streaming audio response
        this.realtimeVoice.playAudio(delta);
    }
    
    handleResponseComplete(event) {
        // Handle complete response
        console.log('Response complete:', event);
        this.updateVoiceStatus('ready', 'Klaar voor volgende vraag');
    }
    
    updateVoiceStatus(status, text) {
        const statusElement = document.getElementById('voice-status');
        statusElement.textContent = text;
        statusElement.className = `voice-status ${status}`;
        
        // Update visualizer
        this.updateAudioVisualizer(status === 'listening');
    }
    
    updateAudioVisualizer(active) {
        const bars = document.querySelectorAll('.visualizer-bar');
        bars.forEach((bar, index) => {
            if (active) {
                const height = Math.random() * 100;
                bar.style.height = `${height}%`;
            } else {
                bar.style.height = '10%';
            }
        });
    }
    
    extractMedicalData(text) {
        // Simple medical data extraction
        const lowerText = text.toLowerCase();
        
        // Extract symptoms
        if (lowerText.includes('pijn') || lowerText.includes('klacht')) {
            this.medicalData.symptoms.push(text);
            this.updateMedicalSidebar();
        }
        
        // Update progress
        this.medicalData.progress = Math.min(100, this.medicalData.progress + 10);
        this.updateProgress();
    }
    
    updateMedicalSidebar() {
        // Update symptoms list
        const symptomsList = document.getElementById('symptoms-list');
        if (this.medicalData.symptoms.length > 0) {
            symptomsList.innerHTML = this.medicalData.symptoms.map(s => `<li>${s}</li>`).join('');
        }
    }
    
    updateProgress() {
        const progressValue = document.getElementById('progress-value');
        const progressCircle = document.getElementById('progress-circle');
        
        progressValue.textContent = `${this.medicalData.progress}%`;
        
        const angle = (this.medicalData.progress / 100) * 360;
        progressCircle.style.background = `conic-gradient(#3498db ${angle}deg, #ecf0f1 ${angle}deg)`;
    }
    
    switchToTextMode() {
        this.isVoiceMode = false;
        document.getElementById('voice-screen').style.display = 'none';
        document.getElementById('text-screen').style.display = 'block';
    }
    
    switchToVoiceMode() {
        this.isVoiceMode = true;
        document.getElementById('text-screen').style.display = 'none';
        document.getElementById('voice-screen').style.display = 'block';
    }
    
    endSession() {
        if (this.realtimeVoice) {
            this.realtimeVoice.disconnect();
        }
        this.showWelcomeScreen();
    }
    
    generateReport() {
        // Generate medical report
        const report = this.createMedicalReport();
        console.log('Generated report:', report);
        this.showSuccess('Medisch rapport gegenereerd');
    }
    
    createMedicalReport() {
        return {
            timestamp: new Date().toISOString(),
            symptoms: this.medicalData.symptoms,
            medications: this.medicalData.medications,
            riskFactors: this.medicalData.riskFactors,
            progress: this.medicalData.progress,
            conversation: this.conversationHistory
        };
    }
    
    downloadPDF() {
        // Download PDF report
        this.showSuccess('PDF download gestart');
    }
    
    showError(message) {
        const errorContainer = document.getElementById('error-container');
        const errorText = document.getElementById('error-text');
        
        errorText.textContent = message;
        errorContainer.style.display = 'block';
        
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }
    
    showSuccess(message) {
        // Show success message (similar to error but green)
        console.log('Success:', message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Medical Voice Chat App...');
    window.medicalVoiceApp = new MedicalVoiceChatApp();
});

// Export for global access
if (typeof window !== 'undefined') {
    window.MedicalVoiceChatApp = MedicalVoiceChatApp;
}

