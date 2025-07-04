// OpenAI Realtime API Speech-to-Speech Implementation
// Medical Voice Chat with True Voice Conversation

class OpenAIRealtimeVoice {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = null;
        this.isConnected = false;
        this.isRecording = false;
        this.audioContext = null;
        this.microphone = null;
        this.processor = null;
        this.outputAudioContext = null;
        this.conversationHistory = [];
        this.medicalData = {
            symptoms: [],
            medications: [],
            familyHistory: [],
            riskFactors: []
        };
        
        // Medical conversation state
        this.currentPhase = 'hoofdklacht';
        this.questionCount = 0;
        this.maxQuestions = 15;
        
        this.initializeEventListeners();
    }

    async initialize() {
        try {
            console.log('Initializing OpenAI Realtime Voice...');
            
            // Import the OpenAI Realtime client (would need to be loaded via CDN or bundled)
            // For now, we'll create a WebSocket-based implementation
            await this.initializeWebSocketClient();
            
            console.log('OpenAI Realtime Voice initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize OpenAI Realtime Voice:', error);
            return false;
        }
    }

    async initializeWebSocketClient() {
        // Create WebSocket connection to OpenAI Realtime API
        const wsUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
        
        this.client = new WebSocket(wsUrl, [], {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'OpenAI-Beta': 'realtime=v1'
            }
        });

        this.client.onopen = () => {
            console.log('Connected to OpenAI Realtime API');
            this.isConnected = true;
            this.configureSession();
        };

        this.client.onmessage = (event) => {
            this.handleRealtimeEvent(JSON.parse(event.data));
        };

        this.client.onclose = () => {
            console.log('Disconnected from OpenAI Realtime API');
            this.isConnected = false;
        };

        this.client.onerror = (error) => {
            console.error('OpenAI Realtime API error:', error);
        };
    }

    configureSession() {
        // Configure the session for medical conversation
        const sessionConfig = {
            type: 'session.update',
            session: {
                modalities: ['text', 'audio'],
                instructions: `Je bent een professionele Nederlandse cardioloog die een anamnese afneemt. 
                
                Gedraag je als een ervaren arts:
                - Stel relevante vragen over hartklachten, symptomen en medische geschiedenis
                - Gebruik medische terminologie waar gepast, maar leg uit in begrijpelijke taal
                - Toon empathie en professionaliteit
                - Vraag door bij onduidelijke antwoorden
                - Verzamel systematisch informatie over:
                  * Hoofdklacht en symptomen
                  * Duur en ernst van klachten
                  * Uitlokkende factoren
                  * Medicatie en allergieën
                  * Familiegeschiedenis
                  * Cardiovasculaire risicofactoren
                
                Spreek Nederlands en houd de conversatie natuurlijk en professioneel.`,
                voice: 'alloy',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: {
                    model: 'whisper-1'
                },
                turn_detection: {
                    type: 'server_vad',
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 500
                },
                tools: [
                    {
                        type: 'function',
                        name: 'save_medical_data',
                        description: 'Save medical information extracted from patient responses',
                        parameters: {
                            type: 'object',
                            properties: {
                                category: {
                                    type: 'string',
                                    enum: ['symptom', 'medication', 'family_history', 'risk_factor'],
                                    description: 'Category of medical information'
                                },
                                data: {
                                    type: 'string',
                                    description: 'Medical information to save'
                                },
                                severity: {
                                    type: 'string',
                                    enum: ['mild', 'moderate', 'severe'],
                                    description: 'Severity level if applicable'
                                }
                            },
                            required: ['category', 'data']
                        }
                    }
                ]
            }
        };

        this.sendEvent(sessionConfig);
        
        // Start the conversation
        setTimeout(() => {
            this.startMedicalConversation();
        }, 1000);
    }

    startMedicalConversation() {
        const welcomeMessage = {
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'assistant',
                content: [
                    {
                        type: 'text',
                        text: 'Goedemorgen! Ik ben uw AI cardioloog. Ik ga vandaag een anamnese met u afnemen om uw hartklachten beter te begrijpen. Kunt u mij vertellen wat uw belangrijkste hartklacht is?'
                    }
                ]
            }
        };

        this.sendEvent(welcomeMessage);
        this.sendEvent({ type: 'response.create' });
    }

    async startVoiceConversation() {
        try {
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

            // Initialize audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 24000
            });

            // Create microphone source
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            
            // Create script processor for audio processing
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
            
            this.processor.onaudioprocess = (event) => {
                if (this.isRecording && this.isConnected) {
                    const inputBuffer = event.inputBuffer.getChannelData(0);
                    const int16Array = new Int16Array(inputBuffer.length);
                    
                    // Convert float32 to int16
                    for (let i = 0; i < inputBuffer.length; i++) {
                        const sample = Math.max(-1, Math.min(1, inputBuffer[i]));
                        int16Array[i] = sample * 0x7FFF;
                    }
                    
                    // Send audio to OpenAI
                    this.sendAudioData(int16Array);
                }
            };

            // Connect audio nodes
            this.microphone.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

            // Initialize output audio context for playback
            this.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 24000
            });

            this.isRecording = true;
            console.log('Voice conversation started');
            
            // Update UI
            this.updateUI('recording');
            
            return true;
        } catch (error) {
            console.error('Failed to start voice conversation:', error);
            this.showError('Microfoon toegang geweigerd. Controleer uw browser instellingen.');
            return false;
        }
    }

    stopVoiceConversation() {
        this.isRecording = false;
        
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        console.log('Voice conversation stopped');
        this.updateUI('stopped');
    }

    sendAudioData(audioData) {
        if (this.isConnected && this.client.readyState === WebSocket.OPEN) {
            const audioEvent = {
                type: 'input_audio_buffer.append',
                audio: this.arrayBufferToBase64(audioData.buffer)
            };
            this.sendEvent(audioEvent);
        }
    }

    sendEvent(event) {
        if (this.client && this.client.readyState === WebSocket.OPEN) {
            this.client.send(JSON.stringify(event));
        }
    }

    handleRealtimeEvent(event) {
        console.log('Received event:', event.type);

        switch (event.type) {
            case 'session.created':
                console.log('Session created');
                break;

            case 'conversation.item.created':
                this.handleConversationItem(event.item);
                break;

            case 'response.audio.delta':
                this.playAudioDelta(event.delta);
                break;

            case 'response.audio.done':
                console.log('Audio response completed');
                break;

            case 'conversation.item.input_audio_transcription.completed':
                this.handleTranscription(event.transcript);
                break;

            case 'response.function_call_arguments.done':
                this.handleFunctionCall(event);
                break;

            case 'error':
                console.error('OpenAI Realtime error:', event.error);
                this.showError('Er is een fout opgetreden in de spraakherkenning.');
                break;

            default:
                console.log('Unhandled event type:', event.type);
        }
    }

    handleConversationItem(item) {
        if (item.type === 'message' && item.role === 'assistant') {
            // Add to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: item.content,
                timestamp: new Date()
            });

            // Update UI with assistant message
            this.displayMessage('assistant', item.content);
            this.questionCount++;
        }
    }

    handleTranscription(transcript) {
        // Add user transcription to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: transcript,
            timestamp: new Date()
        });

        // Update UI with user message
        this.displayMessage('user', transcript);

        // Process medical information
        this.processMedicalInformation(transcript);
    }

    handleFunctionCall(event) {
        if (event.name === 'save_medical_data') {
            const args = JSON.parse(event.arguments);
            this.saveMedicalData(args.category, args.data, args.severity);
        }
    }

    playAudioDelta(audioData) {
        if (!this.outputAudioContext) return;

        try {
            // Decode base64 audio data
            const binaryString = atob(audioData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Convert to Int16Array
            const int16Array = new Int16Array(bytes.buffer);
            
            // Convert to Float32Array for Web Audio API
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 0x7FFF;
            }

            // Create audio buffer
            const audioBuffer = this.outputAudioContext.createBuffer(1, float32Array.length, 24000);
            audioBuffer.getChannelData(0).set(float32Array);

            // Play audio
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputAudioContext.destination);
            source.start();

        } catch (error) {
            console.error('Error playing audio delta:', error);
        }
    }

    processMedicalInformation(transcript) {
        // Extract medical information from transcript
        // This would typically be done by the AI, but we can also do client-side processing
        
        const lowerTranscript = transcript.toLowerCase();
        
        // Extract symptoms
        const symptoms = ['pijn', 'kortademig', 'duizelig', 'hartkloppingen', 'moe', 'zwelling'];
        symptoms.forEach(symptom => {
            if (lowerTranscript.includes(symptom)) {
                this.saveMedicalData('symptom', symptom);
            }
        });

        // Extract medications
        if (lowerTranscript.includes('medicijn') || lowerTranscript.includes('pil')) {
            // Extract medication names (simplified)
            this.saveMedicalData('medication', 'Medicatie genoemd in gesprek');
        }
    }

    saveMedicalData(category, data, severity = null) {
        const medicalEntry = {
            category,
            data,
            severity,
            timestamp: new Date()
        };

        switch (category) {
            case 'symptom':
                this.medicalData.symptoms.push(medicalEntry);
                break;
            case 'medication':
                this.medicalData.medications.push(medicalEntry);
                break;
            case 'family_history':
                this.medicalData.familyHistory.push(medicalEntry);
                break;
            case 'risk_factor':
                this.medicalData.riskFactors.push(medicalEntry);
                break;
        }

        console.log('Medical data saved:', medicalEntry);
        this.updateMedicalSummary();
    }

    displayMessage(role, content) {
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const timestamp = new Date().toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let displayContent = '';
        if (Array.isArray(content)) {
            displayContent = content.map(item => item.text || item.audio || '').join(' ');
        } else {
            displayContent = content;
        }

        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="role">${role === 'assistant' ? '🤖 AI Cardioloog' : '👤 U'}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${displayContent}</div>
            ${role === 'assistant' ? '<button class="repeat-btn" onclick="realtimeVoice.repeatLastMessage()">🔊 Herhaal</button>' : ''}
        `;

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    updateUI(state) {
        const statusElement = document.getElementById('voice-status');
        const startButton = document.getElementById('start-voice-btn');
        const stopButton = document.getElementById('stop-voice-btn');

        if (!statusElement) return;

        switch (state) {
            case 'recording':
                statusElement.textContent = '🎤 Luisteren... Spreek nu uw antwoord';
                statusElement.className = 'voice-status recording';
                if (startButton) startButton.style.display = 'none';
                if (stopButton) stopButton.style.display = 'inline-block';
                break;

            case 'processing':
                statusElement.textContent = '🤔 AI denkt na...';
                statusElement.className = 'voice-status processing';
                break;

            case 'speaking':
                statusElement.textContent = '🔊 AI spreekt...';
                statusElement.className = 'voice-status speaking';
                break;

            case 'stopped':
                statusElement.textContent = '⏸️ Gesprek gepauzeerd';
                statusElement.className = 'voice-status stopped';
                if (startButton) startButton.style.display = 'inline-block';
                if (stopButton) stopButton.style.display = 'none';
                break;
        }
    }

    updateMedicalSummary() {
        const summaryElement = document.getElementById('medical-summary');
        if (!summaryElement) return;

        const totalItems = this.medicalData.symptoms.length + 
                          this.medicalData.medications.length + 
                          this.medicalData.familyHistory.length + 
                          this.medicalData.riskFactors.length;

        const progress = Math.min((this.questionCount / this.maxQuestions) * 100, 100);

        summaryElement.innerHTML = `
            <h3>📋 Medische Samenvatting</h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <p>Voortgang: ${Math.round(progress)}% voltooid (${this.questionCount}/${this.maxQuestions} vragen)</p>
            <ul>
                <li>Symptomen: ${this.medicalData.symptoms.length}</li>
                <li>Medicatie: ${this.medicalData.medications.length}</li>
                <li>Familiegeschiedenis: ${this.medicalData.familyHistory.length}</li>
                <li>Risicofactoren: ${this.medicalData.riskFactors.length}</li>
            </ul>
        `;
    }

    generateMedicalReport() {
        const report = {
            timestamp: new Date(),
            conversationHistory: this.conversationHistory,
            medicalData: this.medicalData,
            summary: this.generateSummaryText(),
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    generateSummaryText() {
        let summary = "CARDIOLOGISCHE ANAMNESE SAMENVATTING\n\n";
        
        if (this.medicalData.symptoms.length > 0) {
            summary += "SYMPTOMEN:\n";
            this.medicalData.symptoms.forEach(symptom => {
                summary += `- ${symptom.data}${symptom.severity ? ` (${symptom.severity})` : ''}\n`;
            });
            summary += "\n";
        }

        if (this.medicalData.medications.length > 0) {
            summary += "MEDICATIE:\n";
            this.medicalData.medications.forEach(med => {
                summary += `- ${med.data}\n`;
            });
            summary += "\n";
        }

        if (this.medicalData.familyHistory.length > 0) {
            summary += "FAMILIEGESCHIEDENIS:\n";
            this.medicalData.familyHistory.forEach(history => {
                summary += `- ${history.data}\n`;
            });
            summary += "\n";
        }

        if (this.medicalData.riskFactors.length > 0) {
            summary += "RISICOFACTOREN:\n";
            this.medicalData.riskFactors.forEach(risk => {
                summary += `- ${risk.data}\n`;
            });
        }

        return summary;
    }

    generateRecommendations() {
        // Generate basic recommendations based on collected data
        const recommendations = [];
        
        if (this.medicalData.symptoms.some(s => s.data.includes('pijn'))) {
            recommendations.push('Verdere cardiologische evaluatie aanbevolen');
        }
        
        if (this.medicalData.symptoms.some(s => s.data.includes('kortademig'))) {
            recommendations.push('Longfunctie en hartfunctie onderzoek');
        }

        return recommendations;
    }

    repeatLastMessage() {
        // Find the last assistant message and replay its audio
        const lastAssistantMessage = this.conversationHistory
            .filter(msg => msg.role === 'assistant')
            .pop();

        if (lastAssistantMessage) {
            // Request the AI to repeat the last message
            const repeatEvent = {
                type: 'conversation.item.create',
                item: {
                    type: 'message',
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Kunt u de laatste vraag herhalen?'
                        }
                    ]
                }
            };

            this.sendEvent(repeatEvent);
            this.sendEvent({ type: 'response.create' });
        }
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    initializeEventListeners() {
        // Add event listeners for UI interactions
        document.addEventListener('DOMContentLoaded', () => {
            const startBtn = document.getElementById('start-voice-btn');
            const stopBtn = document.getElementById('stop-voice-btn');
            const reportBtn = document.getElementById('generate-report-btn');

            if (startBtn) {
                startBtn.addEventListener('click', () => this.startVoiceConversation());
            }

            if (stopBtn) {
                stopBtn.addEventListener('click', () => this.stopVoiceConversation());
            }

            if (reportBtn) {
                reportBtn.addEventListener('click', () => {
                    const report = this.generateMedicalReport();
                    this.downloadReport(report);
                });
            }
        });
    }

    downloadReport(report) {
        const reportText = JSON.stringify(report, null, 2);
        const blob = new Blob([reportText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cardiologie_anamnese_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Utility function to convert ArrayBuffer to Base64
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

// Global instance
let realtimeVoice = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Get OpenAI API key from environment or user input
    const apiKey = prompt('Voer uw OpenAI API key in:') || 'your-openai-api-key-here';
    
    realtimeVoice = new OpenAIRealtimeVoice(apiKey);
    const initialized = await realtimeVoice.initialize();
    
    if (!initialized) {
        alert('Kon OpenAI Realtime API niet initialiseren. Controleer uw API key.');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenAIRealtimeVoice;
}

