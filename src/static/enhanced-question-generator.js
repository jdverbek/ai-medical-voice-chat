// Enhanced Question Generator for Cardiology-Specialized AI Medical Assistant

class EnhancedQuestionGenerator {
    constructor(medicalKnowledge, conversationState) {
        this.knowledge = medicalKnowledge;
        this.state = conversationState;
        this.questionPriorities = this.initializeCardiologyQuestionPriorities();
        this.phaseQuestions = this.initializePhaseQuestions();
        this.adaptiveQuestions = this.initializeAdaptiveQuestions();
    }

    initializeCardiologyQuestionPriorities() {
        return {
            'red_flags': 10,
            'chest_pain_evaluation': 9,
            'cardiac_symptoms': 8,
            'functional_assessment': 7,
            'risk_factor_evaluation': 6,
            'family_history_cardiac': 5,
            'medication_review': 4,
            'previous_cardiac_events': 3,
            'lifestyle_factors': 2,
            'review_of_systems': 1
        };
    }

    initializePhaseQuestions() {
        return {
            chief_complaint: [
                "Wat is uw hoofdklacht vandaag?",
                "Wat brengt u naar de cardioloog?",
                "Welke hartklachten heeft u?",
                "Waar maakt u zich het meest zorgen over?"
            ],
            
            cardiac_symptoms: [
                // Chest pain questions
                "Heeft u pijn op de borst?",
                "Waar precies voelt u de pijn? Kunt u het aanwijzen?",
                "Hoe zou u de pijn beschrijven? Drukkend, stekend, brandend?",
                "Straalt de pijn uit naar uw arm, nek, kaak, of rug?",
                "Krijgt u de pijn bij inspanning of ook in rust?",
                "Hoe lang duurt de pijn meestal?",
                "Op een schaal van 1 tot 10, hoe erg is de pijn?",
                
                // Dyspnea questions
                "Bent u kortademig?",
                "Wanneer bent u kortademig? Bij lopen, traplopen, of in rust?",
                "Hoeveel trappen kunt u lopen zonder kortademig te worden?",
                "Wordt u 's nachts wakker door kortademigheid?",
                "Moet u extra kussens gebruiken om te kunnen slapen?",
                
                // Palpitations
                "Heeft u hartkloppingen?",
                "Hoe voelen de hartkloppingen? Snel, onregelmatig, bonzend?",
                "Hoe lang duren de hartkloppingen?",
                "Begint en stopt het plotseling?",
                
                // Syncope
                "Bent u wel eens flauwgevallen?",
                "Had u waarschuwingssignalen voor het flauwvallen?",
                "Gebeurde het bij inspanning of in rust?",
                
                // Other cardiac symptoms
                "Heeft u gezwollen benen of enkels?",
                "Bent u de laatste tijd meer moe dan normaal?",
                "Heeft u wel eens blauw aangelopen?"
            ],
            
            risk_factors: [
                // Smoking
                "Rookt u of heeft u gerookt?",
                "Hoeveel sigaretten per dag rookt/rookte u?",
                "Hoe lang rookt u al?",
                "Heeft u ooit geprobeerd te stoppen met roken?",
                
                // Hypertension
                "Heeft u hoge bloeddruk?",
                "Wanneer werd de hoge bloeddruk vastgesteld?",
                "Wat zijn uw laatste bloeddrukwaarden?",
                "Neemt u medicijnen voor hoge bloeddruk?",
                
                // Diabetes
                "Heeft u diabetes (suikerziekte)?",
                "Type 1 of type 2 diabetes?",
                "Hoe wordt uw diabetes behandeld?",
                "Wat zijn uw laatste HbA1c waarden?",
                
                // Cholesterol
                "Heeft u hoog cholesterol?",
                "Wat waren uw laatste cholesterolwaarden?",
                "Neemt u cholesterolverlagers?",
                
                // Obesity
                "Wat is uw lengte en gewicht?",
                "Bent u de laatste tijd aangekomen?",
                
                // Physical activity
                "Sport u regelmatig?",
                "Hoeveel beweging krijgt u per week?",
                "Bent u minder actief geworden door uw klachten?",
                
                // Stress
                "Heeft u veel stress in uw leven?",
                "Wat zijn de belangrijkste stressfactoren?",
                "Beïnvloedt stress uw hartklachten?"
            ],
            
            family_history: [
                "Heeft uw vader hartproblemen gehad? En zo ja, op welke leeftijd?",
                "Heeft uw moeder hartproblemen gehad? En zo ja, op welke leeftijd?",
                "Zijn er familieleden jong overleden aan een hartinfarct?",
                "Komt hoge bloeddruk voor in uw familie?",
                "Heeft iemand in uw familie plotse hartdood gehad?",
                "Komen er aangeboren hartafwijkingen voor in uw familie?",
                "Heeft iemand in uw familie diabetes?",
                "Komt hoog cholesterol voor in uw familie?"
            ],
            
            medications: [
                "Welke medicijnen gebruikt u momenteel?",
                "Gebruikt u medicijnen voor uw hart?",
                "Neemt u bloedverdunners zoals aspirine of acenocoumarol?",
                "Gebruikt u medicijnen voor hoge bloeddruk?",
                "Neemt u cholesterolverlagers?",
                "Gebruikt u medicijnen voor diabetes?",
                "Heeft u allergieën voor medicijnen?",
                "Gebruikt u vrij verkrijgbare medicijnen of supplementen?",
                "Heeft u ooit bijwerkingen gehad van medicijnen?"
            ],
            
            functional_assessment: [
                "Hoeveel trappen kunt u lopen zonder klachten?",
                "Kunt u nog 500 meter normaal lopen?",
                "Moet u stoppen tijdens het lopen vanwege klachten?",
                "Kunt u nog huishoudelijk werk doen?",
                "Kunt u nog sporten of zware klussen doen?",
                "Hoe beïnvloeden uw klachten uw dagelijks leven?",
                "Kunt u nog werken zoals vroeger?",
                "Bent u beperkt in uw sociale activiteiten?"
            ],
            
            lifestyle_factors: [
                "Hoeveel alcohol drinkt u per week?",
                "Gebruikt u drugs of stimulerende middelen?",
                "Hoe is uw voedingspatroon?",
                "Eet u veel zout?",
                "Eet u veel vet voedsel?",
                "Eet u voldoende groenten en fruit?",
                "Slaapt u goed?",
                "Hoeveel uur slaapt u per nacht?",
                "Snurkt u?",
                "Heeft u slaapapneu?"
            ],
            
            review_of_systems: [
                "Heeft u hoofdpijn of duizeligheid?",
                "Heeft u problemen met uw zicht?",
                "Heeft u buikpijn of spijsverteringsproblemen?",
                "Heeft u problemen met plassen?",
                "Heeft u gewichtsveranderingen?",
                "Heeft u koorts of nachtzweten gehad?",
                "Heeft u problemen met uw geheugen?",
                "Heeft u depressieve klachten?"
            ]
        };
    }

    initializeAdaptiveQuestions() {
        return {
            // Questions based on specific symptoms
            chest_pain_adaptive: {
                if_exertional: [
                    "Hoeveel inspanning is nodig om de pijn te krijgen?",
                    "Krijgt u de pijn al bij normaal lopen?",
                    "Moet u stoppen tijdens het lopen vanwege de pijn?",
                    "Hoe snel gaat de pijn weg als u stopt met de inspanning?"
                ],
                if_rest_pain: [
                    "Heeft u de pijn ook 's nachts?",
                    "Wordt u wakker door de pijn?",
                    "Hoe lang duurt de pijn in rust?",
                    "Helpt nitraat tegen de pijn?"
                ],
                if_radiation: [
                    "Straalt de pijn uit naar beide armen of alleen links?",
                    "Voelt u de pijn ook in uw nek of kaak?",
                    "Gaat de pijn naar uw rug of tussen uw schouderbladen?",
                    "Voelt de uitstraling anders dan de borstpijn?"
                ]
            },
            
            dyspnea_adaptive: {
                if_exertional: [
                    "Bij welke inspanning wordt u kortademig?",
                    "Kunt u nog trappen lopen?",
                    "Hoeveel meter kunt u lopen zonder te stoppen?",
                    "Is de kortademigheid erger geworden?"
                ],
                if_orthopnea: [
                    "Hoeveel kussens gebruikt u om te slapen?",
                    "Kunt u plat liggen zonder kortademig te worden?",
                    "Slaapt u wel eens rechtop in een stoel?",
                    "Hoe snel wordt u kortademig als u plat ligt?"
                ],
                if_pnd: [
                    "Hoe vaak wordt u 's nachts wakker door kortademigheid?",
                    "Moet u naar het raam of naar buiten voor lucht?",
                    "Hoe lang duurt het voor u weer kunt slapen?",
                    "Hoest u ook als u kortademig wordt 's nachts?"
                ]
            },
            
            palpitations_adaptive: {
                if_irregular: [
                    "Voelt uw hart alsof het overslaat?",
                    "Is het ritme helemaal onregelmatig?",
                    "Kunt u het ritme kloppen op tafel?",
                    "Duurt de onregelmatigheid lang?"
                ],
                if_fast: [
                    "Hoe snel klopt uw hart tijdens de aanval?",
                    "Begint het plotseling snel te kloppen?",
                    "Stopt het ook plotseling?",
                    "Kunt u het zelf stoppen met bepaalde manoeuvres?"
                ]
            },
            
            // Risk factor specific follow-ups
            smoking_adaptive: [
                "Hoeveel pakjes per dag rookt u?",
                "Op welke leeftijd bent u begonnen met roken?",
                "Heeft u ooit langer dan een jaar gestopt?",
                "Rookt u ook pijp, sigaren, of e-sigaretten?",
                "Wilt u stoppen met roken?"
            ],
            
            diabetes_adaptive: [
                "Hoe lang heeft u al diabetes?",
                "Hoe is uw bloedsuiker de laatste tijd?",
                "Heeft u ooit diabetische complicaties gehad?",
                "Controleert u zelf uw bloedsuiker?",
                "Heeft u diabetische oogproblemen of nierproblemen?"
            ],
            
            hypertension_adaptive: [
                "Hoe lang heeft u al hoge bloeddruk?",
                "Wat zijn uw gebruikelijke bloeddrukwaarden?",
                "Meet u thuis uw bloeddruk?",
                "Hoe vaak wordt uw bloeddruk gecontroleerd?",
                "Heeft u ooit zeer hoge bloeddruk gehad?"
            ]
        };
    }

    async generateNextQuestion(analysis) {
        try {
            // Simulate AI thinking delay
            await this.simulateThinking();
            
            // Check for immediate red flag follow-ups
            const redFlagQuestion = this.checkRedFlagFollowUps(analysis);
            if (redFlagQuestion) {
                return redFlagQuestion;
            }
            
            // Check for symptom-specific adaptive questions
            const adaptiveQuestion = this.generateAdaptiveQuestion(analysis);
            if (adaptiveQuestion) {
                return adaptiveQuestion;
            }
            
            // Generate phase-appropriate question
            const phaseQuestion = this.generatePhaseQuestion();
            if (phaseQuestion) {
                return phaseQuestion;
            }
            
            // Generate functional assessment if cardiac symptoms present
            const functionalQuestion = this.generateFunctionalAssessmentQuestion(analysis);
            if (functionalQuestion) {
                return functionalQuestion;
            }
            
            // Move to next phase if current phase is complete
            return this.generateNextPhaseQuestion();
            
        } catch (error) {
            console.warn('EnhancedQuestionGenerator: Error generating question:', error);
            return this.generateFallbackQuestion(analysis);
        }
    }

    async simulateThinking() {
        const thinkingTime = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, thinkingTime));
    }

    checkRedFlagFollowUps(analysis) {
        if (!analysis.redFlags || analysis.redFlags.length === 0) {
            return null;
        }
        
        const redFlagQuestions = {
            "left_arm_radiation": "Straalt de pijn uit naar uw linkerarm?",
            "jaw_pain": "Heeft u ook pijn in uw kaak of nek?",
            "sudden_onset": "Kwam de pijn plotseling opzetten, binnen enkele minuten?",
            "crushing_pain": "Voelt de pijn alsof er een olifant op uw borst staat?",
            "rest_pain": "Heeft u de pijn ook in rust, zonder inspanning?",
            "sweating": "Zweet u ook, vooral koud zweet?",
            "nausea": "Heeft u ook misselijkheid of heeft u overgegeven?",
            "syncope": "Bent u flauwgevallen of bijna flauwgevallen?"
        };
        
        // Return first unasked red flag question
        for (const redFlag of analysis.redFlags) {
            const question = redFlagQuestions[redFlag];
            if (question && !this.hasAskedSimilarQuestion(question)) {
                return question;
            }
        }
        
        return null;
    }

    generateAdaptiveQuestion(analysis) {
        if (!analysis.symptoms || analysis.symptoms.length === 0) {
            return null;
        }
        
        for (const symptom of analysis.symptoms) {
            const adaptiveQuestions = this.getAdaptiveQuestionsForSymptom(symptom, analysis);
            if (adaptiveQuestions && adaptiveQuestions.length > 0) {
                // Return first unasked adaptive question
                for (const question of adaptiveQuestions) {
                    if (!this.hasAskedSimilarQuestion(question)) {
                        return question;
                    }
                }
            }
        }
        
        return null;
    }

    getAdaptiveQuestionsForSymptom(symptom, analysis) {
        const symptomKey = symptom.key;
        
        if (symptomKey === 'chest_pain') {
            // Determine which adaptive questions to ask based on analysis
            if (analysis.redFlags && analysis.redFlags.includes('rest_pain')) {
                return this.adaptiveQuestions.chest_pain_adaptive.if_rest_pain;
            }
            if (analysis.redFlags && analysis.redFlags.includes('left_arm_radiation')) {
                return this.adaptiveQuestions.chest_pain_adaptive.if_radiation;
            }
            // Default to exertional questions
            return this.adaptiveQuestions.chest_pain_adaptive.if_exertional;
        }
        
        if (symptomKey === 'shortness_of_breath') {
            if (analysis.redFlags && analysis.redFlags.includes('orthopnea')) {
                return this.adaptiveQuestions.dyspnea_adaptive.if_orthopnea;
            }
            if (analysis.redFlags && analysis.redFlags.includes('paroxysmal_nocturnal_dyspnea')) {
                return this.adaptiveQuestions.dyspnea_adaptive.if_pnd;
            }
            return this.adaptiveQuestions.dyspnea_adaptive.if_exertional;
        }
        
        if (symptomKey === 'palpitations') {
            if (analysis.redFlags && analysis.redFlags.includes('irregular_rhythm')) {
                return this.adaptiveQuestions.palpitations_adaptive.if_irregular;
            }
            return this.adaptiveQuestions.palpitations_adaptive.if_fast;
        }
        
        return null;
    }

    generatePhaseQuestion() {
        const currentPhase = this.state.getPhase();
        const phaseQuestions = this.phaseQuestions[currentPhase];
        
        if (!phaseQuestions) {
            return null;
        }
        
        // Find unasked question in current phase
        for (const question of phaseQuestions) {
            if (!this.hasAskedSimilarQuestion(question)) {
                return question;
            }
        }
        
        return null;
    }

    generateFunctionalAssessmentQuestion(analysis) {
        // If cardiac symptoms are present, assess functional capacity
        if (analysis.symptoms && analysis.symptoms.some(s => 
            ['chest_pain', 'shortness_of_breath', 'fatigue'].includes(s.key)
        )) {
            const functionalQuestions = this.phaseQuestions.functional_assessment;
            
            for (const question of functionalQuestions) {
                if (!this.hasAskedSimilarQuestion(question)) {
                    return question;
                }
            }
        }
        
        return null;
    }

    generateNextPhaseQuestion() {
        const currentPhase = this.state.getPhase();
        const nextPhase = this.getNextPhase(currentPhase);
        
        if (nextPhase) {
            this.state.setPhase(nextPhase);
            
            // Get transition message
            const transitionMessage = this.knowledge.conversationPatterns.phaseTransitions[`to${nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1)}`];
            
            if (transitionMessage) {
                return transitionMessage;
            }
            
            // Get first question from next phase
            const nextPhaseQuestions = this.phaseQuestions[nextPhase];
            if (nextPhaseQuestions && nextPhaseQuestions.length > 0) {
                return nextPhaseQuestions[0];
            }
        }
        
        return this.generateCompletionQuestion();
    }

    getNextPhase(currentPhase) {
        const phaseOrder = [
            'chief_complaint',
            'cardiac_symptoms', 
            'functional_assessment',
            'risk_factors',
            'family_history',
            'medications',
            'lifestyle_factors',
            'review_of_systems'
        ];
        
        const currentIndex = phaseOrder.indexOf(currentPhase);
        if (currentIndex >= 0 && currentIndex < phaseOrder.length - 1) {
            return phaseOrder[currentIndex + 1];
        }
        
        return null;
    }

    generateCompletionQuestion() {
        const completionQuestions = [
            "Heeft u nog andere hartklachten die we niet hebben besproken?",
            "Is er nog iets dat u zorgen baart over uw hart?",
            "Heeft u nog vragen over uw hartklachten?",
            "Is er nog andere informatie die u belangrijk vindt voor uw cardioloog?"
        ];
        
        for (const question of completionQuestions) {
            if (!this.hasAskedSimilarQuestion(question)) {
                return question;
            }
        }
        
        return "Dank u voor alle informatie. Ik ga nu een samenvatting maken voor uw cardioloog.";
    }

    generateFallbackQuestion(analysis) {
        const fallbackQuestions = [
            "Kunt u mij daar meer over vertellen?",
            "Dat is nuttige informatie. Kunt u dat wat uitbreiden?",
            "Ik wil zeker zijn dat ik alles goed begrijp. Kunt u dat anders formuleren?",
            "Kunt u een voorbeeld geven van wanneer dit gebeurt?"
        ];
        
        return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
    }

    generateUrgentFollowUp(analysis) {
        if (analysis.symptoms && analysis.symptoms.some(s => s.key === 'chest_pain')) {
            return "Heeft u ook kortademigheid, zweten, misselijkheid, of pijn in uw arm?";
        }
        
        if (analysis.symptoms && analysis.symptoms.some(s => s.key === 'shortness_of_breath')) {
            return "Kunt u nog normaal praten of bent u erg benauwd?";
        }
        
        if (analysis.symptoms && analysis.symptoms.some(s => s.key === 'syncope')) {
            return "Gebeurde het flauwvallen tijdens inspanning of had u waarschuwingssignalen?";
        }
        
        return "Kunt u mij vertellen hoe u zich nu voelt en wat uw ergste klacht is?";
    }

    hasAskedSimilarQuestion(question) {
        const normalizedQuestion = this.normalizeQuestion(question);
        const conversationHistory = this.state.conversationHistory;
        
        // Check if similar question was asked in conversation history
        for (const exchange of conversationHistory) {
            if (exchange.question) {
                const normalizedHistoryQuestion = this.normalizeQuestion(exchange.question);
                if (this.questionsAreSimilar(normalizedQuestion, normalizedHistoryQuestion)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    normalizeQuestion(question) {
        return question.toLowerCase()
            .replace(/[?.,!]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    questionsAreSimilar(question1, question2) {
        const words1 = question1.split(' ').filter(word => word.length > 3);
        const words2 = question2.split(' ').filter(word => word.length > 3);
        
        const commonWords = words1.filter(word => words2.includes(word));
        const similarity = commonWords.length / Math.max(words1.length, words2.length);
        
        return similarity > 0.6; // 60% similarity threshold
    }

    // Risk factor specific question generation
    generateRiskFactorQuestions(riskFactor) {
        const riskFactorQuestions = {
            smoking: this.adaptiveQuestions.smoking_adaptive,
            diabetes: this.adaptiveQuestions.diabetes_adaptive,
            hypertension: this.adaptiveQuestions.hypertension_adaptive
        };
        
        const questions = riskFactorQuestions[riskFactor];
        if (questions) {
            for (const question of questions) {
                if (!this.hasAskedSimilarQuestion(question)) {
                    return question;
                }
            }
        }
        
        return null;
    }

    // NYHA class assessment questions
    generateNYHAAssessmentQuestions() {
        const nyhaQuestions = [
            "Kunt u nog alle normale activiteiten doen zonder klachten?",
            "Krijgt u klachten bij zware inspanning zoals hardlopen of zware klussen?",
            "Krijgt u klachten bij normale activiteiten zoals wandelen of traplopen?",
            "Heeft u klachten bij de minste inspanning of zelfs in rust?",
            "Hoeveel trappen kunt u lopen zonder te stoppen?",
            "Kunt u 500 meter normaal lopen zonder klachten?",
            "Moet u 's nachts rechtop slapen vanwege kortademigheid?"
        ];
        
        for (const question of nyhaQuestions) {
            if (!this.hasAskedSimilarQuestion(question)) {
                return question;
            }
        }
        
        return null;
    }

    // CCS class assessment questions  
    generateCCSAssessmentQuestions() {
        const ccsQuestions = [
            "Krijgt u pijn op de borst bij normale dagelijkse activiteiten?",
            "Krijgt u pijn bij sneller lopen of traplopen?",
            "Krijgt u pijn bij normaal wandelen op vlak terrein?",
            "Krijgt u pijn bij de minste inspanning of in rust?",
            "Hoeveel meter kunt u lopen voordat u pijn krijgt?",
            "Moet u stoppen tijdens het lopen vanwege pijn op de borst?"
        ];
        
        for (const question of ccsQuestions) {
            if (!this.hasAskedSimilarQuestion(question)) {
                return question;
            }
        }
        
        return null;
    }
}

// Enhanced Response Analyzer for cardiology
class EnhancedResponseAnalyzer {
    constructor(medicalKnowledge) {
        this.knowledge = medicalKnowledge;
    }

    analyzeResponse(userInput) {
        const analysis = this.knowledge.analyzeResponse(userInput);
        
        // Add cardiology-specific analysis layers
        analysis.intent = this.detectCardiologyIntent(userInput);
        analysis.completeness = this.assessCardiologyCompleteness(userInput);
        analysis.medicalRelevance = this.assessCardiologyRelevance(userInput);
        analysis.nyhaClass = this.assessNYHAClass(userInput);
        analysis.ccsClass = this.assessCCSClass(userInput);
        
        return analysis;
    }

    detectCardiologyIntent(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('weet niet') || lowerText.includes('niet zeker')) {
            return 'uncertain';
        }
        
        if (lowerText.includes('ja') || lowerText.includes('inderdaad') || lowerText.includes('klopt')) {
            return 'confirmation';
        }
        
        if (lowerText.includes('nee') || lowerText.includes('niet')) {
            return 'denial';
        }
        
        if (lowerText.includes('soms') || lowerText.includes('af en toe')) {
            return 'intermittent';
        }
        
        if (lowerText.length > 50) {
            return 'detailed_description';
        }
        
        return 'information_providing';
    }

    assessCardiologyCompleteness(text) {
        let score = 0;
        
        // Length indicates detail
        if (text.length > 20) score += 0.2;
        if (text.length > 50) score += 0.2;
        
        // Cardiac symptoms
        const symptoms = this.knowledge.extractCardiologySymptoms(text);
        if (symptoms.length > 0) score += 0.3;
        
        // Risk factors
        const riskFactors = this.knowledge.extractRiskFactors(text);
        if (riskFactors.length > 0) score += 0.2;
        
        // Functional information
        if (text.toLowerCase().includes('trap') || text.toLowerCase().includes('lopen')) {
            score += 0.1;
        }
        
        return Math.min(1, score);
    }

    assessCardiologyRelevance(text) {
        const symptoms = this.knowledge.extractCardiologySymptoms(text);
        const riskFactors = this.knowledge.extractRiskFactors(text);
        const redFlags = this.knowledge.identifyRedFlags(text);
        
        let relevance = 0;
        
        if (symptoms.length > 0) relevance += 0.4;
        if (riskFactors.length > 0) relevance += 0.3;
        if (redFlags.length > 0) relevance += 0.2;
        if (text.length > 30) relevance += 0.1;
        
        return Math.min(1, relevance);
    }

    assessNYHAClass(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('rust') && (lowerText.includes('klachten') || lowerText.includes('kortademig'))) {
            return 'IV';
        } else if (lowerText.includes('stoppen') || lowerText.includes('niet kunnen')) {
            return 'III';
        } else if (lowerText.includes('trap') && lowerText.includes('moeilijk')) {
            return 'II';
        } else if (lowerText.includes('normaal') || lowerText.includes('geen probleem')) {
            return 'I';
        }
        
        return null;
    }

    assessCCSClass(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('rust') && lowerText.includes('pijn')) {
            return 'IV';
        } else if (lowerText.includes('normaal lopen') && lowerText.includes('pijn')) {
            return 'III';
        } else if (lowerText.includes('sneller') || lowerText.includes('trap')) {
            return 'II';
        } else if (lowerText.includes('zware inspanning')) {
            return 'I';
        }
        
        return null;
    }
}

// Enhanced Context Manager for cardiology
class EnhancedContextManager {
    constructor() {
        this.context = {
            currentTopic: null,
            previousTopics: [],
            pendingFollowUps: [],
            conversationGoals: [],
            cardiologyFocus: {
                primarySymptom: null,
                riskProfile: 'unknown',
                urgencyLevel: 'routine',
                functionalClass: null
            }
        };
    }

    updateContext(analysis, userInput) {
        // Update cardiology-specific context
        this.updateCardiologyFocus(analysis);
        
        // Update current topic based on analysis
        if (analysis.symptoms && analysis.symptoms.length > 0) {
            this.context.currentTopic = analysis.symptoms[0].key;
            
            // Set primary symptom if not already set
            if (!this.context.cardiologyFocus.primarySymptom) {
                this.context.cardiologyFocus.primarySymptom = analysis.symptoms[0].key;
            }
        }
        
        // Track conversation flow
        this.context.previousTopics.push(this.context.currentTopic);
        
        // Manage pending follow-ups
        this.managePendingFollowUps(analysis);
        
        // Update urgency level
        if (analysis.urgency && analysis.urgency !== 'routine') {
            this.context.cardiologyFocus.urgencyLevel = analysis.urgency;
        }
    }

    updateCardiologyFocus(analysis) {
        // Update risk profile based on detected risk factors
        if (analysis.cardiacRiskFactors && analysis.cardiacRiskFactors.length > 0) {
            const riskCount = analysis.cardiacRiskFactors.length;
            if (riskCount >= 3) {
                this.context.cardiologyFocus.riskProfile = 'high';
            } else if (riskCount >= 1) {
                this.context.cardiologyFocus.riskProfile = 'moderate';
            } else {
                this.context.cardiologyFocus.riskProfile = 'low';
            }
        }
        
        // Update functional class
        if (analysis.functionalCapacity) {
            this.context.cardiologyFocus.functionalClass = analysis.functionalCapacity.nyhaClass;
        }
    }

    managePendingFollowUps(analysis) {
        // Add cardiology-specific follow-ups based on analysis
        if (analysis.redFlags && analysis.redFlags.length > 0) {
            for (const redFlag of analysis.redFlags) {
                this.context.pendingFollowUps.push({
                    type: 'red_flag_assessment',
                    flag: redFlag,
                    priority: 10
                });
            }
        }
        
        if (analysis.symptoms) {
            for (const symptom of analysis.symptoms) {
                if (['chest_pain', 'shortness_of_breath', 'syncope'].includes(symptom.key)) {
                    this.context.pendingFollowUps.push({
                        type: 'symptom_characterization',
                        symptom: symptom.key,
                        priority: 8
                    });
                }
            }
        }
        
        // Sort by priority
        this.context.pendingFollowUps.sort((a, b) => b.priority - a.priority);
    }

    getNextPendingFollowUp() {
        return this.context.pendingFollowUps.shift();
    }

    getCardiologyFocus() {
        return this.context.cardiologyFocus;
    }
}

// Export for use in other modules
window.EnhancedQuestionGenerator = EnhancedQuestionGenerator;
window.EnhancedResponseAnalyzer = EnhancedResponseAnalyzer;
window.EnhancedContextManager = EnhancedContextManager;

