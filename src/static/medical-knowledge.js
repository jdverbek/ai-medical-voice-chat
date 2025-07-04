// Medical Knowledge Base for Dutch/Flemish AI Medical Assistant

class MedicalKnowledge {
    constructor() {
        this.symptoms = this.initializeSymptoms();
        this.conversationPatterns = this.initializeConversationPatterns();
        this.medicalCategories = this.initializeMedicalCategories();
        this.followUpRules = this.initializeFollowUpRules();
        this.urgencyIndicators = this.initializeUrgencyIndicators();
        this.dutchMedicalTerms = this.initializeDutchTerms();
    }

    initializeSymptoms() {
        return {
            // Cardiovascular symptoms
            "chest_pain": {
                dutch: ["borstpijn", "pijn op de borst", "druk op de borst", "beklemming"],
                followUpQuestions: [
                    "Waar precies voelt u de pijn op uw borst?",
                    "Straalt de pijn uit naar uw arm, nek of kaak?",
                    "Wat veroorzaakt de pijn? Inspanning, rust, of iets anders?",
                    "Hoe zou u de pijn beschrijven? Drukkend, stekend, brandend?",
                    "Op een schaal van 1 tot 10, hoe erg is de pijn?",
                    "Hoe lang duurt de pijn meestal?",
                    "Heeft u ook kortademigheid of zweten?"
                ],
                redFlags: ["left_arm_radiation", "jaw_pain", "shortness_of_breath", "sweating", "nausea"],
                relatedSymptoms: ["shortness_of_breath", "nausea", "dizziness", "sweating", "fatigue"],
                urgencyLevel: "high",
                category: "cardiovascular",
                socrates: {
                    site: "Kunt u precies aanwijzen waar de pijn zit?",
                    onset: "Wanneer begon de pijn? Plotseling of geleidelijk?",
                    character: "Hoe voelt de pijn? Drukkend, stekend, brandend, of anders?",
                    radiation: "Straalt de pijn uit naar andere delen van uw lichaam?",
                    associations: "Heeft u ook andere klachten zoals misselijkheid of zweten?",
                    timing: "Wanneer heeft u de pijn? Bij inspanning, in rust, of altijd?",
                    exacerbating: "Wat maakt de pijn erger? En wat maakt het beter?",
                    severity: "Op een schaal van 1 tot 10, hoe erg is de pijn?"
                }
            },

            "shortness_of_breath": {
                dutch: ["kortademig", "benauwd", "moeilijk ademen", "buiten adem"],
                followUpQuestions: [
                    "Wanneer bent u kortademig? Bij inspanning of ook in rust?",
                    "Hoe lang heeft u al last van kortademigheid?",
                    "Wordt het erger als u plat ligt?",
                    "Heeft u ook pijn op de borst?",
                    "Hoest u ook? En zo ja, hoest u slijm op?",
                    "Heeft u gezwollen enkels of benen?",
                    "Gebruikt u extra kussens om te kunnen slapen?"
                ],
                redFlags: ["rest_dyspnea", "orthopnea", "chest_pain", "leg_swelling"],
                relatedSymptoms: ["chest_pain", "cough", "fatigue", "leg_swelling"],
                urgencyLevel: "high",
                category: "respiratory"
            },

            "headache": {
                dutch: ["hoofdpijn", "pijn in het hoofd", "migraine", "hoofdklachten"],
                followUpQuestions: [
                    "Hoe lang heeft u al hoofdpijn?",
                    "Is dit anders dan uw gewone hoofdpijn?",
                    "Waar precies doet uw hoofd pijn?",
                    "Hoe zou u de pijn beschrijven? Kloppend, drukkend, stekend?",
                    "Heeft u ook misselijkheid of overgeven?",
                    "Heeft u problemen met uw zicht?",
                    "Is uw nek stijf?",
                    "Wat maakt de hoofdpijn erger of beter?"
                ],
                redFlags: ["sudden_onset", "worst_headache_ever", "vision_changes", "neck_stiffness", "fever"],
                relatedSymptoms: ["nausea", "vision_changes", "neck_stiffness", "fever", "confusion"],
                urgencyLevel: "medium",
                category: "neurological"
            },

            "abdominal_pain": {
                dutch: ["buikpijn", "pijn in de buik", "maagpijn", "krampen"],
                followUpQuestions: [
                    "Waar precies in uw buik doet het pijn?",
                    "Hoe lang heeft u al buikpijn?",
                    "Hoe zou u de pijn beschrijven? Krampend, stekend, brandend?",
                    "Heeft u ook misselijkheid of overgeven?",
                    "Heeft u koorts?",
                    "Hoe is uw ontlasting? Normaal, diarree, of obstipatie?",
                    "Eet u nog normaal?",
                    "Wat maakt de pijn erger of beter?"
                ],
                redFlags: ["severe_pain", "fever", "vomiting", "blood_in_stool", "rigid_abdomen"],
                relatedSymptoms: ["nausea", "vomiting", "fever", "diarrhea", "constipation"],
                urgencyLevel: "medium",
                category: "gastrointestinal"
            },

            "fever": {
                dutch: ["koorts", "verhoging", "warm", "rillingen"],
                followUpQuestions: [
                    "Hoe hoog is uw temperatuur?",
                    "Hoe lang heeft u al koorts?",
                    "Heeft u ook rillingen?",
                    "Heeft u andere klachten zoals hoofdpijn of keelpijn?",
                    "Heeft u pijn bij het plassen?",
                    "Hoest u? En zo ja, hoest u slijm op?",
                    "Heeft u recent gereisd?",
                    "Neemt u medicijnen tegen de koorts?"
                ],
                redFlags: ["high_fever", "persistent_fever", "difficulty_breathing", "confusion"],
                relatedSymptoms: ["chills", "headache", "cough", "sore_throat", "urinary_symptoms"],
                urgencyLevel: "medium",
                category: "infectious"
            },

            "cough": {
                dutch: ["hoest", "hoesten", "kuchen"],
                followUpQuestions: [
                    "Hoe lang hoest u al?",
                    "Hoest u slijm op? En zo ja, welke kleur?",
                    "Hoest u bloed op?",
                    "Is de hoest erger 's nachts of overdag?",
                    "Heeft u ook koorts?",
                    "Bent u kortademig?",
                    "Rookt u of heeft u gerookt?",
                    "Neemt u medicijnen tegen de hoest?"
                ],
                redFlags: ["blood_in_sputum", "persistent_cough", "weight_loss", "night_sweats"],
                relatedSymptoms: ["fever", "shortness_of_breath", "chest_pain", "fatigue"],
                urgencyLevel: "low",
                category: "respiratory"
            },

            "dizziness": {
                dutch: ["duizelig", "draaierig", "licht in het hoofd", "wankel"],
                followUpQuestions: [
                    "Hoe zou u de duizeligheid beschrijven? Draaiend of zwevend?",
                    "Wanneer heeft u last van duizeligheid?",
                    "Hoe lang duurt een aanval van duizeligheid?",
                    "Heeft u ook misselijkheid of overgeven?",
                    "Heeft u problemen met uw gehoor?",
                    "Valt u ook wel eens?",
                    "Gebruikt u medicijnen voor bloeddruk?",
                    "Heeft u diabetes?"
                ],
                redFlags: ["falls", "hearing_loss", "severe_headache", "confusion"],
                relatedSymptoms: ["nausea", "headache", "hearing_problems", "balance_problems"],
                urgencyLevel: "medium",
                category: "neurological"
            }
        };
    }

    initializeConversationPatterns() {
        return {
            opening: [
                "Goedemorgen! Ik ben uw AI medische assistent. Ik ga u enkele vragen stellen over uw gezondheid. Kunt u mij vertellen wat u vandaag naar de dokter brengt?",
                "Welkom! Ik help u bij het verzamelen van uw medische informatie. Wat is uw hoofdklacht vandaag?",
                "Hallo! Laten we beginnen met uw medische anamnese. Wat is het belangrijkste probleem waarvoor u hulp zoekt?"
            ],
            
            clarification: [
                "Kunt u dat wat meer uitleggen?",
                "Dat is interessant. Vertel me daar eens meer over.",
                "Ik wil zeker zijn dat ik u goed begrijp. Kunt u dat anders formuleren?",
                "Kunt u een voorbeeld geven?",
                "Wat bedoelt u precies met...?"
            ],
            
            empathy: [
                "Dat moet vervelend voor u zijn.",
                "Ik begrijp dat dit zorgen baart.",
                "Dank u dat u dit met mij deelt.",
                "Dat klinkt inderdaad lastig.",
                "Ik kan me voorstellen dat dit moeilijk is."
            ],
            
            encouragement: [
                "U doet het goed. Laten we doorgaan.",
                "Dank u voor de duidelijke uitleg.",
                "Deze informatie is heel waardevol.",
                "U helpt me erg door zo open te zijn.",
                "Uitstekend, dat geeft me een goed beeld."
            ],
            
            transition: [
                "Laten we het nu hebben over...",
                "Ik wil graag nog iets anders vragen.",
                "Nu wil ik het over een ander onderwerp hebben.",
                "Laten we overgaan naar...",
                "Nog een paar vragen over..."
            ],
            
            urgency: [
                "Dit klinkt als iets dat snel bekeken moet worden.",
                "Ik raad u aan om contact op te nemen met uw huisarts.",
                "Deze klachten verdienen snelle aandacht.",
                "U zou dit vandaag nog moeten laten controleren.",
                "Dit is iets om serieus te nemen."
            ]
        };
    }

    initializeMedicalCategories() {
        return {
            "personal_info": {
                name: "Persoonlijke Gegevens",
                questions: [
                    "Wat is uw volledige naam?",
                    "Wat is uw geboortedatum?",
                    "Wat is uw adres?",
                    "Wat is uw telefoonnummer?",
                    "Wie is uw huisarts?"
                ]
            },
            
            "chief_complaint": {
                name: "Hoofdklacht",
                questions: [
                    "Wat is uw hoofdklacht vandaag?",
                    "Wat brengt u naar de dokter?",
                    "Waar heeft u het meest last van?"
                ]
            },
            
            "current_illness": {
                name: "Huidige Ziekte",
                questions: [
                    "Wanneer begonnen uw klachten?",
                    "Hoe zijn de klachten ontstaan?",
                    "Zijn de klachten erger geworden?",
                    "Wat maakt de klachten beter of slechter?"
                ]
            },
            
            "medical_history": {
                name: "Medische Voorgeschiedenis",
                questions: [
                    "Heeft u eerder ziektes gehad?",
                    "Bent u ooit geopereerd?",
                    "Heeft u allergieën?",
                    "Gebruikt u medicijnen?"
                ]
            },
            
            "family_history": {
                name: "Familiegeschiedenis",
                questions: [
                    "Zijn er ziektes in uw familie?",
                    "Heeft uw vader of moeder bepaalde aandoeningen gehad?",
                    "Zijn er erfelijke ziektes bekend in uw familie?"
                ]
            },
            
            "social_history": {
                name: "Sociale Anamnese",
                questions: [
                    "Rookt u?",
                    "Drinkt u alcohol?",
                    "Wat is uw beroep?",
                    "Woont u alleen of met anderen?"
                ]
            },
            
            "review_of_systems": {
                name: "Systeem Review",
                questions: [
                    "Heeft u last van uw hart?",
                    "Heeft u problemen met ademen?",
                    "Hoe is uw eetlust?",
                    "Slaapt u goed?"
                ]
            }
        };
    }

    initializeFollowUpRules() {
        return {
            // Symptom-based follow-up rules
            symptomRules: {
                "chest_pain": {
                    triggers: ["borstpijn", "pijn op de borst", "druk op de borst"],
                    mandatoryFollowUps: [
                        "radiation_check",
                        "severity_assessment", 
                        "trigger_identification",
                        "associated_symptoms"
                    ],
                    conditionalFollowUps: {
                        "if_radiation": "Straalt de pijn uit naar uw linkerarm of kaak?",
                        "if_exertion": "Krijgt u de pijn bij inspanning?",
                        "if_severe": "Is de pijn zo erg dat u er wakker van wordt?"
                    }
                },
                
                "shortness_of_breath": {
                    triggers: ["kortademig", "benauwd", "moeilijk ademen"],
                    mandatoryFollowUps: [
                        "exertion_tolerance",
                        "orthopnea_check",
                        "duration_assessment"
                    ]
                }
            },
            
            // Age-based follow-up rules
            ageRules: {
                "elderly": {
                    ageThreshold: 65,
                    additionalQuestions: [
                        "Valt u wel eens?",
                        "Heeft u problemen met uw geheugen?",
                        "Kunt u nog goed voor uzelf zorgen?",
                        "Neemt u veel verschillende medicijnen?"
                    ]
                },
                
                "young_adult": {
                    ageRange: [18, 40],
                    additionalQuestions: [
                        "Gebruikt u drugs of alcohol?",
                        "Bent u seksueel actief?",
                        "Gebruikt u anticonceptie?"
                    ]
                }
            },
            
            // Gender-based follow-up rules
            genderRules: {
                "female": {
                    additionalQuestions: [
                        "Wanneer was uw laatste menstruatie?",
                        "Bent u zwanger of zou u zwanger kunnen zijn?",
                        "Gebruikt u de pil of andere hormonen?"
                    ]
                }
            }
        };
    }

    initializeUrgencyIndicators() {
        return {
            immediate: {
                keywords: ["plotseling", "acuut", "ineens", "heel erg", "ondraaglijk", "kan niet meer"],
                symptoms: ["chest_pain_with_radiation", "severe_shortness_of_breath", "loss_of_consciousness"],
                message: "Deze klachten vereisen onmiddellijke medische aandacht. Bel 112 of ga naar de spoedeisende hulp."
            },
            
            urgent: {
                keywords: ["erger geworden", "steeds meer", "niet meer normaal", "heel bezorgd"],
                symptoms: ["persistent_chest_pain", "high_fever", "severe_headache"],
                message: "Deze klachten moeten vandaag nog bekeken worden. Neem contact op met uw huisarts."
            },
            
            routine: {
                keywords: ["soms", "af en toe", "licht", "mild"],
                symptoms: ["mild_headache", "occasional_cough", "minor_fatigue"],
                message: "Deze klachten kunnen in de komende dagen besproken worden met uw huisarts."
            }
        };
    }

    initializeDutchTerms() {
        return {
            // Body parts
            bodyParts: {
                "hoofd": "head",
                "nek": "neck", 
                "schouder": "shoulder",
                "arm": "arm",
                "hand": "hand",
                "borst": "chest",
                "rug": "back",
                "buik": "abdomen",
                "been": "leg",
                "voet": "foot"
            },
            
            // Pain descriptors
            painDescriptors: {
                "stekend": "stabbing",
                "drukkend": "pressing",
                "brandend": "burning",
                "kloppend": "throbbing",
                "krampend": "cramping",
                "scherp": "sharp",
                "dof": "dull"
            },
            
            // Severity indicators
            severity: {
                "mild": ["licht", "een beetje", "niet zo erg"],
                "moderate": ["matig", "behoorlijk", "redelijk"],
                "severe": ["erg", "heel erg", "verschrikkelijk", "ondraaglijk"]
            },
            
            // Timing indicators
            timing: {
                "acute": ["plotseling", "ineens", "acuut"],
                "chronic": ["al lang", "maanden", "jaren", "altijd"],
                "intermittent": ["af en toe", "soms", "komt en gaat"]
            }
        };
    }

    // Methods for intelligent question generation
    analyzeResponse(response) {
        const analysis = {
            symptoms: this.extractSymptoms(response),
            severity: this.extractSeverity(response),
            timing: this.extractTiming(response),
            location: this.extractLocation(response),
            urgency: this.assessUrgency(response),
            emotion: this.detectEmotion(response),
            confidence: this.calculateConfidence(response)
        };
        
        return analysis;
    }

    extractSymptoms(text) {
        const detectedSymptoms = [];
        const lowerText = text.toLowerCase();
        
        for (const [symptomKey, symptomData] of Object.entries(this.symptoms)) {
            for (const dutchTerm of symptomData.dutch) {
                if (lowerText.includes(dutchTerm.toLowerCase())) {
                    detectedSymptoms.push({
                        key: symptomKey,
                        term: dutchTerm,
                        data: symptomData
                    });
                }
            }
        }
        
        return detectedSymptoms;
    }

    extractSeverity(text) {
        const lowerText = text.toLowerCase();
        
        for (const [level, indicators] of Object.entries(this.dutchMedicalTerms.severity)) {
            for (const indicator of indicators) {
                if (lowerText.includes(indicator)) {
                    return level;
                }
            }
        }
        
        return "unknown";
    }

    extractTiming(text) {
        const lowerText = text.toLowerCase();
        
        for (const [timing, indicators] of Object.entries(this.dutchMedicalTerms.timing)) {
            for (const indicator of indicators) {
                if (lowerText.includes(indicator)) {
                    return timing;
                }
            }
        }
        
        return "unknown";
    }

    extractLocation(text) {
        const lowerText = text.toLowerCase();
        const locations = [];
        
        for (const [dutch, english] of Object.entries(this.dutchMedicalTerms.bodyParts)) {
            if (lowerText.includes(dutch)) {
                locations.push({dutch, english});
            }
        }
        
        return locations;
    }

    assessUrgency(text) {
        const lowerText = text.toLowerCase();
        
        // Check for immediate urgency indicators
        for (const keyword of this.urgencyIndicators.immediate.keywords) {
            if (lowerText.includes(keyword)) {
                return "immediate";
            }
        }
        
        // Check for urgent indicators
        for (const keyword of this.urgencyIndicators.urgent.keywords) {
            if (lowerText.includes(keyword)) {
                return "urgent";
            }
        }
        
        // Check for routine indicators
        for (const keyword of this.urgencyIndicators.routine.keywords) {
            if (lowerText.includes(keyword)) {
                return "routine";
            }
        }
        
        return "unknown";
    }

    detectEmotion(text) {
        const lowerText = text.toLowerCase();
        const emotions = {};
        
        const emotionIndicators = {
            anxiety: ["bang", "bezorgd", "ongerust", "nerveus", "stress", "paniek"],
            pain: ["pijn", "zeer", "ondraaglijk", "hevig", "verschrikkelijk"],
            frustration: ["boos", "geïrriteerd", "gefrustreerd", "vervelend"],
            sadness: ["verdrietig", "down", "depressief", "somber"]
        };
        
        for (const [emotion, indicators] of Object.entries(emotionIndicators)) {
            emotions[emotion] = indicators.some(indicator => lowerText.includes(indicator));
        }
        
        return emotions;
    }

    calculateConfidence(text) {
        let confidence = 0.5; // Base confidence
        
        // Increase confidence for specific medical terms
        const symptoms = this.extractSymptoms(text);
        if (symptoms.length > 0) confidence += 0.2;
        
        // Increase confidence for clear severity indicators
        const severity = this.extractSeverity(text);
        if (severity !== "unknown") confidence += 0.1;
        
        // Increase confidence for timing information
        const timing = this.extractTiming(text);
        if (timing !== "unknown") confidence += 0.1;
        
        // Decrease confidence for very short responses
        if (text.length < 10) confidence -= 0.2;
        
        // Decrease confidence for unclear responses
        const unclearIndicators = ["weet niet", "misschien", "denk ik", "niet zeker"];
        if (unclearIndicators.some(indicator => text.toLowerCase().includes(indicator))) {
            confidence -= 0.2;
        }
        
        return Math.max(0, Math.min(1, confidence));
    }

    generateFollowUpQuestion(symptom, conversationHistory) {
        const symptomData = this.symptoms[symptom.key];
        if (!symptomData) return null;
        
        // Check which SOCRATES elements haven't been explored
        const unexploredAspects = this.getUnexploredSOCRATES(symptom.key, conversationHistory);
        
        if (unexploredAspects.length > 0) {
            // Return highest priority unexplored aspect
            const priorityAspect = this.prioritizeSOCRATESAspects(unexploredAspects, symptom);
            return symptomData.socrates[priorityAspect];
        }
        
        // If SOCRATES is complete, check for red flags
        return this.checkRedFlags(symptom, conversationHistory);
    }

    getUnexploredSOCRATES(symptomKey, conversationHistory) {
        const socratesAspects = ['site', 'onset', 'character', 'radiation', 'associations', 'timing', 'exacerbating', 'severity'];
        const exploredAspects = new Set();
        
        // Analyze conversation history to see what's been explored
        for (const exchange of conversationHistory) {
            const analysis = this.analyzeResponse(exchange.answer);
            // Logic to determine which SOCRATES aspects have been covered
            // This would be more sophisticated in a real implementation
        }
        
        return socratesAspects.filter(aspect => !exploredAspects.has(aspect));
    }

    prioritizeSOCRATESAspects(aspects, symptom) {
        // Priority order based on medical importance
        const priorityOrder = {
            'severity': 10,
            'onset': 9,
            'character': 8,
            'site': 7,
            'radiation': 6,
            'associations': 5,
            'timing': 4,
            'exacerbating': 3
        };
        
        return aspects.sort((a, b) => (priorityOrder[b] || 0) - (priorityOrder[a] || 0))[0];
    }

    checkRedFlags(symptom, conversationHistory) {
        const symptomData = this.symptoms[symptom.key];
        
        for (const redFlag of symptomData.redFlags) {
            if (!this.hasBeenAsked(redFlag, conversationHistory)) {
                return this.getRedFlagQuestion(redFlag, symptom.key);
            }
        }
        
        return null;
    }

    getRedFlagQuestion(redFlag, symptomKey) {
        const redFlagQuestions = {
            "left_arm_radiation": "Straalt de pijn uit naar uw linkerarm?",
            "jaw_pain": "Heeft u ook pijn in uw kaak?",
            "shortness_of_breath": "Bent u ook kortademig?",
            "sweating": "Zweet u ook?",
            "nausea": "Heeft u ook misselijkheid?",
            "sudden_onset": "Kwam de pijn plotseling opzetten?",
            "worst_headache_ever": "Is dit de ergste hoofdpijn die u ooit heeft gehad?",
            "vision_changes": "Heeft u problemen met uw zicht?",
            "neck_stiffness": "Is uw nek stijf?"
        };
        
        return redFlagQuestions[redFlag] || `Heeft u ook ${redFlag}?`;
    }

    hasBeenAsked(topic, conversationHistory) {
        // Check if a topic has already been explored in the conversation
        // This would involve more sophisticated NLP in a real implementation
        return conversationHistory.some(exchange => 
            exchange.question.toLowerCase().includes(topic.toLowerCase())
        );
    }

    getEmpatheticResponse(emotion) {
        if (emotion.anxiety) {
            return "Ik begrijp dat dit zorgen baart. Laten we dit stap voor stap doorlopen.";
        }
        
        if (emotion.pain) {
            return "Dat moet erg vervelend voor u zijn. Ik ga u helpen dit goed in kaart te brengen.";
        }
        
        if (emotion.frustration) {
            return "Ik begrijp uw frustratie. Laten we proberen dit samen uit te zoeken.";
        }
        
        if (emotion.sadness) {
            return "Ik merk dat dit moeilijk voor u is. Neemt u de tijd die u nodig heeft.";
        }
        
        return null;
    }

    getUrgencyMessage(urgencyLevel) {
        return this.urgencyIndicators[urgencyLevel]?.message || "";
    }
}

// Export for use in other modules
window.MedicalKnowledge = MedicalKnowledge;

