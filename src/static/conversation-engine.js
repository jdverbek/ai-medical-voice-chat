// Intelligent Conversation Engine for AI Medical Assistant

class ConversationEngine {
    constructor() {
        this.medicalKnowledge = new MedicalKnowledge();
        this.conversationState = new ConversationState();
        this.questionGenerator = new QuestionGenerator(this.medicalKnowledge, this.conversationState);
        this.responseAnalyzer = new ResponseAnalyzer(this.medicalKnowledge);
        this.emotionalIntelligence = new EmotionalIntelligence();
        this.contextManager = new ContextManager();
    }

    async processUserResponse(userInput) {
        try {
            console.log('ConversationEngine: Processing user input:', userInput);
            
            // Validate input
            if (!userInput || userInput.trim().length === 0) {
                return {
                    response: "Ik heb uw antwoord niet goed verstaan. Kunt u het opnieuw proberen?",
                    analysis: { confidence: 0.1, urgency: 'none' },
                    urgency: 'none',
                    confidence: 0.1
                };
            }

            // Analyze the user's response
            const analysis = this.responseAnalyzer.analyzeResponse(userInput);
            console.log('ConversationEngine: Analysis result:', analysis);
            
            // Update conversation state
            this.conversationState.addResponse(userInput, analysis);
            
            // Generate empathetic response if needed
            const empatheticResponse = this.emotionalIntelligence.generateResponse(analysis.emotion);
            
            // Check for urgent indicators
            if (analysis.urgency === 'immediate') {
                console.log('ConversationEngine: Urgent situation detected');
                return this.handleUrgentSituation(analysis);
            }
            
            // Generate next question intelligently
            const nextQuestion = await this.questionGenerator.generateNextQuestion(analysis);
            console.log('ConversationEngine: Generated question:', nextQuestion);
            
            // Combine empathy with question if needed
            const fullResponse = this.combineResponses(empatheticResponse, nextQuestion);
            console.log('ConversationEngine: Final response:', fullResponse);
            
            return {
                response: fullResponse,
                analysis: analysis,
                urgency: analysis.urgency,
                confidence: analysis.confidence,
                requiresImmediateAttention: analysis.urgency === 'immediate'
            };
            
        } catch (error) {
            console.error('ConversationEngine: Error processing response:', error);
            return {
                response: "Er is een probleem opgetreden. Laat me een andere vraag stellen. Hoe voelt u zich vandaag?",
                analysis: { confidence: 0.5, urgency: 'none' },
                urgency: 'none',
                confidence: 0.5
            };
        }
    }

    combineResponses(empathy, question) {
        if (empathy && question) {
            return `${empathy} ${question}`;
        }
        return empathy || question || "Kunt u mij daar meer over vertellen?";
    }

    handleUrgentSituation(analysis) {
        const urgencyMessage = this.medicalKnowledge.getUrgencyMessage('immediate');
        return {
            response: `${urgencyMessage} Ondertussen wil ik graag nog wat meer informatie verzamelen. ${this.questionGenerator.generateUrgentFollowUp(analysis)}`,
            analysis: analysis,
            urgency: 'immediate',
            confidence: analysis.confidence,
            requiresImmediateAttention: true
        };
    }

    showThinking() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
    }

    hideThinking() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }

    startConversation() {
        const openingMessages = this.medicalKnowledge.conversationPatterns.opening;
        const randomOpening = openingMessages[Math.floor(Math.random() * openingMessages.length)];
        
        this.conversationState.setPhase('chief_complaint');
        
        return {
            response: randomOpening,
            analysis: null,
            urgency: 'routine',
            confidence: 1.0
        };
    }

    getSummary() {
        return this.conversationState.generateSummary();
    }
}

class ConversationState {
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
            socialHistory: {}
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

    updatePatientProfile(analysis) {
        // Extract and store symptoms
        if (analysis.symptoms && analysis.symptoms.length > 0) {
            for (const symptom of analysis.symptoms) {
                if (!this.patientProfile.symptoms.has(symptom.key)) {
                    this.patientProfile.symptoms.set(symptom.key, {
                        name: symptom.term,
                        severity: analysis.severity,
                        timing: analysis.timing,
                        location: analysis.location,
                        firstMentioned: new Date(),
                        details: []
                    });
                }
                
                // Add details to existing symptom
                this.patientProfile.symptoms.get(symptom.key).details.push({
                    detail: analysis,
                    timestamp: new Date()
                });
            }
        }
        
        // Set chief complaint if not already set
        if (!this.patientProfile.chiefComplaint && analysis.symptoms.length > 0) {
            this.patientProfile.chiefComplaint = analysis.symptoms[0].term;
        }
        
        // Mark topics as explored
        for (const symptom of analysis.symptoms) {
            this.exploredTopics.add(symptom.key);
        }
    }

    setPhase(phase) {
        this.currentPhase = phase;
    }

    getPhase() {
        return this.currentPhase;
    }

    hasExploredTopic(topic) {
        return this.exploredTopics.has(topic);
    }

    getAverageConfidence() {
        if (this.confidenceScores.length === 0) return 0;
        return this.confidenceScores.reduce((a, b) => a + b, 0) / this.confidenceScores.length;
    }

    generateSummary() {
        const summary = {
            patientInfo: {
                name: this.patientProfile.name,
                age: this.patientProfile.age,
                gender: this.patientProfile.gender
            },
            chiefComplaint: this.patientProfile.chiefComplaint,
            symptoms: Array.from(this.patientProfile.symptoms.entries()).map(([key, data]) => ({
                symptom: data.name,
                severity: data.severity,
                timing: data.timing,
                location: data.location,
                details: data.details.length
            })),
            urgencyFlags: this.urgencyFlags,
            conversationQuality: {
                totalExchanges: this.conversationHistory.length,
                averageConfidence: this.getAverageConfidence(),
                exploredTopics: Array.from(this.exploredTopics)
            },
            recommendations: this.generateRecommendations()
        };
        
        return summary;
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Check urgency flags
        if (this.urgencyFlags.some(flag => flag.flag === 'immediate')) {
            recommendations.push({
                type: 'urgent',
                message: 'Onmiddellijke medische aandacht vereist. Bel 112 of ga naar de spoedeisende hulp.'
            });
        } else if (this.urgencyFlags.some(flag => flag.flag === 'urgent')) {
            recommendations.push({
                type: 'urgent',
                message: 'Neem vandaag nog contact op met uw huisarts.'
            });
        }
        
        // Check for incomplete symptom exploration
        const incompleteSymptoms = Array.from(this.patientProfile.symptoms.entries())
            .filter(([key, data]) => data.details.length < 3);
        
        if (incompleteSymptoms.length > 0) {
            recommendations.push({
                type: 'follow_up',
                message: 'Enkele symptomen verdienen meer uitgebreide bespreking met uw arts.'
            });
        }
        
        return recommendations;
    }
}

class QuestionGenerator {
    constructor(medicalKnowledge, conversationState) {
        this.knowledge = medicalKnowledge;
        this.state = conversationState;
        this.questionPriorities = this.initializeQuestionPriorities();
    }

    initializeQuestionPriorities() {
        return {
            'red_flags': 10,
            'chief_complaint_exploration': 9,
            'symptom_clarification': 8,
            'severity_assessment': 7,
            'timeline_establishment': 6,
            'associated_symptoms': 5,
            'medical_history': 4,
            'social_history': 3,
            'family_history': 2,
            'review_of_systems': 1
        };
    }

    async generateNextQuestion(analysis) {
        // Simulate AI thinking delay
        await this.simulateThinking();
        
        // Check for immediate follow-ups based on analysis
        const immediateFollowUp = this.checkImmediateFollowUps(analysis);
        if (immediateFollowUp) {
            return immediateFollowUp;
        }
        
        // Generate follow-up for detected symptoms
        const symptomFollowUp = this.generateSymptomFollowUp(analysis);
        if (symptomFollowUp) {
            return symptomFollowUp;
        }
        
        // Check if we need clarification
        if (analysis.confidence < 0.6) {
            return this.generateClarificationQuestion(analysis);
        }
        
        // Move to next logical topic
        return this.generateNextTopicQuestion();
    }

    async simulateThinking() {
        // Simulate AI processing time (1-3 seconds)
        const thinkingTime = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, thinkingTime));
    }

    checkImmediateFollowUps(analysis) {
        // Check for red flag symptoms that need immediate follow-up
        for (const symptom of analysis.symptoms) {
            const symptomData = this.knowledge.symptoms[symptom.key];
            if (symptomData && symptomData.urgencyLevel === 'high') {
                
                // Check if we've asked about red flags for this symptom
                const unaskedRedFlags = symptomData.redFlags.filter(flag => 
                    !this.hasAskedAbout(flag)
                );
                
                if (unaskedRedFlags.length > 0) {
                    return this.knowledge.getRedFlagQuestion(unaskedRedFlags[0], symptom.key);
                }
            }
        }
        
        return null;
    }

    generateSymptomFollowUp(analysis) {
        for (const symptom of analysis.symptoms) {
            const followUpQuestion = this.knowledge.generateFollowUpQuestion(symptom, this.state.conversationHistory);
            if (followUpQuestion) {
                return followUpQuestion;
            }
        }
        
        return null;
    }

    generateClarificationQuestion(analysis) {
        const clarificationPatterns = this.knowledge.conversationPatterns.clarification;
        const randomClarification = clarificationPatterns[Math.floor(Math.random() * clarificationPatterns.length)];
        
        // Add specific clarification based on what was unclear
        if (analysis.symptoms.length === 0) {
            return `${randomClarification} Kunt u uw klachten wat specifieker beschrijven?`;
        }
        
        if (analysis.severity === 'unknown') {
            return `${randomClarification} Hoe erg zijn uw klachten op een schaal van 1 tot 10?`;
        }
        
        if (analysis.timing === 'unknown') {
            return `${randomClarification} Wanneer begonnen deze klachten?`;
        }
        
        return randomClarification;
    }

    generateNextTopicQuestion() {
        const currentPhase = this.state.getPhase();
        
        switch (currentPhase) {
            case 'chief_complaint':
                if (!this.state.patientProfile.chiefComplaint) {
                    return "Kunt u mij in uw eigen woorden vertellen wat uw hoofdklacht is?";
                }
                this.state.setPhase('symptom_exploration');
                return this.generateSymptomExplorationQuestion();
                
            case 'symptom_exploration':
                return this.generateSymptomExplorationQuestion();
                
            case 'medical_history':
                return this.generateMedicalHistoryQuestion();
                
            case 'social_history':
                return this.generateSocialHistoryQuestion();
                
            default:
                return this.generateGenericFollowUp();
        }
    }

    generateSymptomExplorationQuestion() {
        const symptoms = Array.from(this.state.patientProfile.symptoms.keys());
        
        if (symptoms.length === 0) {
            return "Heeft u nog andere klachten die u zorgen baren?";
        }
        
        // Find the least explored symptom
        const leastExplored = this.findLeastExploredSymptom(symptoms);
        if (leastExplored) {
            const symptomData = this.knowledge.symptoms[leastExplored];
            const unexploredQuestions = symptomData.followUpQuestions.filter(q => 
                !this.hasAskedSimilarQuestion(q)
            );
            
            if (unexploredQuestions.length > 0) {
                return unexploredQuestions[0];
            }
        }
        
        // Move to next phase if symptom exploration is complete
        this.state.setPhase('medical_history');
        return "Laten we het nu hebben over uw medische voorgeschiedenis. Heeft u eerder ziektes gehad?";
    }

    generateMedicalHistoryQuestion() {
        const historyQuestions = [
            "Bent u ooit geopereerd?",
            "Heeft u allergieën voor medicijnen of andere stoffen?",
            "Gebruikt u momenteel medicijnen?",
            "Heeft u chronische aandoeningen zoals diabetes of hoge bloeddruk?"
        ];
        
        for (const question of historyQuestions) {
            if (!this.hasAskedSimilarQuestion(question)) {
                return question;
            }
        }
        
        this.state.setPhase('social_history');
        return this.generateSocialHistoryQuestion();
    }

    generateSocialHistoryQuestion() {
        const socialQuestions = [
            "Rookt u of heeft u gerookt?",
            "Drinkt u alcohol? En zo ja, hoeveel per week?",
            "Wat is uw beroep?",
            "Woont u alleen of heeft u familie in de buurt?"
        ];
        
        for (const question of socialQuestions) {
            if (!this.hasAskedSimilarQuestion(question)) {
                return question;
            }
        }
        
        return "Heeft u nog andere zorgen of vragen die u wilt bespreken?";
    }

    generateGenericFollowUp() {
        const followUps = [
            "Is er nog iets anders dat u zorgen baart?",
            "Heeft u nog andere klachten?",
            "Is er nog iets dat u wilt toevoegen?",
            "Zijn er nog vragen die u heeft?"
        ];
        
        return followUps[Math.floor(Math.random() * followUps.length)];
    }

    generateUrgentFollowUp(analysis) {
        // Generate specific urgent follow-up questions
        if (analysis.symptoms.some(s => s.key === 'chest_pain')) {
            return "Heeft u ook kortademigheid, zweten, of misselijkheid?";
        }
        
        if (analysis.symptoms.some(s => s.key === 'shortness_of_breath')) {
            return "Kunt u nog normaal praten of bent u erg benauwd?";
        }
        
        return "Kunt u mij vertellen hoe u zich nu voelt?";
    }

    findLeastExploredSymptom(symptoms) {
        let leastExplored = null;
        let minDetails = Infinity;
        
        for (const symptomKey of symptoms) {
            const symptomData = this.state.patientProfile.symptoms.get(symptomKey);
            if (symptomData.details.length < minDetails) {
                minDetails = symptomData.details.length;
                leastExplored = symptomKey;
            }
        }
        
        return leastExplored;
    }

    hasAskedAbout(topic) {
        return this.state.conversationHistory.some(exchange => 
            exchange.userInput.toLowerCase().includes(topic.toLowerCase()) ||
            (exchange.analysis && exchange.analysis.symptoms.some(s => s.key === topic))
        );
    }

    hasAskedSimilarQuestion(question) {
        // Simple similarity check - in a real implementation, this would be more sophisticated
        const questionWords = question.toLowerCase().split(' ');
        
        return this.state.conversationHistory.some(exchange => {
            const inputWords = exchange.userInput.toLowerCase().split(' ');
            const commonWords = questionWords.filter(word => inputWords.includes(word));
            return commonWords.length > questionWords.length * 0.5;
        });
    }
}

class ResponseAnalyzer {
    constructor(medicalKnowledge) {
        this.knowledge = medicalKnowledge;
    }

    analyzeResponse(userInput) {
        const analysis = this.knowledge.analyzeResponse(userInput);
        
        // Add additional analysis layers
        analysis.intent = this.detectIntent(userInput);
        analysis.completeness = this.assessCompleteness(userInput);
        analysis.medicalRelevance = this.assessMedicalRelevance(userInput);
        
        return analysis;
    }

    detectIntent(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('weet niet') || lowerText.includes('niet zeker')) {
            return 'uncertain';
        }
        
        if (lowerText.includes('ja') || lowerText.includes('inderdaad')) {
            return 'confirmation';
        }
        
        if (lowerText.includes('nee') || lowerText.includes('niet')) {
            return 'denial';
        }
        
        if (lowerText.length > 50) {
            return 'detailed_description';
        }
        
        return 'information_providing';
    }

    assessCompleteness(text) {
        let score = 0;
        
        // Length indicates detail
        if (text.length > 20) score += 0.3;
        if (text.length > 50) score += 0.2;
        
        // Specific medical terms
        const symptoms = this.knowledge.extractSymptoms(text);
        if (symptoms.length > 0) score += 0.3;
        
        // Timing information
        const timing = this.knowledge.extractTiming(text);
        if (timing !== 'unknown') score += 0.2;
        
        return Math.min(1, score);
    }

    assessMedicalRelevance(text) {
        const symptoms = this.knowledge.extractSymptoms(text);
        const locations = this.knowledge.extractLocation(text);
        const severity = this.knowledge.extractSeverity(text);
        
        let relevance = 0;
        
        if (symptoms.length > 0) relevance += 0.4;
        if (locations.length > 0) relevance += 0.2;
        if (severity !== 'unknown') relevance += 0.2;
        if (text.length > 30) relevance += 0.2;
        
        return Math.min(1, relevance);
    }
}

class EmotionalIntelligence {
    generateResponse(emotions) {
        if (!emotions) return null;
        
        const responses = [];
        
        if (emotions.anxiety) {
            responses.push("Ik begrijp dat dit zorgen baart.");
        }
        
        if (emotions.pain) {
            responses.push("Dat moet erg vervelend voor u zijn.");
        }
        
        if (emotions.frustration) {
            responses.push("Ik begrijp uw frustratie.");
        }
        
        if (emotions.sadness) {
            responses.push("Ik merk dat dit moeilijk voor u is.");
        }
        
        if (responses.length > 0) {
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        return null;
    }
}

class ContextManager {
    constructor() {
        this.context = {
            currentTopic: null,
            previousTopics: [],
            pendingFollowUps: [],
            conversationGoals: []
        };
    }

    updateContext(analysis, question) {
        // Update current topic based on analysis
        if (analysis.symptoms.length > 0) {
            this.context.currentTopic = analysis.symptoms[0].key;
        }
        
        // Track conversation flow
        this.context.previousTopics.push(this.context.currentTopic);
        
        // Manage pending follow-ups
        this.managePendingFollowUps(analysis);
    }

    managePendingFollowUps(analysis) {
        // Add follow-ups based on analysis
        for (const symptom of analysis.symptoms) {
            if (symptom.data.urgencyLevel === 'high') {
                this.context.pendingFollowUps.push({
                    type: 'red_flag_check',
                    symptom: symptom.key,
                    priority: 10
                });
            }
        }
        
        // Sort by priority
        this.context.pendingFollowUps.sort((a, b) => b.priority - a.priority);
    }

    getNextPendingFollowUp() {
        return this.context.pendingFollowUps.shift();
    }
}

// Export for use in other modules
window.ConversationEngine = ConversationEngine;

