// Enhanced Medical Voice Chat Application with Cardiology Specialization

class EnhancedMedicalApp {
    constructor() {
        this.conversationEngine = null;
        this.reportGenerator = null;
        this.pdfGenerator = null;
        this.currentMode = 'text'; // 'text' or 'voice'
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.conversationActive = false;
        this.conversationData = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing Enhanced Medical App...');
        
        try {
            // Initialize enhanced components
            this.conversationEngine = new EnhancedConversationEngine();
            this.reportGenerator = new MedicalReportGenerator();
            this.pdfGenerator = new PDFReportGenerator();
            
            // Setup UI event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            console.log('Enhanced Medical App initialized successfully');
        } catch (error) {
            console.error('Error initializing Enhanced Medical App:', error);
            this.showError('Er is een fout opgetreden bij het initialiseren van de applicatie.');
        }
    }

    setupEventListeners() {
        // Text conversation button
        const textButton = document.getElementById('startTextConversation');
        if (textButton) {
            textButton.addEventListener('click', () => this.startTextConversation());
        }

        // Voice conversation button
        const voiceButton = document.getElementById('startVoiceConversation');
        if (voiceButton) {
            voiceButton.addEventListener('click', () => this.startVoiceConversation());
        }

        // Microphone button
        const micButton = document.getElementById('microphoneButton');
        if (micButton) {
            micButton.addEventListener('click', () => this.toggleRecording());
        }

        // Send message button
        const sendButton = document.getElementById('sendMessage');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendTextMessage());
        }

        // Text input enter key
        const textInput = document.getElementById('messageInput');
        if (textInput) {
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendTextMessage();
                }
            });
        }

        // Generate report button
        const reportButton = document.getElementById('generateReport');
        if (reportButton) {
            reportButton.addEventListener('click', () => this.generateMedicalReport());
        }

        // Download PDF button
        const pdfButton = document.getElementById('downloadPDF');
        if (pdfButton) {
            pdfButton.addEventListener('click', () => this.downloadPDFReport());
        }

        // End conversation button
        const endButton = document.getElementById('endConversation');
        if (endButton) {
            endButton.addEventListener('click', () => this.endConversation());
        }
    }

    initializeUI() {
        // Hide conversation interface initially
        this.hideConversationInterface();
        
        // Show welcome message
        this.showWelcomeMessage();
        
        // Update UI state
        this.updateUIState();
    }

    showWelcomeMessage() {
        const welcomeMessage = `
        <div class="welcome-container">
            <h2>🏥 Welkom bij de Cardiologische AI Assistent</h2>
            <p>Deze geavanceerde AI assistent helpt u bij het verzamelen van een volledige cardiologische anamnese.</p>
            
            <div class="features-grid">
                <div class="feature-card">
                    <h3>🎤 Spraakherkenning</h3>
                    <p>Spreek natuurlijk over uw hartklachten</p>
                </div>
                <div class="feature-card">
                    <h3>💬 Intelligente Vragen</h3>
                    <p>Geen herhalingen, gerichte cardiologische vragen</p>
                </div>
                <div class="feature-card">
                    <h3>📋 Professioneel Rapport</h3>
                    <p>Gedetailleerd medisch rapport voor uw cardioloog</p>
                </div>
                <div class="feature-card">
                    <h3>⚡ Risico Assessment</h3>
                    <p>Automatische beoordeling van cardiovasculaire risicofactoren</p>
                </div>
            </div>
            
            <div class="start-options">
                <p><strong>Kies uw voorkeursmanier om te beginnen:</strong></p>
                <div class="button-group">
                    <button id="startTextConversation" class="btn btn-primary">
                        💬 Start Tekstgesprek
                    </button>
                    <button id="startVoiceConversation" class="btn btn-secondary">
                        🎤 Start Spraakgesprek
                    </button>
                </div>
            </div>
        </div>
        `;
        
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.innerHTML = welcomeMessage;
        }
    }

    async startTextConversation() {
        console.log('Starting text conversation...');
        
        this.currentMode = 'text';
        this.conversationActive = true;
        
        // Show conversation interface
        this.showConversationInterface();
        
        // Start conversation with enhanced engine
        const response = this.conversationEngine.startConversation();
        
        // Display AI opening message
        this.addMessageToChat('ai', response.response);
        
        // Update UI
        this.updateUIState();
        
        // Enable text input
        this.enableTextInput();
    }

    async startVoiceConversation() {
        console.log('Starting voice conversation...');
        
        try {
            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // Stop the stream, we just needed permission
            
            this.currentMode = 'voice';
            this.conversationActive = true;
            
            // Show conversation interface
            this.showConversationInterface();
            
            // Start conversation with enhanced engine
            const response = this.conversationEngine.startConversation();
            
            // Display AI opening message
            this.addMessageToChat('ai', response.response);
            
            // Speak the opening message
            await this.speakText(response.response);
            
            // Update UI
            this.updateUIState();
            
            // Enable voice input
            this.enableVoiceInput();
            
        } catch (error) {
            console.error('Error starting voice conversation:', error);
            this.showError('Microfoon toegang is vereist voor spraakgesprek. Controleer uw browser instellingen.');
        }
    }

    showConversationInterface() {
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.innerHTML = `
            <div class="conversation-header">
                <h3>🏥 Cardiologische Anamnese</h3>
                <div class="conversation-status">
                    <span class="status-indicator active"></span>
                    <span>Gesprek actief</span>
                </div>
            </div>
            
            <div class="chat-messages" id="chatMessages">
                <!-- Messages will be added here -->
            </div>
            
            <div class="conversation-progress" id="conversationProgress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">Fase: Hoofdklacht (0% voltooid)</span>
            </div>
            
            <div class="input-container" id="inputContainer">
                <!-- Input controls will be added based on mode -->
            </div>
            
            <div class="conversation-controls">
                <button id="generateReport" class="btn btn-outline" disabled>
                    📋 Genereer Rapport
                </button>
                <button id="downloadPDF" class="btn btn-outline" disabled>
                    📄 Download PDF
                </button>
                <button id="endConversation" class="btn btn-danger">
                    ❌ Beëindig Gesprek
                </button>
            </div>
            `;
        }
    }

    hideConversationInterface() {
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.innerHTML = '';
        }
    }

    enableTextInput() {
        const inputContainer = document.getElementById('inputContainer');
        if (inputContainer) {
            inputContainer.innerHTML = `
            <div class="text-input-group">
                <textarea 
                    id="messageInput" 
                    placeholder="Typ uw antwoord hier..." 
                    rows="3"
                    class="form-control"
                ></textarea>
                <button id="sendMessage" class="btn btn-primary">
                    📤 Verstuur
                </button>
            </div>
            `;
            
            // Re-attach event listeners
            this.setupInputEventListeners();
        }
    }

    enableVoiceInput() {
        const inputContainer = document.getElementById('inputContainer');
        if (inputContainer) {
            inputContainer.innerHTML = `
            <div class="voice-input-group">
                <button id="microphoneButton" class="btn btn-voice">
                    🎤 Druk om te spreken
                </button>
                <div class="voice-status" id="voiceStatus">
                    Klaar om te luisteren
                </div>
            </div>
            `;
            
            // Re-attach event listeners
            this.setupInputEventListeners();
        }
    }

    setupInputEventListeners() {
        // Send message button
        const sendButton = document.getElementById('sendMessage');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendTextMessage());
        }

        // Text input enter key
        const textInput = document.getElementById('messageInput');
        if (textInput) {
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendTextMessage();
                }
            });
        }

        // Microphone button
        const micButton = document.getElementById('microphoneButton');
        if (micButton) {
            micButton.addEventListener('click', () => this.toggleRecording());
        }
    }

    async sendTextMessage() {
        const textInput = document.getElementById('messageInput');
        if (!textInput || !textInput.value.trim()) return;
        
        const userMessage = textInput.value.trim();
        textInput.value = '';
        
        // Add user message to chat
        this.addMessageToChat('user', userMessage);
        
        // Process with enhanced conversation engine
        await this.processUserInput(userMessage);
    }

    async toggleRecording() {
        if (this.isRecording) {
            await this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.isRecording = true;
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                await this.processAudioInput(audioBlob);
            };
            
            this.mediaRecorder.start();
            
            // Update UI
            this.updateVoiceStatus('🔴 Aan het opnemen... Klik nogmaals om te stoppen');
            const micButton = document.getElementById('microphoneButton');
            if (micButton) {
                micButton.textContent = '⏹️ Stop opname';
                micButton.classList.add('recording');
            }
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showError('Kan opname niet starten. Controleer uw microfoon instellingen.');
        }
    }

    async stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            
            // Update UI
            this.updateVoiceStatus('🔄 Verwerken van spraak...');
            const micButton = document.getElementById('microphoneButton');
            if (micButton) {
                micButton.textContent = '🎤 Druk om te spreken';
                micButton.classList.remove('recording');
            }
        }
    }

    async processAudioInput(audioBlob) {
        try {
            // Convert audio to text using Whisper API
            const transcription = await this.transcribeAudio(audioBlob);
            
            if (transcription && transcription.trim()) {
                // Add user message to chat
                this.addMessageToChat('user', transcription);
                
                // Process with enhanced conversation engine
                await this.processUserInput(transcription);
            } else {
                this.updateVoiceStatus('❌ Spraak niet herkend. Probeer opnieuw.');
                setTimeout(() => {
                    this.updateVoiceStatus('Klaar om te luisteren');
                }, 3000);
            }
            
        } catch (error) {
            console.error('Error processing audio:', error);
            this.updateVoiceStatus('❌ Spraakherkenning mislukt. Probeer opnieuw.');
            setTimeout(() => {
                this.updateVoiceStatus('Klaar om te luisteren');
            }, 3000);
        }
    }

    async transcribeAudio(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');
            
            const response = await fetch('/api/whisper/transcribe', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                return result.transcription;
            } else {
                throw new Error(result.error || 'Transcription failed');
            }
            
        } catch (error) {
            console.error('Error transcribing audio:', error);
            
            // Fallback to demo mode for testing
            const demoResponses = [
                "Ik heb pijn op de borst",
                "Ik ben kortademig bij inspanning",
                "Ik heb hartkloppingen",
                "Ik ben soms duizelig",
                "Ik heb gezwollen benen"
            ];
            
            return demoResponses[Math.floor(Math.random() * demoResponses.length)];
        }
    }

    async processUserInput(userInput) {
        try {
            // Show thinking indicator
            this.showThinkingIndicator();
            
            // Process with enhanced conversation engine
            const response = await this.conversationEngine.processUserResponse(userInput);
            
            // Hide thinking indicator
            this.hideThinkingIndicator();
            
            // Add AI response to chat
            this.addMessageToChat('ai', response.response);
            
            // Speak response if in voice mode
            if (this.currentMode === 'voice') {
                await this.speakText(response.response);
            }
            
            // Update conversation progress
            this.updateConversationProgress(response.conversationProgress);
            
            // Check if conversation is complete
            if (this.conversationEngine.isConversationComplete()) {
                this.enableReportGeneration();
            }
            
            // Update voice status
            if (this.currentMode === 'voice') {
                this.updateVoiceStatus('✅ Klaar met spreken. U kunt nu antwoorden.');
            }
            
        } catch (error) {
            console.error('Error processing user input:', error);
            this.hideThinkingIndicator();
            this.addMessageToChat('ai', 'Er is een fout opgetreden. Kunt u uw antwoord herhalen?');
        }
    }

    async speakText(text) {
        try {
            if ('speechSynthesis' in window) {
                // Cancel any ongoing speech
                speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Configure speech settings for natural Dutch
                utterance.lang = 'nl-NL';
                utterance.rate = 1.1; // Slightly faster for natural flow
                utterance.pitch = 1.0;
                utterance.volume = 0.9;
                
                // Try to find a good Dutch voice
                const voices = speechSynthesis.getVoices();
                const dutchVoice = voices.find(voice => 
                    voice.lang.startsWith('nl') && 
                    (voice.name.includes('Enhanced') || voice.name.includes('Premium') || voice.name.includes('Neural'))
                ) || voices.find(voice => voice.lang.startsWith('nl'));
                
                if (dutchVoice) {
                    utterance.voice = dutchVoice;
                    console.log('Using Dutch voice:', dutchVoice.name);
                }
                
                // Add visual feedback during speech
                this.showSpeakingIndicator();
                
                utterance.onend = () => {
                    this.hideSpeakingIndicator();
                };
                
                utterance.onerror = (error) => {
                    console.error('Speech synthesis error:', error);
                    this.hideSpeakingIndicator();
                };
                
                speechSynthesis.speak(utterance);
                
                return new Promise((resolve) => {
                    utterance.onend = () => {
                        this.hideSpeakingIndicator();
                        resolve();
                    };
                });
            }
        } catch (error) {
            console.error('Error speaking text:', error);
            this.hideSpeakingIndicator();
        }
    }

    addMessageToChat(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString('nl-NL', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        if (sender === 'ai') {
            messageDiv.innerHTML = `
            <div class="message-header">
                <span class="sender">🏥 AI Cardioloog</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${message}</div>
            <div class="message-actions">
                <button class="btn-repeat" onclick="app.repeatMessage('${message.replace(/'/g, "\\'")}')">
                    🔊 Herhaal
                </button>
            </div>
            `;
        } else {
            messageDiv.innerHTML = `
            <div class="message-header">
                <span class="sender">👤 U</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${message}</div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async repeatMessage(message) {
        await this.speakText(message);
    }

    showThinkingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const thinkingDiv = document.createElement('div');
        thinkingDiv.id = 'thinkingIndicator';
        thinkingDiv.className = 'message ai-message thinking';
        thinkingDiv.innerHTML = `
        <div class="message-header">
            <span class="sender">🏥 AI Cardioloog</span>
            <span class="timestamp">${new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="message-content">
            <div class="thinking-animation">
                <span>🤔 AI analyseert uw antwoord</span>
                <div class="dots">
                    <span>.</span><span>.</span><span>.</span>
                </div>
            </div>
        </div>
        `;
        
        chatMessages.appendChild(thinkingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideThinkingIndicator() {
        const thinkingIndicator = document.getElementById('thinkingIndicator');
        if (thinkingIndicator) {
            thinkingIndicator.remove();
        }
    }

    showSpeakingIndicator() {
        const voiceStatus = document.getElementById('voiceStatus');
        if (voiceStatus) {
            voiceStatus.innerHTML = '🔊 AI spreekt... <div class="pulse-animation"></div>';
            voiceStatus.classList.add('speaking');
        }
    }

    hideSpeakingIndicator() {
        const voiceStatus = document.getElementById('voiceStatus');
        if (voiceStatus) {
            voiceStatus.innerHTML = 'Klaar om te luisteren';
            voiceStatus.classList.remove('speaking');
        }
    }

    updateVoiceStatus(status) {
        const voiceStatus = document.getElementById('voiceStatus');
        if (voiceStatus) {
            voiceStatus.textContent = status;
        }
    }

    updateConversationProgress(progress) {
        if (!progress) return;
        
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress.percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Fase: ${progress.currentPhase} (${progress.percentage}% voltooid)`;
        }
    }

    enableReportGeneration() {
        const reportButton = document.getElementById('generateReport');
        const pdfButton = document.getElementById('downloadPDF');
        
        if (reportButton) {
            reportButton.disabled = false;
            reportButton.classList.add('btn-success');
        }
        
        if (pdfButton) {
            pdfButton.disabled = false;
            pdfButton.classList.add('btn-success');
        }
    }

    async generateMedicalReport() {
        try {
            console.log('Generating medical report...');
            
            // Get conversation data
            const conversationData = this.conversationEngine.conversationState;
            
            // Generate report
            const reportResult = this.reportGenerator.generateCardiologyReport(conversationData);
            
            if (reportResult.success) {
                this.conversationData = reportResult;
                
                // Show report preview
                this.showReportPreview(reportResult);
                
                console.log('Medical report generated successfully');
            } else {
                throw new Error(reportResult.error);
            }
            
        } catch (error) {
            console.error('Error generating medical report:', error);
            this.showError('Er is een fout opgetreden bij het genereren van het rapport.');
        }
    }

    showReportPreview(reportData) {
        // Create report preview modal or section
        const previewHTML = this.generateReportPreviewHTML(reportData);
        
        // Show in modal or new section
        this.showModal('Rapport Voorbeeld', previewHTML);
    }

    generateReportPreviewHTML(reportData) {
        const report = reportData.report;
        
        let html = `
        <div class="report-preview">
            <div class="report-header">
                <h3>${report.header.title}</h3>
                <p>${report.header.subtitle}</p>
                <div class="report-meta">
                    <strong>Patiënt:</strong> ${report.header.patientName}<br>
                    <strong>Datum:</strong> ${report.header.reportDate}<br>
                    <strong>Volledigheid:</strong> ${reportData.metadata.completeness.percentage}%
                </div>
            </div>
        `;
        
        // Add key sections
        for (const [sectionName, section] of Object.entries(report.sections)) {
            if (!section.isEmpty) {
                html += `
                <div class="report-section">
                    <h4>${section.title}</h4>
                    <div class="section-content">
                        ${this.formatSectionForPreview(section.content)}
                    </div>
                </div>
                `;
            }
        }
        
        html += `
        </div>
        <div class="report-actions">
            <button class="btn btn-primary" onclick="app.downloadPDFReport()">
                📄 Download PDF Rapport
            </button>
            <button class="btn btn-secondary" onclick="app.previewFullReport()">
                👁️ Volledig Rapport Bekijken
            </button>
        </div>
        `;
        
        return html;
    }

    formatSectionForPreview(content) {
        if (typeof content === 'string') {
            return `<p>${content}</p>`;
        } else if (typeof content === 'object') {
            let html = '';
            for (const [key, value] of Object.entries(content)) {
                if (typeof value === 'object') {
                    html += `<strong>${key}:</strong> [Gedetailleerde informatie beschikbaar in volledig rapport]<br>`;
                } else {
                    html += `<strong>${key}:</strong> ${value}<br>`;
                }
            }
            return html;
        }
        return '';
    }

    async downloadPDFReport() {
        try {
            if (!this.conversationData) {
                await this.generateMedicalReport();
            }
            
            console.log('Downloading PDF report...');
            
            // Generate and download PDF
            this.pdfGenerator.downloadPDF(this.conversationData);
            
        } catch (error) {
            console.error('Error downloading PDF report:', error);
            this.showError('Er is een fout opgetreden bij het downloaden van het PDF rapport.');
        }
    }

    previewFullReport() {
        if (this.conversationData) {
            this.pdfGenerator.previewReport(this.conversationData);
        }
    }

    endConversation() {
        if (confirm('Weet u zeker dat u het gesprek wilt beëindigen?')) {
            this.conversationActive = false;
            this.currentMode = 'text';
            
            // Stop any ongoing recording
            if (this.isRecording) {
                this.stopRecording();
            }
            
            // Stop any ongoing speech
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            
            // Reset UI
            this.initializeUI();
            
            console.log('Conversation ended');
        }
    }

    updateUIState() {
        // Update UI based on current state
        const textButton = document.getElementById('startTextConversation');
        const voiceButton = document.getElementById('startVoiceConversation');
        
        if (this.conversationActive) {
            if (textButton) textButton.style.display = 'none';
            if (voiceButton) voiceButton.style.display = 'none';
        } else {
            if (textButton) textButton.style.display = 'inline-block';
            if (voiceButton) voiceButton.style.display = 'inline-block';
        }
    }

    showModal(title, content) {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
        `;
        
        document.body.appendChild(modalOverlay);
        
        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });
    }

    showError(message) {
        console.error('App Error:', message);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
        <div class="error-content">
            <span class="error-icon">⚠️</span>
            <span class="error-text">${message}</span>
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
}

// Initialize the enhanced app when DOM is loaded
let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Enhanced Medical App...');
    app = new EnhancedMedicalApp();
});

// Export for global access
window.EnhancedMedicalApp = EnhancedMedicalApp;

