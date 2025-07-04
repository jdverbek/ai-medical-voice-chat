// Real OpenAI Realtime API Client with Conversation Memory
class OpenAIRealtimeClient {
    constructor() {
        this.ws = null;
        this.apiKey = null;
        this.isConnected = false;
        this.isRecording = false;
        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.conversationHistory = [];
        this.askedQuestions = new Set();
        this.currentPhase = 'initial';
        this.patientData = {
            symptoms: [],
            medications: [],
            familyHistory: [],
            riskFactors: [],
            duration: null,
            severity: null
        };
        
        // Cardiological question phases
        this.questionPhases = {
            initial: [
                "Wat is uw belangrijkste hartklacht?",
                "Kunt u uw klachten beschrijven?"
            ],
            symptoms: [
                "Sinds wanneer heeft u deze klachten?",
                "Hoe zou u de pijn beschrijven - drukkend, stekend, of brandend?",
                "Straalt de pijn uit naar andere delen van uw lichaam?",
                "Merkt u dat de klachten samenhangen met inspanning?",
                "Heeft u ook last van kortademigheid?",
                "Ervaart u hartkloppingen of een onregelmatige hartslag?",
                "Heeft u last van duizeligheid of flauwvallen?"
            ],
            triggers: [
                "Wat maakt de klachten erger?",
                "Wat helpt om de klachten te verminderen?",
                "Merkt u verschil tussen rust en inspanning?",
                "Zijn er specifieke situaties die de klachten uitlokken?"
            ],
            medical_history: [
                "Heeft u eerder hartproblemen gehad?",
                "Gebruikt u momenteel medicijnen?",
                "Heeft u bekende allergieën?",
                "Rookt u of heeft u gerookt?",
                "Hoeveel alcohol gebruikt u per week?"
            ],
            family_history: [
                "Zijn er hartaandoeningen bekend in uw familie?",
                "Heeft u familie met hoge bloeddruk of diabetes?",
                "Zijn er familieleden jong overleden aan hartproblemen?"
            ],
            lifestyle: [
                "Hoe zou u uw conditie beschrijven?",
                "Doet u regelmatig aan sport of beweging?",
                "Hoe is uw eetpatroon?",
                "Ervaart u veel stress?"
            ]
        };
        
        this.eventListeners = {};
    }
    
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }
    
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
    
    async connect() {
        if (!this.apiKey) {
            throw new Error('API key is required');
        }
        
        return new Promise((resolve, reject) => {
            try {
                // OpenAI Realtime API WebSocket URL with API key in query parameter
                const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
                
                this.ws = new WebSocket(wsUrl, [], {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'OpenAI-Beta': 'realtime=v1'
                    }
                });
                
                this.ws.onopen = () => {
                    console.log('Connected to OpenAI Realtime API');
                    this.isConnected = true;
                    this.emit('connected');
                    
                    // Send session configuration
                    this.sendSessionUpdate();
                    resolve();
                };
                
                this.ws.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data));
                };
                
                this.ws.onclose = () => {
                    console.log('Disconnected from OpenAI Realtime API');
                    this.isConnected = false;
                    this.emit('disconnected');
                };
                
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.emit('error', error);
                    reject(error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    sendSessionUpdate() {
        const sessionConfig = {
            type: 'session.update',
            session: {
                modalities: ['text', 'audio'],
                instructions: this.getSystemInstructions(),
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
                tools: [],
                tool_choice: 'auto',
                temperature: 0.7,
                max_response_output_tokens: 4096
            }
        };
        
        this.send(sessionConfig);
    }
    
    getSystemInstructions() {
        const askedQuestionsArray = Array.from(this.askedQuestions);
        
        return `Je bent een ervaren Nederlandse cardioloog die een systematische anamnese afneemt. 

BELANGRIJKE REGELS:
1. Stel NOOIT dezelfde vraag twee keer
2. Houd bij welke vragen je al hebt gesteld
3. Stel één vraag per keer
4. Wees empathisch en professioneel
5. Spreek Nederlands

REEDS GESTELDE VRAGEN (NIET HERHALEN):
${askedQuestionsArray.join(', ')}

HUIDIGE FASE: ${this.currentPhase}

VERZAMELDE INFORMATIE:
- Symptomen: ${this.patientData.symptoms.join(', ')}
- Medicijnen: ${this.patientData.medications.join(', ')}
- Duur klachten: ${this.patientData.duration || 'onbekend'}

VOLGENDE VRAGEN OM TE STELLEN (kies er één die je nog NIET hebt gesteld):
${this.getNextQuestions().join('\n')}

Analyseer het antwoord van de patiënt, extraheer relevante medische informatie, en stel dan de meest logische vervolgvraag die je nog NIET hebt gesteld.`;
    }
    
    getNextQuestions() {
        const currentPhaseQuestions = this.questionPhases[this.currentPhase] || [];
        return currentPhaseQuestions.filter(q => !this.askedQuestions.has(q));
    }
    
    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
    
    handleMessage(message) {
        console.log('Received message:', message.type, message);
        
        switch (message.type) {
            case 'session.created':
                this.emit('session_created', message);
                break;
                
            case 'conversation.item.created':
                this.handleConversationItem(message);
                break;
                
            case 'response.text.delta':
                this.emit('text_delta', message);
                break;
                
            case 'response.text.done':
                this.handleTextDone(message);
                break;
                
            case 'response.audio.delta':
                this.handleAudioDelta(message);
                break;
                
            case 'response.audio.done':
                this.emit('audio_done', message);
                break;
                
            case 'response.done':
                this.emit('response_done', message);
                break;
                
            case 'input_audio_buffer.speech_started':
                this.emit('speech_started', message);
                break;
                
            case 'input_audio_buffer.speech_stopped':
                this.emit('speech_stopped', message);
                break;
                
            case 'error':
                this.emit('error', message);
                break;
        }
    }
    
    handleConversationItem(message) {
        if (message.item.type === 'message' && message.item.role === 'assistant') {
            const content = message.item.content?.[0]?.text || '';
            this.conversationHistory.push({
                role: 'assistant',
                content: content,
                timestamp: new Date()
            });
        }
    }
    
    handleTextDone(message) {
        const text = message.text;
        if (text) {
            // Track the question that was asked
            this.askedQuestions.add(text);
            
            // Extract medical information from the conversation
            this.extractMedicalInfo(text);
            
            // Update conversation phase
            this.updateConversationPhase();
            
            this.emit('text_done', { text });
        }
    }
    
    handleAudioDelta(message) {
        if (message.delta) {
            // Decode base64 audio and play it
            this.playAudioDelta(message.delta);
        }
    }
    
    async playAudioDelta(base64Audio) {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const audioData = atob(base64Audio);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);
            
            for (let i = 0; i < audioData.length; i++) {
                view[i] = audioData.charCodeAt(i);
            }
            
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();
            
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }
    
    extractMedicalInfo(text) {
        const lowerText = text.toLowerCase();
        
        // Extract symptoms
        if (lowerText.includes('pijn') || lowerText.includes('klacht')) {
            if (!this.patientData.symptoms.includes(text)) {
                this.patientData.symptoms.push(text);
            }
        }
        
        // Extract duration
        if (lowerText.includes('maand') || lowerText.includes('week') || lowerText.includes('jaar')) {
            this.patientData.duration = text;
        }
        
        // Extract medications
        if (lowerText.includes('medicijn') || lowerText.includes('tablet')) {
            if (!this.patientData.medications.includes(text)) {
                this.patientData.medications.push(text);
            }
        }
    }
    
    updateConversationPhase() {
        const totalQuestions = this.askedQuestions.size;
        
        if (totalQuestions < 3) {
            this.currentPhase = 'symptoms';
        } else if (totalQuestions < 6) {
            this.currentPhase = 'triggers';
        } else if (totalQuestions < 9) {
            this.currentPhase = 'medical_history';
        } else if (totalQuestions < 12) {
            this.currentPhase = 'family_history';
        } else {
            this.currentPhase = 'lifestyle';
        }
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: 24000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
            
            this.isRecording = true;
            this.emit('recording_started');
            
            // Send audio to OpenAI Realtime API
            this.sendAudioStream(stream);
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.emit('error', error);
        }
    }
    
    sendAudioStream(stream) {
        const audioContext = new AudioContext({ sampleRate: 24000 });
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (event) => {
            if (this.isRecording) {
                const inputData = event.inputBuffer.getChannelData(0);
                const pcm16 = this.convertToPCM16(inputData);
                const base64Audio = btoa(String.fromCharCode(...pcm16));
                
                this.send({
                    type: 'input_audio_buffer.append',
                    audio: base64Audio
                });
            }
        };
        
        source.connect(processor);
        processor.connect(audioContext.destination);
    }
    
    convertToPCM16(float32Array) {
        const pcm16 = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            pcm16[i] = Math.max(-32768, Math.min(32767, float32Array[i] * 32768));
        }
        return new Uint8Array(pcm16.buffer);
    }
    
    stopRecording() {
        this.isRecording = false;
        this.emit('recording_stopped');
        
        // Commit the audio buffer and request response
        this.send({
            type: 'input_audio_buffer.commit'
        });
        
        this.send({
            type: 'response.create',
            response: {
                modalities: ['text', 'audio'],
                instructions: this.getSystemInstructions()
            }
        });
    }
    
    sendTextMessage(text) {
        // Add user message to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: text,
            timestamp: new Date()
        });
        
        // Send conversation item
        this.send({
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [{
                    type: 'input_text',
                    text: text
                }]
            }
        });
        
        // Request response
        this.send({
            type: 'response.create',
            response: {
                modalities: ['text', 'audio'],
                instructions: this.getSystemInstructions()
            }
        });
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.isConnected = false;
    }
    
    getConversationSummary() {
        return {
            totalQuestions: this.askedQuestions.size,
            currentPhase: this.currentPhase,
            patientData: this.patientData,
            conversationHistory: this.conversationHistory
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.OpenAIRealtimeClient = OpenAIRealtimeClient;
}

