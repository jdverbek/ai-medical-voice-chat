// Enhanced Intelligent Conversation Engine for AI Medical Assistant
// Prevents question repetition and provides specialized cardiology focus

class EnhancedConversationEngine {
    constructor() {
        this.medicalKnowledge = new EnhancedMedicalKnowledge();
        this.conversationState = new EnhancedConversationState();
        this.questionGenerator = new EnhancedQuestionGenerator(this.medicalKnowledge, this.conversationState);
        this.responseAnalyzer = new EnhancedResponseAnalyzer(this.medicalKnowledge);
        // Remove EmotionalIntelligence reference as it's not defined
        this.contextManager = new EnhancedContextManager();
        this.questionTracker = new QuestionTracker();
    }

    async processUserResponse(userInput) {
        try {
            console.log('EnhancedConversationEngine: Processing user input:', userInput);
            
            // Validate input
            if (!userInput || userInput.trim().length === 0) {
                return {
                    response: "Ik heb uw antwoord niet goed verstaan. Kunt u het opnieuw proberen?",
                    analysis: { confidence: 0.1, urgency: 'none' },
                    urgency: 'none',
                    confidence: 0.1
                };
            }

            // Analyze the user's response with enhanced error handling
            let analysis;
            try {
                analysis = this.responseAnalyzer.analyzeResponse(userInput);
                console.log('EnhancedConversationEngine: Analysis result:', analysis);
            } catch (analysisError) {
                console.warn('EnhancedConversationEngine: Analysis failed, using fallback:', analysisError);
                analysis = {
                    symptoms: [],
                    confidence: 0.7,
                    urgency: 'routine',
                    emotion: null,
                    severity: 'unknown',
                    timing: 'unknown',
                    location: 'unknown',
                    cardiacRiskFactors: [],
                    medicalHistory: []
                };
            }
            
            // Update conversation state with enhanced tracking
            this.conversationState.addResponse(userInput, analysis);
            this.contextManager.updateContext(analysis, userInput);
            
            // Generate empathetic response if needed
            let empatheticResponse = null;
            try {
                // Generate simple empathetic response without EmotionalIntelligence class
                empatheticResponse = this.generateSimpleEmpathy(analysis.emotion);
            } catch (empathyError) {
                console.warn('EnhancedConversationEngine: Empathy generation failed:', empathyError);
            }
            
            // Check for urgent indicators
            if (analysis.urgency === 'immediate') {
                console.log('EnhancedConversationEngine: Urgent situation detected');
                return this.handleUrgentSituation(analysis);
            }
            
            // Generate next question intelligently with enhanced anti-repetition
            let nextQuestion;
            try {
                nextQuestion = await this.questionGenerator.generateNextQuestion(analysis);
                console.log('EnhancedConversationEngine: Generated question:', nextQuestion);
                
                // Track the question to prevent repetition
                this.questionTracker.addAskedQuestion(nextQuestion, analysis);
                
            } catch (questionError) {
                console.warn('EnhancedConversationEngine: Question generation failed, using fallback:', questionError);
                nextQuestion = this.generateFallbackQuestion(userInput, analysis);
            }
            
            // Combine empathy with question if needed
            const fullResponse = this.combineResponses(empatheticResponse, nextQuestion);
            console.log('EnhancedConversationEngine: Final response:', fullResponse);
            
            return {
                response: fullResponse,
                analysis: analysis,
                urgency: analysis.urgency,
                confidence: analysis.confidence,
                requiresImmediateAttention: analysis.urgency === 'immediate',
                questionCategory: this.questionTracker.getLastQuestionCategory(),
                conversationProgress: this.conversationState.getProgress()
            };
            
        } catch (error) {
            console.error('EnhancedConversationEngine: Critical error processing response:', error);
            return {
                response: this.generateFallbackQuestion(userInput, null),
                analysis: { confidence: 0.5, urgency: 'none' },
                urgency: 'none',
                confidence: 0.5
            };
        }
    }

    generateFallbackQuestion(userInput, analysis) {
        // Enhanced fallback with cardiology focus
        const input = userInput.toLowerCase();
        
        // Cardiology-specific fallbacks
        if (input.includes('hart') || input.includes('borst')) {
            const cardiacFallbacks = [
                "Kunt u mij meer vertellen over uw hartklachten?",
                "Heeft u pijn op de borst? Kunt u beschrijven hoe die aanvoelt?",
                "Bent u kortademig, vooral bij inspanning?",
                "Heeft u wel eens hartkloppingen of een onregelmatige hartslag?"
            ];
            return this.questionTracker.getUnaskedQuestion(cardiacFallbacks) || cardiacFallbacks[0];
        }
        
        // Pain-related fallbacks
        if (input.includes('pijn') || input.includes('zeer')) {
            const painFallbacks = [
                "Kunt u de pijn beschrijven? Is het drukkend, stekend, of brandend?",
                "Op een schaal van 1 tot 10, hoe erg is de pijn?",
                "Straalt de pijn uit naar andere delen van uw lichaam?",
                "Wat maakt de pijn erger of beter?"
            ];
            return this.questionTracker.getUnaskedQuestion(painFallbacks) || painFallbacks[0];
        }
        
        // Generic but intelligent fallbacks
        const genericFallbacks = [
            "Dank u voor uw antwoord. Kunt u mij meer details geven?",
            "Dat is nuttige informatie. Wanneer begonnen deze klachten?",
            "Heeft u nog andere symptomen die u zorgen baren?",
            "Kunt u beschrijven hoe deze klachten uw dagelijks leven beïnvloeden?"
        ];
        
        return this.questionTracker.getUnaskedQuestion(genericFallbacks) || genericFallbacks[0];
    }

    combineResponses(empathy, question) {
        if (empathy && question) {
            return `${empathy} ${question}`;
        }
        return empathy || question || "Kunt u mij daar meer over vertellen?";
    }

    handleUrgentSituation(analysis) {
        const urgencyMessage = this.medicalKnowledge.getUrgencyMessage('immediate');
        const urgentFollowUp = this.questionGenerator.generateUrgentFollowUp(analysis);
        
        return {
            response: `${urgencyMessage} Ondertussen wil ik graag nog wat meer informatie verzamelen. ${urgentFollowUp}`,
            analysis: analysis,
            urgency: 'immediate',
            confidence: analysis.confidence,
            requiresImmediateAttention: true
        };
    }

    startConversation() {
        const openingMessages = this.medicalKnowledge.conversationPatterns.cardiologyOpening;
        const randomOpening = openingMessages[Math.floor(Math.random() * openingMessages.length)];
        
        this.conversationState.setPhase('chief_complaint');
        this.questionTracker.reset();
        
        return {
            response: randomOpening,
            analysis: null,
            urgency: 'routine',
            confidence: 1.0,
            conversationProgress: this.conversationState.getProgress()
        };
    }

    getSummary() {
        return this.conversationState.generateCardiologySummary();
    }

    getDetailedMedicalReport() {
        return this.conversationState.generateDetailedMedicalReport();
    }

    isConversationComplete() {
        return this.conversationState.isCardiologyAnamnesisComplete();
    }
}

class QuestionTracker {
    constructor() {
        this.askedQuestions = new Set();
        this.questionsByCategory = new Map();
        this.questionHistory = [];
        this.lastQuestionCategory = null;
    }

    addAskedQuestion(question, analysis) {
        const normalizedQuestion = this.normalizeQuestion(question);
        this.askedQuestions.add(normalizedQuestion);
        
        // Categorize the question
        const category = this.categorizeQuestion(question, analysis);
        this.lastQuestionCategory = category;
        
        if (!this.questionsByCategory.has(category)) {
            this.questionsByCategory.set(category, new Set());
        }
        this.questionsByCategory.get(category).add(normalizedQuestion);
        
        // Add to history with timestamp
        this.questionHistory.push({
            question: question,
            category: category,
            timestamp: new Date(),
            analysis: analysis
        });
    }

    normalizeQuestion(question) {
        // Normalize question for comparison (remove punctuation, lowercase, etc.)
        return question.toLowerCase()
            .replace(/[?.,!]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    categorizeQuestion(question, analysis) {
        const lowerQuestion = question.toLowerCase();
        
        // Cardiology-specific categories
        if (lowerQuestion.includes('hart') || lowerQuestion.includes('borst') || lowerQuestion.includes('pijn op de borst')) {
            return 'cardiac_symptoms';
        }
        if (lowerQuestion.includes('kortademig') || lowerQuestion.includes('benauwd')) {
            return 'respiratory_symptoms';
        }
        if (lowerQuestion.includes('medicijn') || lowerQuestion.includes('medicatie')) {
            return 'medications';
        }
        if (lowerQuestion.includes('familie') || lowerQuestion.includes('erfelijk')) {
            return 'family_history';
        }
        if (lowerQuestion.includes('rook') || lowerQuestion.includes('alcohol') || lowerQuestion.includes('sport')) {
            return 'lifestyle';
        }
        if (lowerQuestion.includes('operatie') || lowerQuestion.includes('ziekenhuis')) {
            return 'medical_history';
        }
        if (lowerQuestion.includes('wanneer') || lowerQuestion.includes('hoe lang')) {
            return 'timing';
        }
        if (lowerQuestion.includes('pijn') || lowerQuestion.includes('zeer')) {
            return 'pain_assessment';
        }
        
        return 'general';
    }

    hasAskedQuestion(question) {
        const normalized = this.normalizeQuestion(question);
        return this.askedQuestions.has(normalized);
    }

    hasAskedInCategory(category) {
        return this.questionsByCategory.has(category) && 
               this.questionsByCategory.get(category).size > 0;
    }

    getUnaskedQuestion(questionList) {
        for (const question of questionList) {
            if (!this.hasAskedQuestion(question)) {
                return question;
            }
        }
        return null;
    }

    getLastQuestionCategory() {
        return this.lastQuestionCategory;
    }

    getCategoryProgress() {
        const progress = {};
        for (const [category, questions] of this.questionsByCategory.entries()) {
            progress[category] = questions.size;
        }
        return progress;
    }

    reset() {
        this.askedQuestions.clear();
        this.questionsByCategory.clear();
        this.questionHistory = [];
        this.lastQuestionCategory = null;
    }
}

class EnhancedConversationState {
    constructor() {
        this.patientProfile = {
            name: null,
            age: null,
            gender: null,
            chiefComplaint: null,
            symptoms: new Map(),
            timeline: {},
            riskFactors: [],
            medications: [],
            allergies: [],
            medicalHistory: [],
            familyHistory: [],
            socialHistory: {},
            // Cardiology-specific fields
            cardiacSymptoms: new Map(),
            cardiacRiskFactors: {
                hypertension: null,
                diabetes: null,
                smoking: null,
                familyHistory: null,
                cholesterol: null,
                obesity: null,
                sedentaryLifestyle: null,
                stress: null
            },
            functionalCapacity: null,
            previousCardiacEvents: [],
            currentCardiacMedications: []
        };
        
        this.conversationHistory = [];
        this.currentPhase = 'opening';
        this.exploredTopics = new Set();
        this.urgencyFlags = [];
        this.confidenceScores = [];
        this.emotionalState = {
            anxiety: false,
            pain: false,
            frustration: false,
            sadness: false
        };
        
        // Cardiology-specific tracking
        this.cardiologyPhases = [
            'chief_complaint',
            'cardiac_symptoms',
            'risk_factors',
            'family_history',
            'medications',
            'functional_assessment',
            'lifestyle_factors',
            'review_of_systems'
        ];
        this.completedPhases = new Set();
    }

    addResponse(userInput, analysis) {
        const timestamp = new Date();
        
        // Add to conversation history
        this.conversationHistory.push({
            userInput: userInput,
            analysis: analysis,
            timestamp: timestamp,
            phase: this.currentPhase
        });
        
        // Update patient profile based on analysis
        this.updatePatientProfile(analysis);
        this.updateCardiacProfile(analysis);
        
        // Update emotional state
        if (analysis.emotion) {
            Object.assign(this.emotionalState, analysis.emotion);
        }
        
        // Track confidence
        this.confidenceScores.push(analysis.confidence);
        
        // Check for urgency flags
        if (analysis.urgency === 'immediate' || analysis.urgency === 'urgent') {
            this.urgencyFlags.push({
                flag: analysis.urgency,
                timestamp: timestamp,
                context: userInput
            });
        }
    }

    updateCardiacProfile(analysis) {
        // Extract cardiac-specific information
        if (analysis.cardiacRiskFactors) {
            for (const riskFactor of analysis.cardiacRiskFactors) {
                this.patientProfile.cardiacRiskFactors[riskFactor.type] = riskFactor.value;
            }
        }
        
        // Track cardiac symptoms specifically
        if (analysis.symptoms) {
            for (const symptom of analysis.symptoms) {
                if (this.isCardiacSymptom(symptom.key)) {
                    this.patientProfile.cardiacSymptoms.set(symptom.key, {
                        name: symptom.term,
                        severity: analysis.severity,
                        timing: analysis.timing,
                        location: analysis.location,
                        firstMentioned: new Date(),
                        details: analysis
                    });
                }
            }
        }
    }

    isCardiacSymptom(symptomKey) {
        const cardiacSymptoms = [
            'chest_pain', 'shortness_of_breath', 'palpitations', 
            'syncope', 'fatigue', 'leg_swelling', 'orthopnea'
        ];
        return cardiacSymptoms.includes(symptomKey);
    }

    setPhase(phase) {
        if (this.currentPhase && this.cardiologyPhases.includes(this.currentPhase)) {
            this.completedPhases.add(this.currentPhase);
        }
        this.currentPhase = phase;
    }

    getProgress() {
        const totalPhases = this.cardiologyPhases.length;
        const completedCount = this.completedPhases.size;
        return {
            completed: completedCount,
            total: totalPhases,
            percentage: Math.round((completedCount / totalPhases) * 100),
            currentPhase: this.currentPhase,
            nextPhase: this.getNextPhase()
        };
    }

    getNextPhase() {
        const currentIndex = this.cardiologyPhases.indexOf(this.currentPhase);
        if (currentIndex >= 0 && currentIndex < this.cardiologyPhases.length - 1) {
            return this.cardiologyPhases[currentIndex + 1];
        }
        return null;
    }

    isCardiologyAnamnesisComplete() {
        // Check if all essential cardiology phases are completed
        const essentialPhases = [
            'chief_complaint', 'cardiac_symptoms', 'risk_factors', 
            'family_history', 'medications'
        ];
        
        return essentialPhases.every(phase => this.completedPhases.has(phase));
    }

    generateCardiologySummary() {
        return {
            patientInfo: {
                name: this.patientProfile.name,
                age: this.patientProfile.age,
                gender: this.patientProfile.gender
            },
            chiefComplaint: this.patientProfile.chiefComplaint,
            cardiacSymptoms: Array.from(this.patientProfile.cardiacSymptoms.entries()).map(([key, data]) => ({
                symptom: data.name,
                severity: data.severity,
                timing: data.timing,
                location: data.location
            })),
            riskFactors: this.patientProfile.cardiacRiskFactors,
            medications: this.patientProfile.currentCardiacMedications,
            familyHistory: this.patientProfile.familyHistory,
            functionalCapacity: this.patientProfile.functionalCapacity,
            urgencyFlags: this.urgencyFlags,
            conversationQuality: {
                totalExchanges: this.conversationHistory.length,
                averageConfidence: this.getAverageConfidence(),
                completedPhases: Array.from(this.completedPhases),
                progress: this.getProgress()
            },
            recommendations: this.generateCardiologyRecommendations()
        };
    }

    generateDetailedMedicalReport() {
        const summary = this.generateCardiologySummary();
        
        return {
            reportHeader: {
                title: "Cardiologische Anamnese Rapport",
                date: new Date().toLocaleDateString('nl-NL'),
                time: new Date().toLocaleTimeString('nl-NL'),
                generatedBy: "AI Medische Assistent"
            },
            patientInformation: summary.patientInfo,
            chiefComplaint: {
                description: summary.chiefComplaint,
                duration: this.extractDurationFromHistory(),
                severity: this.extractOverallSeverity()
            },
            presentIllness: {
                cardiacSymptoms: summary.cardiacSymptoms,
                timeline: this.constructTimeline(),
                associatedSymptoms: this.getAssociatedSymptoms()
            },
            riskFactorAssessment: {
                modifiableRiskFactors: this.getModifiableRiskFactors(),
                nonModifiableRiskFactors: this.getNonModifiableRiskFactors(),
                riskScore: this.calculateRiskScore()
            },
            medicationHistory: {
                currentMedications: summary.medications,
                allergies: this.patientProfile.allergies,
                previousAdverseReactions: this.extractAdverseReactions()
            },
            familyHistory: {
                cardiacHistory: this.extractCardiacFamilyHistory(),
                otherRelevantHistory: this.extractOtherFamilyHistory()
            },
            functionalAssessment: {
                exerciseTolerance: this.patientProfile.functionalCapacity,
                dailyActivities: this.extractDailyActivityLimitations(),
                qualityOfLife: this.assessQualityOfLife()
            },
            clinicalImpression: {
                urgencyLevel: this.getHighestUrgencyLevel(),
                recommendations: summary.recommendations,
                followUpNeeded: this.determineFollowUpNeeds()
            },
            conversationMetrics: summary.conversationQuality
        };
    }

    // Helper methods for detailed report generation
    extractDurationFromHistory() {
        // Extract duration information from conversation history
        for (const exchange of this.conversationHistory) {
            if (exchange.analysis.timing && exchange.analysis.timing !== 'unknown') {
                return exchange.analysis.timing;
            }
        }
        return 'Niet gespecificeerd';
    }

    extractOverallSeverity() {
        const severities = this.conversationHistory
            .map(exchange => exchange.analysis.severity)
            .filter(severity => severity && severity !== 'unknown');
        
        if (severities.includes('severe')) return 'Ernstig';
        if (severities.includes('moderate')) return 'Matig';
        if (severities.includes('mild')) return 'Licht';
        return 'Niet gespecificeerd';
    }

    constructTimeline() {
        // Construct a timeline of symptom development
        const timeline = [];
        for (const exchange of this.conversationHistory) {
            if (exchange.analysis.symptoms && exchange.analysis.symptoms.length > 0) {
                timeline.push({
                    timestamp: exchange.timestamp,
                    symptoms: exchange.analysis.symptoms,
                    context: exchange.userInput
                });
            }
        }
        return timeline;
    }

    getModifiableRiskFactors() {
        const modifiable = {};
        const riskFactors = this.patientProfile.cardiacRiskFactors;
        
        ['smoking', 'obesity', 'sedentaryLifestyle', 'stress'].forEach(factor => {
            if (riskFactors[factor] !== null) {
                modifiable[factor] = riskFactors[factor];
            }
        });
        
        return modifiable;
    }

    getNonModifiableRiskFactors() {
        const nonModifiable = {};
        const riskFactors = this.patientProfile.cardiacRiskFactors;
        
        ['familyHistory'].forEach(factor => {
            if (riskFactors[factor] !== null) {
                nonModifiable[factor] = riskFactors[factor];
            }
        });
        
        // Add age and gender if available
        if (this.patientProfile.age) {
            nonModifiable.age = this.patientProfile.age;
        }
        if (this.patientProfile.gender) {
            nonModifiable.gender = this.patientProfile.gender;
        }
        
        return nonModifiable;
    }

    calculateRiskScore() {
        // Simple risk score calculation based on available factors
        let score = 0;
        const riskFactors = this.patientProfile.cardiacRiskFactors;
        
        if (riskFactors.smoking === true) score += 2;
        if (riskFactors.hypertension === true) score += 2;
        if (riskFactors.diabetes === true) score += 2;
        if (riskFactors.familyHistory === true) score += 1;
        if (riskFactors.obesity === true) score += 1;
        
        if (score >= 6) return 'Hoog risico';
        if (score >= 3) return 'Matig risico';
        return 'Laag risico';
    }

    generateCardiologyRecommendations() {
        const recommendations = [];
        
        // Check urgency flags
        if (this.urgencyFlags.some(flag => flag.flag === 'immediate')) {
            recommendations.push({
                type: 'urgent',
                priority: 'immediate',
                message: 'Onmiddellijke cardiologische evaluatie vereist. Bel 112 of ga naar de spoedeisende hulp.'
            });
        } else if (this.urgencyFlags.some(flag => flag.flag === 'urgent')) {
            recommendations.push({
                type: 'urgent',
                priority: 'same_day',
                message: 'Neem vandaag nog contact op met uw cardioloog of huisarts.'
            });
        }
        
        // Check for cardiac symptoms
        if (this.patientProfile.cardiacSymptoms.has('chest_pain')) {
            recommendations.push({
                type: 'diagnostic',
                priority: 'high',
                message: 'ECG en cardiale enzymen worden aanbevolen voor evaluatie van borstpijn.'
            });
        }
        
        if (this.patientProfile.cardiacSymptoms.has('shortness_of_breath')) {
            recommendations.push({
                type: 'diagnostic',
                priority: 'high',
                message: 'Echocardiogram en longfunctietest overwegen voor evaluatie van dyspnoe.'
            });
        }
        
        // Risk factor modifications
        if (this.patientProfile.cardiacRiskFactors.smoking === true) {
            recommendations.push({
                type: 'lifestyle',
                priority: 'high',
                message: 'Stoppen met roken is essentieel voor cardiovasculaire gezondheid.'
            });
        }
        
        if (this.patientProfile.cardiacRiskFactors.sedentaryLifestyle === true) {
            recommendations.push({
                type: 'lifestyle',
                priority: 'medium',
                message: 'Regelmatige fysieke activiteit wordt sterk aanbevolen.'
            });
        }
        
        return recommendations;
    }

    getAverageConfidence() {
        if (this.confidenceScores.length === 0) return 0;
        return this.confidenceScores.reduce((a, b) => a + b, 0) / this.confidenceScores.length;
    }

    getHighestUrgencyLevel() {
        if (this.urgencyFlags.some(flag => flag.flag === 'immediate')) return 'immediate';
        if (this.urgencyFlags.some(flag => flag.flag === 'urgent')) return 'urgent';
        return 'routine';
    }

    determineFollowUpNeeds() {
        const needs = [];
        
        if (!this.isCardiologyAnamnesisComplete()) {
            needs.push('Volledige cardiologische anamnese voltooien');
        }
        
        if (this.patientProfile.cardiacSymptoms.size > 0) {
            needs.push('Cardiologische evaluatie en diagnostiek');
        }
        
        if (Object.values(this.patientProfile.cardiacRiskFactors).some(factor => factor === true)) {
            needs.push('Risicofactor management en leefstijladvies');
        }
        
        return needs;
    }

    // Additional helper methods for report generation
    getAssociatedSymptoms() {
        const associated = [];
        for (const [key, symptom] of this.patientProfile.symptoms.entries()) {
            if (!this.isCardiacSymptom(key)) {
                associated.push(symptom);
            }
        }
        return associated;
    }

    extractAdverseReactions() {
        // Extract adverse drug reactions from conversation history
        const reactions = [];
        for (const exchange of this.conversationHistory) {
            if (exchange.userInput.toLowerCase().includes('allergie') || 
                exchange.userInput.toLowerCase().includes('bijwerking')) {
                reactions.push({
                    description: exchange.userInput,
                    timestamp: exchange.timestamp
                });
            }
        }
        return reactions;
    }

    extractCardiacFamilyHistory() {
        return this.patientProfile.familyHistory.filter(item => 
            item.toLowerCase().includes('hart') || 
            item.toLowerCase().includes('infarct') ||
            item.toLowerCase().includes('beroerte')
        );
    }

    extractOtherFamilyHistory() {
        return this.patientProfile.familyHistory.filter(item => 
            !item.toLowerCase().includes('hart') && 
            !item.toLowerCase().includes('infarct') &&
            !item.toLowerCase().includes('beroerte')
        );
    }

    extractDailyActivityLimitations() {
        // Extract information about daily activity limitations
        const limitations = [];
        for (const exchange of this.conversationHistory) {
            if (exchange.userInput.toLowerCase().includes('trap') ||
                exchange.userInput.toLowerCase().includes('lopen') ||
                exchange.userInput.toLowerCase().includes('inspanning')) {
                limitations.push(exchange.userInput);
            }
        }
        return limitations;
    }

    assessQualityOfLife() {
        // Assess quality of life impact based on conversation
        let impact = 'Minimaal';
        
        for (const exchange of this.conversationHistory) {
            const input = exchange.userInput.toLowerCase();
            if (input.includes('niet kunnen') || input.includes('moeilijk') || input.includes('beperkt')) {
                impact = 'Matig tot ernstig';
                break;
            } else if (input.includes('soms') || input.includes('af en toe')) {
                impact = 'Licht tot matig';
            }
        }
        
        return impact;
    }

    // Simple empathy generation without external dependencies
    generateSimpleEmpathy(emotion) {
        const empathyResponses = {
            'concern': [
                "Ik begrijp dat dit zorgelijk voor u is.",
                "Het is begrijpelijk dat u zich zorgen maakt.",
                "Uw bezorgdheid is heel normaal."
            ],
            'pain': [
                "Het spijt me dat u pijn heeft.",
                "Pijn kan heel belastend zijn.",
                "Ik begrijp dat dit oncomfortabel is."
            ],
            'anxiety': [
                "Ik merk dat dit u ongerust maakt.",
                "Het is normaal om zich zorgen te maken over uw gezondheid.",
                "Uw gevoelens zijn heel begrijpelijk."
            ],
            'frustration': [
                "Ik begrijp dat dit frustrerend kan zijn.",
                "Het is vervelend als symptomen uw dagelijks leven beïnvloeden.",
                "Uw frustratie is heel begrijpelijk."
            ],
            'default': [
                "Dank u voor het delen van deze informatie.",
                "Ik waardeer uw openheid.",
                "Het is belangrijk dat u dit vertelt."
            ]
        };

        const responses = empathyResponses[emotion] || empathyResponses['default'];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Export for use in other modules
window.EnhancedConversationEngine = EnhancedConversationEngine;
window.QuestionTracker = QuestionTracker;
window.EnhancedConversationState = EnhancedConversationState;

