// Advanced Voice Handler for AI Medical Assistant

class VoiceHandler {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSupported = this.checkSupport();
        this.settings = {
            language: 'nl-NL',
            rate: 0.8,
            pitch: 1.0,
            volume: 1.0
        };
        this.initializeVoiceRecognition();
        this.setupVoiceSettings();
    }

    checkSupport() {
        const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        const hasSynthesis = 'speechSynthesis' in window;
        
        return {
            recognition: hasRecognition,
            synthesis: hasSynthesis,
            full: hasRecognition && hasSynthesis
        };
    }

    initializeVoiceRecognition() {
        if (!this.isSupported.recognition) {
            console.warn('Speech recognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.settings.language;
        this.recognition.maxAlternatives = 3;

        // Set up event listeners
        this.setupRecognitionEvents();
    }

    setupRecognitionEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceUI('listening');
            this.showVoiceFeedback('Luister... spreek nu');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Show interim results
            if (interimTranscript) {
                this.showVoiceFeedback(`Ik hoor: "${interimTranscript}"`);
            }

            // Process final result
            if (finalTranscript) {
                this.processFinalTranscript(finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.log('Speech recognition event:', event.error);
            
            // Don't show error for normal user actions
            const normalEvents = ['aborted', 'no-speech'];
            if (!normalEvents.includes(event.error)) {
                this.handleRecognitionError(event.error);
            } else {
                // Just update UI for normal events
                this.updateVoiceUI('idle');
                if (event.error === 'no-speech') {
                    this.showVoiceFeedback('Geen spraak gedetecteerd. Probeer het opnieuw.');
                }
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceUI('idle');
        };

        this.recognition.onnomatch = () => {
            this.showVoiceFeedback('Ik kon u niet goed verstaan. Probeer het opnieuw.');
        };

        this.recognition.onspeechstart = () => {
            this.showVoiceFeedback('Spraak gedetecteerd...');
        };

        this.recognition.onspeechend = () => {
            this.showVoiceFeedback('Verwerken...');
        };
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

        // Prefer female voices for medical applications (often perceived as more empathetic)
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
            // Fallback to default voice
            this.selectedVoice = voices[0];
        }

        console.log('Selected voice:', this.selectedVoice?.name || 'Default');
    }

    async startListening() {
        if (!this.isSupported.recognition) {
            throw new Error('Spraakherkenning wordt niet ondersteund in deze browser');
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        try {
            // Request microphone permission
            await this.requestMicrophonePermission();
            
            // Start recognition
            this.recognition.start();
            
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.handleRecognitionError(error.message);
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
                this.isListening = false;
                this.updateVoiceUI('idle');
                this.showVoiceFeedback('Spraakherkenning gestopt.');
            } catch (error) {
                console.log('Stop listening error (normal):', error);
                this.isListening = false;
                this.updateVoiceUI('idle');
            }
        }
    }

    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop the stream immediately - we just needed permission
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            throw new Error('Microfoon toegang geweigerd. Geef toestemming om spraakherkenning te gebruiken.');
        }
    }

    processFinalTranscript(transcript) {
        const cleanTranscript = transcript.trim();
        
        if (cleanTranscript.length === 0) {
            this.showVoiceFeedback('Geen spraak gedetecteerd. Probeer het opnieuw.');
            return;
        }

        // Show what was heard
        this.showVoiceFeedback(`Gehoord: "${cleanTranscript}"`);
        
        // Send to conversation engine
        if (window.app && window.app.processVoiceInput) {
            window.app.processVoiceInput(cleanTranscript);
        }
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
        utterance.lang = this.settings.language;

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

        if (!voiceAnimation || !recordBtn) return;

        // Remove all state classes
        voiceAnimation.classList.remove('listening', 'speaking', 'inactive');
        recordBtn.classList.remove('recording', 'speaking');

        switch (state) {
            case 'listening':
                voiceAnimation.classList.add('listening');
                recordBtn.classList.add('recording');
                recordBtn.querySelector('.record-text').textContent = 'Luister...';
                break;
                
            case 'speaking':
                voiceAnimation.classList.add('speaking');
                recordBtn.classList.add('speaking');
                recordBtn.querySelector('.record-text').textContent = 'AI spreekt...';
                break;
                
            case 'idle':
            default:
                voiceAnimation.classList.add('inactive');
                recordBtn.querySelector('.record-text').textContent = 'Druk om te spreken';
                break;
        }
    }

    showVoiceFeedback(message) {
        const voiceFeedback = document.getElementById('voiceFeedback');
        if (voiceFeedback) {
            voiceFeedback.textContent = message;
            
            // Auto-clear after 3 seconds
            setTimeout(() => {
                if (voiceFeedback.textContent === message) {
                    voiceFeedback.textContent = 'Druk op de microfoon en begin te spreken...';
                }
            }, 3000);
        }
    }

    handleRecognitionError(error) {
        let message = '';
        
        switch (error) {
            case 'no-speech':
                message = 'Geen spraak gedetecteerd. Probeer het opnieuw.';
                break;
            case 'audio-capture':
                message = 'Microfoon niet beschikbaar. Controleer uw instellingen.';
                break;
            case 'not-allowed':
                message = 'Microfoon toegang geweigerd. Geef toestemming in uw browser.';
                break;
            case 'network':
                message = 'Netwerkfout. Controleer uw internetverbinding.';
                break;
            case 'service-not-allowed':
                message = 'Spraakherkenning service niet beschikbaar.';
                break;
            case 'aborted':
                // Don't show error for user-initiated stops
                message = 'Spraakherkenning gestopt.';
                break;
            default:
                message = 'Spraakherkenning tijdelijk niet beschikbaar. Probeer het opnieuw.';
                break;
        }
        
        this.showVoiceFeedback(message);
        this.updateVoiceUI('idle');
    }

    // Settings management
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        if (this.recognition) {
            this.recognition.lang = this.settings.language;
        }
    }

    getSettings() {
        return { ...this.settings };
    }

    // Voice quality assessment
    assessVoiceQuality(transcript) {
        const quality = {
            confidence: 1.0,
            clarity: 1.0,
            completeness: 1.0
        };

        // Assess based on transcript length and content
        if (transcript.length < 5) {
            quality.completeness = 0.3;
        } else if (transcript.length < 15) {
            quality.completeness = 0.7;
        }

        // Check for unclear speech indicators
        const unclearIndicators = ['eh', 'uhm', 'hmm', '...'];
        const unclearCount = unclearIndicators.reduce((count, indicator) => 
            count + (transcript.toLowerCase().includes(indicator) ? 1 : 0), 0
        );
        
        quality.clarity = Math.max(0.3, 1.0 - (unclearCount * 0.2));

        // Overall confidence
        quality.confidence = (quality.clarity + quality.completeness) / 2;

        return quality;
    }

    // Advanced features
    enableContinuousListening() {
        if (this.recognition) {
            this.recognition.continuous = true;
        }
    }

    disableContinuousListening() {
        if (this.recognition) {
            this.recognition.continuous = false;
        }
    }

    setLanguage(language) {
        this.settings.language = language;
        if (this.recognition) {
            this.recognition.lang = language;
        }
        this.selectOptimalVoice();
    }

    // Accessibility features
    enableHighContrastMode() {
        document.body.classList.add('high-contrast');
    }

    disableHighContrastMode() {
        document.body.classList.remove('high-contrast');
    }

    increaseFontSize() {
        document.body.classList.add('font-large');
    }

    decreaseFontSize() {
        document.body.classList.remove('font-large', 'font-extra-large');
    }

    // Diagnostic methods
    runVoiceDiagnostics() {
        const diagnostics = {
            speechRecognition: this.isSupported.recognition,
            speechSynthesis: this.isSupported.synthesis,
            microphone: false,
            voices: this.synthesis.getVoices().length,
            selectedVoice: this.selectedVoice?.name || 'None'
        };

        // Test microphone access
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
                diagnostics.microphone = true;
            })
            .catch(() => {
                diagnostics.microphone = false;
            });

        return diagnostics;
    }
}

// Export for use in other modules
window.VoiceHandler = VoiceHandler;

