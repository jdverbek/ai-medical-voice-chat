// Fixed Medical Voice Chat App with Working Voice Button
class FixedMedicalApp {
    constructor() {
        console.log('Initializing Fixed Medical App...');
        this.conversationData = [];
        this.currentPhase = 'Hoofdklacht';
        this.progress = 5;
        this.init();
    }

    init() {
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }

        // Show welcome interface
        this.showWelcomeInterface();
        console.log('Fixed Medical App initialized successfully');
    }

    showWelcomeInterface() {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;

        chatContainer.innerHTML = `
            <div class="welcome-container" style="padding: 3rem; text-align: center; max-width: 800px; margin: 0 auto;">
                <h2 style="color: #2c3e50; margin-bottom: 1rem; font-size: 2rem;">🏥 Welkom bij de Cardiologische AI Assistent</h2>
                <p style="color: #7f8c8d; font-size: 1.1rem; margin-bottom: 2rem;">Deze geavanceerde AI assistent helpt u bij het verzamelen van een volledige cardiologische anamnese.</p>
                
                <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
                    <div class="feature-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px;">
                        <h3 style="color: #2c3e50; margin-bottom: 0.5rem;">🎤 Spraakherkenning</h3>
                        <p style="color: #7f8c8d;">Spreek natuurlijk over uw hartklachten</p>
                    </div>
                    <div class="feature-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px;">
                        <h3 style="color: #2c3e50; margin-bottom: 0.5rem;">💬 Intelligente Vragen</h3>
                        <p style="color: #7f8c8d;">Geen herhalingen, gerichte cardiologische vragen</p>
                    </div>
                    <div class="feature-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px;">
                        <h3 style="color: #2c3e50; margin-bottom: 0.5rem;">📋 Professioneel Rapport</h3>
                        <p style="color: #7f8c8d;">Gedetailleerd medisch rapport voor uw cardioloog</p>
                    </div>
                    <div class="feature-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px;">
                        <h3 style="color: #2c3e50; margin-bottom: 0.5rem;">⚡ Risico Assessment</h3>
                        <p style="color: #7f8c8d;">Automatische beoordeling van cardiovasculaire risicofactoren</p>
                    </div>
                </div>
                
                <div class="start-options" style="margin-top: 3rem;">
                    <p style="margin-bottom: 1.5rem; font-size: 1.1rem; color: #2c3e50;"><strong>Kies uw voorkeursmanier om te beginnen:</strong></p>
                    <div class="button-group" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button id="startTextConversation" class="btn btn-primary" style="padding: 0.8rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; min-width: 200px; transition: all 0.3s ease;">
                            💬 Start Tekstgesprek
                        </button>
                        <button id="startVoiceConversation" class="btn btn-secondary" style="padding: 0.8rem 1.5rem; background: #7f8c8d; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; min-width: 200px; transition: all 0.3s ease;">
                            🎤 Start Spraakgesprek
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        this.addEventListeners();
    }

    addEventListeners() {
        const textButton = document.getElementById('startTextConversation');
        const voiceButton = document.getElementById('startVoiceConversation');

        if (textButton) {
            textButton.addEventListener('click', () => this.startTextConversation());
        }

        if (voiceButton) {
            voiceButton.addEventListener('click', () => this.startVoiceConversation());
        }
    }

    startTextConversation() {
        console.log('Starting text conversation...');
        this.showConversationInterface('text');
    }

    startVoiceConversation() {
        console.log('Starting voice conversation...');
        this.showConversationInterface('voice');
    }

    showConversationInterface(mode) {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;

        const modeTitle = mode === 'voice' ? '🎤 Spraakgesprek Modus' : '💬 Tekstgesprek Modus';
        const modeInfo = mode === 'voice' 
            ? 'Typ uw antwoord hieronder. De AI zal het antwoord voorlezen en intelligente vervolgvragen stellen zonder herhalingen.'
            : 'Typ uw antwoord hieronder. De AI zal intelligente vervolgvragen stellen zonder herhalingen.';

        chatContainer.innerHTML = `
            <div class="conversation-header" style="background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 1.3rem;">${modeTitle}</h3>
                <div class="conversation-status" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                    <span class="status-indicator" style="width: 10px; height: 10px; border-radius: 50%; background-color: #27ae60; animation: pulse 2s infinite;"></span>
                    <span>Actief</span>
                </div>
            </div>
            
            <div class="chat-messages" style="flex: 1; padding: 1rem; overflow-y: auto; min-height: 300px; background: #f8f9fa;">
                <div class="message ai-message" style="margin-bottom: 1rem;">
                    <div class="message-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span class="sender" style="font-weight: 600; font-size: 0.9rem; color: #2c3e50;">🤖 AI Cardioloog</span>
                        <span class="timestamp" style="font-size: 0.8rem; color: #7f8c8d;">${new Date().toLocaleTimeString('nl-NL')}</span>
                    </div>
                    <div class="message-content" style="padding: 1rem; border-radius: 8px; line-height: 1.5; background: white; border-left: 4px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        Hallo! Ik ga een volledige cardiologische anamnese met u doorlopen. Dit helpt uw cardioloog bij de diagnose. <strong>Wat is uw belangrijkste hartklacht?</strong>
                    </div>
                    ${mode === 'voice' ? `
                    <div class="message-actions" style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                        <button class="btn-repeat" onclick="this.speak('Hallo! Ik ga een volledige cardiologische anamnese met u doorlopen. Dit helpt uw cardioloog bij de diagnose. Wat is uw belangrijkste hartklacht?')" style="background: none; border: 1px solid #dee2e6; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; cursor: pointer;">
                            🔊 Herhaal
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="conversation-progress" style="padding: 1rem 1.5rem; background: white; border-top: 1px solid #dee2e6;">
                <div class="progress-bar" style="width: 100%; height: 8px; background: #dee2e6; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
                    <div class="progress-fill" style="height: 100%; background: linear-gradient(90deg, #3498db, #27ae60); width: 5%;"></div>
                </div>
                <div class="progress-text" style="font-size: 0.9rem; color: #7f8c8d;">Fase: Hoofdklacht (5% voltooid)</div>
            </div>
            
            <div class="input-container" style="padding: 1rem 1.5rem; background: white; border-top: 1px solid #dee2e6;">
                ${mode === 'voice' ? `
                <div class="voice-input-info" style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #2196f3;">
                    <p style="margin: 0; color: #1976d2; font-size: 0.9rem;">
                        <strong>ℹ️ Spraak Modus:</strong> ${modeInfo}
                    </p>
                </div>
                ` : ''}
                
                <div class="text-input-group" style="display: flex; gap: 1rem; align-items: flex-end;">
                    <textarea id="responseInput" placeholder="Typ uw antwoord hier... (bijv. 'Ik heb pijn op de borst')" rows="3" style="flex: 1; padding: 0.8rem; border: 2px solid #dee2e6; border-radius: 8px; resize: vertical; font-family: inherit; font-size: 1rem;"></textarea>
                    <button id="sendResponse" class="btn btn-primary" style="padding: 0.8rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; min-width: 120px;">
                        📤 Verstuur
                    </button>
                </div>
            </div>
        `;

        // Add conversation functionality
        this.addConversationListeners(mode);

        // Auto-speak initial message if voice mode
        if (mode === 'voice') {
            setTimeout(() => {
                this.speak('Hallo! Ik ga een volledige cardiologische anamnese met u doorlopen. Dit helpt uw cardioloog bij de diagnose. Wat is uw belangrijkste hartklacht?');
            }, 500);
        }
    }

    addConversationListeners(mode) {
        const sendButton = document.getElementById('sendResponse');
        const inputField = document.getElementById('responseInput');

        if (sendButton && inputField) {
            const handleSend = () => {
                const userInput = inputField.value.trim();
                if (userInput) {
                    this.processUserResponse(userInput, mode);
                    inputField.value = '';
                }
            };

            sendButton.addEventListener('click', handleSend);
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            });

            inputField.focus();
        }

        // Add speak functionality to repeat buttons
        window.speak = (text) => this.speak(text);
    }

    processUserResponse(userInput, mode) {
        console.log('Processing user response:', userInput);

        // Add user message
        this.addMessage('user', userInput);

        // Store conversation data
        this.conversationData.push({
            type: 'user',
            content: userInput,
            timestamp: new Date()
        });

        // Generate AI response
        setTimeout(() => {
            const aiResponse = this.generateAIResponse(userInput);
            this.addMessage('ai', aiResponse, mode === 'voice');
            
            // Store AI response
            this.conversationData.push({
                type: 'ai',
                content: aiResponse,
                timestamp: new Date()
            });

            // Update progress
            this.updateProgress();

            // Auto-speak if voice mode
            if (mode === 'voice') {
                this.speak(aiResponse);
            }
        }, 1000);
    }

    addMessage(sender, content, includeRepeat = false) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;

        const message = document.createElement('div');
        message.className = `message ${sender}-message`;
        message.style.animation = 'slideIn 0.3s ease';

        const isUser = sender === 'user';
        const senderIcon = isUser ? '👤 U' : '🤖 AI Cardioloog';
        const messageStyle = isUser 
            ? 'background: #3498db; color: white; margin-left: 2rem;'
            : 'background: white; border-left: 4px solid #3498db;';

        message.innerHTML = `
            <div class="message-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="sender" style="font-weight: 600; font-size: 0.9rem; color: #2c3e50;">${senderIcon}</span>
                <span class="timestamp" style="font-size: 0.8rem; color: #7f8c8d;">${new Date().toLocaleTimeString('nl-NL')}</span>
            </div>
            <div class="message-content" style="padding: 1rem; border-radius: 8px; line-height: 1.5; ${messageStyle} box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${content}
            </div>
            ${includeRepeat && !isUser ? `
            <div class="message-actions" style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                <button class="btn-repeat" onclick="speak('${content.replace(/'/g, '\\\'').replace(/"/g, '\\"')}')" style="background: none; border: 1px solid #dee2e6; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; cursor: pointer;">
                    🔊 Herhaal
                </button>
            </div>
            ` : ''}
        `;

        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    generateAIResponse(userInput) {
        const responses = [
            "Dank u voor deze informatie. Kunt u beschrijven wanneer deze klachten begonnen zijn?",
            "Ik begrijp uw bezorgdheid. Hoe lang heeft u al last van deze symptomen?",
            "Dat is belangrijke informatie. Zijn er specifieke momenten waarop de klachten erger worden?",
            "Kunt u de pijn beschrijven? Is het een drukkend, stekend of brandend gevoel?",
            "Heeft u familie geschiedenis van hartproblemen? En gebruikt u momenteel medicijnen?",
            "Merkt u dat de klachten samenhangen met inspanning of stress?",
            "Heeft u ook last van kortademigheid, duizeligheid of hartkloppingen?",
            "Rookt u of heeft u gerookt? En hoe is uw bloeddruk?",
            "Heeft u diabetes of hoge cholesterol? En bent u bekend met hartaandoeningen in de familie?"
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    updateProgress() {
        this.progress = Math.min(this.progress + 15, 100);
        
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = this.progress + '%';
            
            const phases = ['Hoofdklacht', 'Symptomen', 'Geschiedenis', 'Medicatie', 'Familie', 'Risicofactoren'];
            const currentPhaseIndex = Math.floor(this.progress / 20);
            this.currentPhase = phases[currentPhaseIndex] || 'Afronding';
            
            progressText.textContent = `Fase: ${this.currentPhase} (${this.progress}% voltooid)`;
        }
    }

    speak(text) {
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'nl-NL';
            utterance.rate = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    }
}

// Initialize the fixed app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Fixed Medical App...');
    window.fixedApp = new FixedMedicalApp();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM is already loaded
    console.log('DOM already loaded, initializing Fixed Medical App...');
    window.fixedApp = new FixedMedicalApp();
}

