// Whisper-based Voice Handler for AI Medical Assistant

class WhisperVoiceHandler {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.synthesis = window.speechSynthesis;
        this.selectedVoice = null;
        this.settings = {
            language: 'nl',
            rate: 0.8,
            pitch: 1.0,
            volume: 1.0
        };
        
        this.setupVoiceSettings();
        this.checkSupport();
    }

    checkSupport() {
        const hasMediaRecorder = 'MediaRecorder' in window;
        const hasSynthesis = 'speechSynthesis' in window;
        const hasUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
        
        this.isSupported = {
            recording: hasMediaRecorder && hasUserMedia,
            synthesis: hasSynthesis,
            full: hasMediaRecorder && hasUserMedia && hasSynthesis
        };

        if (!this.isSupported.recording) {
            console.warn('Audio recording not supported in this browser');
        }

        return this.isSupported;
    }

    setupVoiceSettings() {
        // Wait for voices to load
        if (this.synthesis.getVoices().length === 0) {
            this.synthesis.addEventListener('voiceschanged', () => {
                this.selectOptimalVoice();
            });
        } else {
            this.selectOptimalVoice();
        }
    }

    selectOptimalVoice() {
        const voices = this.synthesis.getVoices();
        
        // Prefer Dutch voices
        const dutchVoices = voices.filter(voice => 
            voice.lang.startsWith('nl') || 
            voice.name.toLowerCase().includes('dutch') ||
            voice.name.toLowerCase().includes('nederlands')
        );

        // Prefer female voices for medical applications
        const femaleVoices = dutchVoices.filter(voice => 
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('vrouw') ||
            voice.name.toLowerCase().includes('woman')
        );

        if (femaleVoices.length > 0) {
            this.selectedVoice = femaleVoices[0];
        } else if (dutchVoices.length > 0) {
            this.selectedVoice = dutchVoices[0];
        } else {
            this.selectedVoice = voices[0];
        }

        console.log('Selected voice:', this.selectedVoice?.name || 'Default');
    }

    async startRecording() {
        if (!this.isSupported.recording) {
            throw new Error('Audio opname wordt niet ondersteund in deze browser');
        }

        if (this.isRecording) {
            this.stopRecording();
            return;
        }

        try {
            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            // Create MediaRecorder
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: this.getSupportedMimeType()
            });

            this.audioChunks = [];
            this.isRecording = true;

            // Set up event listeners
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                this.isRecording = false;
                this.updateVoiceUI('processing');
                
                try {
                    const audioBlob = new Blob(this.audioChunks, { 
                        type: this.getSupportedMimeType() 
                    });
                    
                    // Process with Whisper
                    await this.processAudioWithWhisper(audioBlob);
                    
                } catch (error) {
                    console.error('Error processing audio:', error);
                    this.showVoiceFeedback('Fout bij verwerken van audio. Probeer het opnieuw.');
                    this.updateVoiceUI('idle');
                }

                // Clean up
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                this.showVoiceFeedback('Opname fout. Probeer het opnieuw.');
                this.updateVoiceUI('idle');
                this.isRecording = false;
            };

            // Start recording
            this.mediaRecorder.start();
            this.updateVoiceUI('recording');
            this.showVoiceFeedback('Opname gestart... spreek nu');

        } catch (error) {
            console.error('Error starting recording:', error);
            this.handleRecordingError(error);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.showVoiceFeedback('Opname gestopt, verwerken...');
        }
    }

    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/mpeg'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'audio/webm'; // fallback
    }

    async processAudioWithWhisper(audioBlob) {
        try {
            // Call Whisper API directly with audioBlob
            const transcript = await this.callWhisperAPI(audioBlob);
            
            if (transcript && transcript.trim().length > 0) {
                this.showVoiceFeedback(`Gehoord: "${transcript}"`);
                
                // Send to conversation engine
                if (window.app && window.app.processVoiceInput) {
                    await window.app.processVoiceInput(transcript);
                } else {
                    console.error('App not available for voice input processing');
                    this.showVoiceFeedback('Fout: Kan gesprek niet verwerken.');
                }
            } else {
                this.showVoiceFeedback('Geen spraak gedetecteerd. Probeer het opnieuw.');
            }
            
            this.updateVoiceUI('idle');
            
        } catch (error) {
            console.error('Whisper processing error:', error);
            this.showVoiceFeedback(error.message || 'Fout bij spraakherkenning. Probeer het opnieuw.');
            this.updateVoiceUI('idle');
        }
    }

    async callWhisperAPI(audioBlob) {
        try {
            // Create FormData for multipart upload
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('language', 'nl');
            formData.append('prompt', 'Dit is een medisch gesprek in het Nederlands.');

            // Call the backend Whisper API
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.transcript || data.transcript.trim().length === 0) {
                throw new Error('Geen spraak gedetecteerd');
            }

            console.log('Whisper API response:', data);
            return data.transcript;
            
        } catch (error) {
            console.error('Whisper API error:', error);
            
            // Provide user-friendly error messages
            if (error.message.includes('API key')) {
                throw new Error('Spraakherkenning service niet geconfigureerd');
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                throw new Error('Netwerkfout - controleer uw internetverbinding');
            } else if (error.message.includes('Geen spraak')) {
                throw new Error('Geen spraak gedetecteerd - probeer opnieuw');
            } else {
                throw new Error('Spraakherkenning tijdelijk niet beschikbaar');
            }
        }
    }

    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async speak(text, options = {}) {
        if (!this.isSupported.synthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Stop any current speech
        this.synthesis.cancel();

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply settings
        utterance.voice = this.selectedVoice;
        utterance.rate = options.rate || this.settings.rate;
        utterance.pitch = options.pitch || this.settings.pitch;
        utterance.volume = options.volume || this.settings.volume;
        utterance.lang = 'nl-NL';

        // Set up event listeners
        utterance.onstart = () => {
            this.updateVoiceUI('speaking');
        };

        utterance.onend = () => {
            this.updateVoiceUI('idle');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.updateVoiceUI('idle');
        };

        // Speak
        return new Promise((resolve, reject) => {
            utterance.onend = () => {
                this.updateVoiceUI('idle');
                resolve();
            };
            
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                this.updateVoiceUI('idle');
                reject(event.error);
            };

            this.synthesis.speak(utterance);
        });
    }

    stopSpeaking() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
            this.updateVoiceUI('idle');
        }
    }

    updateVoiceUI(state) {
        const voiceAnimation = document.getElementById('voiceAnimation');
        const recordBtn = document.getElementById('recordBtn');
        const voiceFeedback = document.getElementById('voiceFeedback');

        if (!recordBtn) return;

        // Remove all state classes
        if (voiceAnimation) {
            voiceAnimation.classList.remove('listening', 'speaking', 'inactive', 'recording', 'processing');
        }
        recordBtn.classList.remove('recording', 'speaking', 'processing');

        const recordText = recordBtn.querySelector('.record-text');
        if (!recordText) return;

        switch (state) {
            case 'recording':
                if (voiceAnimation) voiceAnimation.classList.add('recording');
                recordBtn.classList.add('recording');
                recordText.textContent = 'Opname... (klik om te stoppen)';
                break;
                
            case 'processing':
                if (voiceAnimation) voiceAnimation.classList.add('processing');
                recordBtn.classList.add('processing');
                recordText.textContent = 'Verwerken...';
                break;
                
            case 'speaking':
                if (voiceAnimation) voiceAnimation.classList.add('speaking');
                recordBtn.classList.add('speaking');
                recordText.textContent = 'AI spreekt...';
                break;
                
            case 'idle':
            default:
                if (voiceAnimation) voiceAnimation.classList.add('inactive');
                recordText.textContent = 'Druk om te spreken';
                break;
        }
    }

    showVoiceFeedback(message) {
        const voiceFeedback = document.getElementById('voiceFeedback');
        if (voiceFeedback) {
            voiceFeedback.textContent = message;
            
            // Auto-clear after 4 seconds for longer messages
            setTimeout(() => {
                if (voiceFeedback.textContent === message) {
                    voiceFeedback.textContent = 'Druk op de microfoon en begin te spreken...';
                }
            }, 4000);
        }
    }

    handleRecordingError(error) {
        let message = 'Opname fout opgetreden.';
        
        if (error.name === 'NotAllowedError') {
            message = 'Microfoon toegang geweigerd. Geef toestemming in uw browser.';
        } else if (error.name === 'NotFoundError') {
            message = 'Geen microfoon gevonden. Controleer uw apparaat.';
        } else if (error.name === 'NotSupportedError') {
            message = 'Audio opname niet ondersteund in deze browser.';
        }
        
        this.showVoiceFeedback(message);
        this.updateVoiceUI('idle');
        this.isRecording = false;
    }

    // Settings management
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }

    getSettings() {
        return { ...this.settings };
    }

    // Diagnostic methods
    runVoiceDiagnostics() {
        const diagnostics = {
            mediaRecorder: 'MediaRecorder' in window,
            speechSynthesis: this.isSupported.synthesis,
            userMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            voices: this.synthesis.getVoices().length,
            selectedVoice: this.selectedVoice?.name || 'None',
            isRecording: this.isRecording
        };

        console.log('Whisper Voice Handler Diagnostics:', diagnostics);
        return diagnostics;
    }

    // Public API compatibility with old VoiceHandler
    get isListening() {
        return this.isRecording;
    }

    async startListening() {
        return this.startRecording();
    }

    stopListening() {
        return this.stopRecording();
    }
}

// Export for use in other modules
window.WhisperVoiceHandler = WhisperVoiceHandler;

