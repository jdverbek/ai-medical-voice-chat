// Enhanced Medical Knowledge Base for Cardiology-Specialized AI Medical Assistant

class EnhancedMedicalKnowledge {
    constructor() {
        this.symptoms = this.initializeCardiologySymptoms();
        this.conversationPatterns = this.initializeCardiologyConversationPatterns();
        this.medicalCategories = this.initializeCardiologyCategories();
        this.followUpRules = this.initializeCardiologyFollowUpRules();
        this.urgencyIndicators = this.initializeCardiologyUrgencyIndicators();
        this.dutchMedicalTerms = this.initializeDutchCardiologyTerms();
        this.riskFactorAssessment = this.initializeRiskFactorAssessment();
        this.functionalClassification = this.initializeFunctionalClassification();
        this.diagnosticCriteria = this.initializeDiagnosticCriteria();
    }

    initializeCardiologySymptoms() {
        return {
            // Primary cardiac symptoms
            "chest_pain": {
                dutch: ["borstpijn", "pijn op de borst", "druk op de borst", "beklemming", "pijn in de borst", "drukkend gevoel"],
                followUpQuestions: [
                    "Waar precies voelt u de pijn op uw borst? Links, rechts, of in het midden?",
                    "Straalt de pijn uit naar uw linkerarm, nek, kaak, of rug?",
                    "Hoe zou u de pijn beschrijven? Drukkend, stekend, brandend, of knijpend?",
                    "Krijgt u de pijn bij inspanning, emotionele stress, of ook in rust?",
                    "Hoe lang duurt de pijn meestal? Seconden, minuten, of uren?",
                    "Op een schaal van 1 tot 10, hoe erg is de pijn op zijn ergst?",
                    "Wat helpt tegen de pijn? Rust, nitraat, of niets?",
                    "Heeft u ook kortademigheid, zweten, misselijkheid, of duizeligheid?",
                    "Is de pijn erger geworden de laatste tijd?",
                    "Heeft u de pijn ook 's nachts of vroeg in de ochtend?"
                ],
                redFlags: [
                    "left_arm_radiation", "jaw_pain", "shortness_of_breath", "sweating", 
                    "nausea", "sudden_onset", "crushing_pain", "rest_pain", "nocturnal_pain"
                ],
                relatedSymptoms: ["shortness_of_breath", "nausea", "dizziness", "sweating", "fatigue", "palpitations"],
                urgencyLevel: "high",
                category: "cardiovascular",
                nyhaClass: "assess_functional_capacity",
                socrates: {
                    site: "Kunt u precies aanwijzen waar de pijn zit? Gebruikt u één vinger of uw hele hand?",
                    onset: "Wanneer begon de pijn? Plotseling tijdens inspanning of geleidelijk?",
                    character: "Hoe voelt de pijn? Drukkend als een olifant op uw borst, stekend, of brandend?",
                    radiation: "Straalt de pijn uit naar uw linkerarm, beide armen, nek, kaak, of tussen uw schouderbladen?",
                    associations: "Heeft u ook kortademigheid, zweten, misselijkheid, duizeligheid, of hartkloppingen?",
                    timing: "Wanneer heeft u de pijn? Bij inspanning, emoties, eten, of ook in rust?",
                    exacerbating: "Wat maakt de pijn erger? Inspanning, stress, kou, of bepaalde bewegingen?",
                    severity: "Op een schaal van 1 tot 10, waarbij 10 de ergste pijn is die u zich kunt voorstellen?"
                }
            },

            "shortness_of_breath": {
                dutch: ["kortademig", "benauwd", "moeilijk ademen", "buiten adem", "dyspnoe", "ademhalingsmoeilijkheden"],
                followUpQuestions: [
                    "Wanneer bent u kortademig? Bij lopen, traplopen, of ook in rust?",
                    "Hoeveel trappen kunt u lopen zonder kortademig te worden?",
                    "Wordt u wakker 's nachts door kortademigheid?",
                    "Moet u extra kussens gebruiken om te kunnen slapen?",
                    "Wordt de kortademigheid erger als u plat ligt?",
                    "Hoe lang heeft u al last van kortademigheid?",
                    "Is de kortademigheid plotseling ontstaan of geleidelijk erger geworden?",
                    "Heeft u ook pijn op de borst bij de kortademigheid?",
                    "Heeft u gezwollen enkels, benen, of buik?",
                    "Hoest u ook? En zo ja, hoest u schuim of bloed op?"
                ],
                redFlags: [
                    "rest_dyspnea", "orthopnea", "paroxysmal_nocturnal_dyspnea", 
                    "acute_onset", "hemoptysis", "chest_pain"
                ],
                relatedSymptoms: ["chest_pain", "cough", "fatigue", "leg_swelling", "orthopnea"],
                urgencyLevel: "high",
                category: "respiratory",
                nyhaClass: "assess_functional_capacity"
            },

            "palpitations": {
                dutch: ["hartkloppingen", "bonzend hart", "onregelmatige hartslag", "hart slaat over", "hartritmestoornis"],
                followUpQuestions: [
                    "Hoe voelen de hartkloppingen? Snel, onregelmatig, of bonzend?",
                    "Hoe lang duren de hartkloppingen meestal?",
                    "Begint en stopt het plotseling, of geleidelijk?",
                    "Kunt u de hartslag kloppen op tafel zoals u het voelt?",
                    "Krijgt u de hartkloppingen bij inspanning, stress, of ook in rust?",
                    "Heeft u ook duizeligheid, flauwvallen, of bijna flauwvallen?",
                    "Heeft u pijn op de borst tijdens de hartkloppingen?",
                    "Gebruikt u cafeïne, alcohol, of andere stimulerende middelen?",
                    "Heeft u schildklierproblemen?",
                    "Neemt u medicijnen die het hartritme kunnen beïnvloeden?"
                ],
                redFlags: [
                    "syncope", "presyncope", "chest_pain", "sudden_onset", 
                    "sustained_tachycardia", "irregular_rhythm"
                ],
                relatedSymptoms: ["dizziness", "syncope", "chest_pain", "shortness_of_breath"],
                urgencyLevel: "medium",
                category: "cardiovascular"
            },

            "syncope": {
                dutch: ["flauwvallen", "bewustzijnsverlies", "wegzakken", "black-out", "syncope"],
                followUpQuestions: [
                    "Hoe vaak bent u flauwgevallen de laatste tijd?",
                    "Wat deed u vlak voordat u flauwviel?",
                    "Had u waarschuwingssignalen zoals duizeligheid of misselijkheid?",
                    "Hoe lang was u bewusteloos?",
                    "Heeft u zich bezeerd bij het vallen?",
                    "Heeft u uw tong gebeten of uzelf nat gemaakt?",
                    "Voelde u zich verward na het bijkomen?",
                    "Heeft u hartkloppingen gehad voor het flauwvallen?",
                    "Gebeurde het bij opstaan, hoesten, of inspanning?",
                    "Neemt u medicijnen voor bloeddruk of hartproblemen?"
                ],
                redFlags: [
                    "exertional_syncope", "cardiac_syncope", "sudden_death_family_history",
                    "no_prodrome", "injury_from_fall"
                ],
                relatedSymptoms: ["palpitations", "chest_pain", "dizziness"],
                urgencyLevel: "high",
                category: "cardiovascular"
            },

            "leg_swelling": {
                dutch: ["gezwollen benen", "dikke enkels", "oedeem", "vocht vasthouden", "opgezette voeten"],
                followUpQuestions: [
                    "Zijn beide benen gezwollen of alleen één been?",
                    "Is de zwelling erger aan het eind van de dag?",
                    "Blijft er een kuiltje achter als u op de zwelling drukt?",
                    "Hoe lang heeft u al gezwollen benen?",
                    "Is uw buik ook opgezet?",
                    "Bent u de laatste tijd aangekomen?",
                    "Plast u minder dan normaal?",
                    "Heeft u ook kortademigheid, vooral 's nachts?",
                    "Neemt u medicijnen voor uw hart of bloeddruk?",
                    "Heeft u problemen met uw nieren of lever?"
                ],
                redFlags: [
                    "bilateral_swelling", "rapid_onset", "shortness_of_breath",
                    "weight_gain", "decreased_urine_output"
                ],
                relatedSymptoms: ["shortness_of_breath", "fatigue", "weight_gain"],
                urgencyLevel: "medium",
                category: "cardiovascular"
            },

            "fatigue": {
                dutch: ["moeheid", "vermoeidheid", "uitputting", "geen energie", "slap gevoel"],
                followUpQuestions: [
                    "Hoe lang heeft u al last van vermoeidheid?",
                    "Is de vermoeidheid erger geworden de laatste tijd?",
                    "Wordt u moe van activiteiten die u vroeger makkelijk kon?",
                    "Helpt rust tegen de vermoeidheid?",
                    "Heeft u ook kortademigheid bij inspanning?",
                    "Slaapt u goed 's nachts?",
                    "Heeft u gewicht verloren of juist aangekomen?",
                    "Heeft u koorts gehad?",
                    "Neemt u medicijnen die vermoeidheid kunnen veroorzaken?",
                    "Heeft u stress of emotionele problemen?"
                ],
                redFlags: [
                    "progressive_fatigue", "exercise_intolerance", "weight_loss",
                    "night_sweats", "fever"
                ],
                relatedSymptoms: ["shortness_of_breath", "chest_pain", "weight_loss"],
                urgencyLevel: "low",
                category: "general"
            }
        };
    }

    initializeCardiologyConversationPatterns() {
        return {
            cardiologyOpening: [
                "Welkom bij de cardiologische anamnese. Ik ga u uitgebreide vragen stellen over uw hart en bloedvaten. Wat is uw hoofdklacht vandaag?",
                "Goedemorgen! Ik ben uw AI cardioloog assistent. Laten we beginnen met uw hartklachten. Wat brengt u vandaag naar de cardioloog?",
                "Hallo! Ik ga een volledige cardiologische anamnese met u doorlopen. Dit helpt uw cardioloog bij de diagnose. Wat is uw belangrijkste hartklacht?"
            ],
            
            riskFactorIntroduction: [
                "Nu ga ik u vragen stellen over risicofactoren voor hartproblemen.",
                "Laten we uw cardiovasculaire risicofactoren bespreken.",
                "Voor een complete beoordeling wil ik graag uw risicofactoren doorlopen."
            ],
            
            familyHistoryIntroduction: [
                "Familiegeschiedenis is belangrijk voor hartproblemen. Laten we dit bespreken.",
                "Nu wil ik graag weten of er hartproblemen in uw familie voorkomen.",
                "Erfelijkheid speelt een rol bij hartaandoeningen. Vertel me over uw familie."
            ],
            
            functionalAssessment: [
                "Ik ga nu vragen over uw dagelijkse activiteiten en inspanningstolerantie.",
                "Laten we bespreken hoe uw klachten uw dagelijks leven beïnvloeden.",
                "Voor de functionele beoordeling wil ik weten wat u nog wel en niet kunt."
            ],
            
            medicationReview: [
                "Nu gaan we uw medicijnen doorlopen, vooral die voor hart en bloedvaten.",
                "Vertel me over alle medicijnen die u gebruikt, inclusief vrij verkrijgbare.",
                "Een medicatie-overzicht is essentieel voor de cardiologische beoordeling."
            ],
            
            clarification: [
                "Kunt u dat wat meer uitleggen voor de cardiologische beoordeling?",
                "Dat is belangrijke informatie. Kunt u daar meer details over geven?",
                "Voor een nauwkeurige diagnose heb ik meer specifieke informatie nodig.",
                "Kunt u dat anders formuleren? Elke detail is belangrijk voor uw cardioloog."
            ],
            
            empathy: [
                "Hartklachten kunnen erg beangstigend zijn. Ik begrijp uw zorgen.",
                "Het is verstandig dat u deze klachten laat onderzoeken.",
                "Dank u voor deze openhartige informatie. Dit helpt uw cardioloog enorm.",
                "Ik begrijp dat dit moeilijk is om te bespreken."
            ],
            
            urgency: [
                "Deze klachten vereisen snelle cardiologische evaluatie.",
                "Ik raad u aan om vandaag nog contact op te nemen met uw cardioloog.",
                "Deze symptomen kunnen wijzen op een ernstige hartaandoening.",
                "Dit verdient onmiddellijke medische aandacht."
            ],
            
            phaseTransitions: {
                toRiskFactors: "Nu ga ik u vragen over risicofactoren voor hartproblemen zoals roken, diabetes, en hoge bloeddruk.",
                toFamilyHistory: "Laten we het nu hebben over hartproblemen in uw familie.",
                toMedications: "Vertel me nu over alle medicijnen die u gebruikt.",
                toFunctionalAssessment: "Ik wil graag weten hoe deze klachten uw dagelijks leven beïnvloeden.",
                toReviewOfSystems: "Tot slot ga ik nog enkele aanvullende vragen stellen."
            }
        };
    }

    initializeCardiologyCategories() {
        return {
            "chief_complaint": {
                name: "Hoofdklacht",
                questions: [
                    "Wat is uw hoofdklacht vandaag?",
                    "Wat brengt u naar de cardioloog?",
                    "Welke hartklachten heeft u?"
                ],
                priority: 10
            },
            
            "cardiac_symptoms": {
                name: "Cardiale Symptomen",
                questions: [
                    "Heeft u pijn op de borst?",
                    "Bent u kortademig?",
                    "Heeft u hartkloppingen?",
                    "Bent u wel eens flauwgevallen?",
                    "Heeft u gezwollen benen of enkels?"
                ],
                priority: 9
            },
            
            "functional_capacity": {
                name: "Functionele Capaciteit",
                questions: [
                    "Hoeveel trappen kunt u lopen zonder kortademig te worden?",
                    "Kunt u nog normaal wandelen?",
                    "Moet u stoppen tijdens het lopen vanwege klachten?",
                    "Kunt u nog sporten of zware klussen doen?",
                    "Hoe beïnvloeden uw klachten uw dagelijks leven?"
                ],
                priority: 8
            },
            
            "risk_factors": {
                name: "Risicofactoren",
                questions: [
                    "Rookt u of heeft u gerookt?",
                    "Heeft u diabetes?",
                    "Heeft u hoge bloeddruk?",
                    "Heeft u hoog cholesterol?",
                    "Heeft u overgewicht?",
                    "Sport u regelmatig?",
                    "Heeft u veel stress?"
                ],
                priority: 7
            },
            
            "family_history": {
                name: "Familiegeschiedenis",
                questions: [
                    "Heeft uw vader of moeder hartproblemen gehad?",
                    "Zijn er familieleden jong overleden aan een hartinfarct?",
                    "Komt hoge bloeddruk voor in uw familie?",
                    "Heeft iemand in uw familie een plotse hartdood gehad?",
                    "Komen er aangeboren hartafwijkingen voor in uw familie?"
                ],
                priority: 6
            },
            
            "medications": {
                name: "Medicatie",
                questions: [
                    "Welke medicijnen gebruikt u voor uw hart?",
                    "Gebruikt u bloedverdunners?",
                    "Neemt u medicijnen voor hoge bloeddruk?",
                    "Gebruikt u cholesterolverlagers?",
                    "Heeft u allergieën voor medicijnen?",
                    "Gebruikt u vrij verkrijgbare medicijnen of supplementen?"
                ],
                priority: 5
            },
            
            "previous_cardiac_events": {
                name: "Eerdere Hartproblemen",
                questions: [
                    "Heeft u ooit een hartinfarct gehad?",
                    "Bent u wel eens opgenomen voor hartproblemen?",
                    "Heeft u een hartkatheterisatie ondergaan?",
                    "Heeft u stents of bypasses?",
                    "Heeft u een pacemaker of ICD?",
                    "Bent u ooit geopereerd aan uw hart?"
                ],
                priority: 4
            },
            
            "lifestyle_factors": {
                name: "Leefstijlfactoren",
                questions: [
                    "Hoeveel alcohol drinkt u per week?",
                    "Gebruikt u drugs of stimulerende middelen?",
                    "Hoe is uw voedingspatroon?",
                    "Hoeveel zout gebruikt u?",
                    "Slaapt u goed?",
                    "Heeft u veel stress in uw leven?"
                ],
                priority: 3
            },
            
            "review_of_systems": {
                name: "Systeem Review",
                questions: [
                    "Heeft u hoofdpijn of duizeligheid?",
                    "Heeft u problemen met uw zicht?",
                    "Heeft u buikpijn of spijsverteringsproblemen?",
                    "Heeft u problemen met plassen?",
                    "Heeft u gewichtsveranderingen?",
                    "Heeft u koorts of nachtzweten gehad?"
                ],
                priority: 2
            }
        };
    }

    initializeRiskFactorAssessment() {
        return {
            modifiableRiskFactors: {
                smoking: {
                    questions: [
                        "Rookt u momenteel?",
                        "Hoeveel sigaretten per dag?",
                        "Hoe lang rookt u al?",
                        "Heeft u ooit geprobeerd te stoppen?",
                        "Rookt u ook pijp, sigaren, of e-sigaretten?"
                    ],
                    riskWeight: 3,
                    urgency: "high"
                },
                
                hypertension: {
                    questions: [
                        "Heeft u hoge bloeddruk?",
                        "Wanneer werd dit vastgesteld?",
                        "Wat zijn uw laatste bloeddrukwaarden?",
                        "Neemt u medicijnen voor hoge bloeddruk?",
                        "Meet u thuis uw bloeddruk?"
                    ],
                    riskWeight: 2,
                    urgency: "medium"
                },
                
                diabetes: {
                    questions: [
                        "Heeft u diabetes (suikerziekte)?",
                        "Type 1 of type 2 diabetes?",
                        "Wanneer werd dit vastgesteld?",
                        "Hoe wordt uw diabetes behandeld?",
                        "Wat zijn uw laatste HbA1c waarden?"
                    ],
                    riskWeight: 2,
                    urgency: "medium"
                },
                
                dyslipidemia: {
                    questions: [
                        "Heeft u hoog cholesterol?",
                        "Wat waren uw laatste cholesterolwaarden?",
                        "Neemt u cholesterolverlagers?",
                        "Volgt u een cholesterolarm dieet?",
                        "Wanneer is uw cholesterol voor het laatst gecontroleerd?"
                    ],
                    riskWeight: 2,
                    urgency: "low"
                },
                
                obesity: {
                    questions: [
                        "Wat is uw lengte en gewicht?",
                        "Bent u de laatste tijd aangekomen?",
                        "Heeft u ooit veel gewicht verloren?",
                        "Volgt u een dieet?",
                        "Heeft u hulp gehad bij gewichtsverlies?"
                    ],
                    riskWeight: 1,
                    urgency: "low"
                },
                
                physicalInactivity: {
                    questions: [
                        "Sport u regelmatig?",
                        "Hoeveel beweging krijgt u per week?",
                        "Wat voor soort beweging doet u?",
                        "Bent u minder actief geworden door uw klachten?",
                        "Heeft u een zittend beroep?"
                    ],
                    riskWeight: 1,
                    urgency: "low"
                },
                
                stress: {
                    questions: [
                        "Heeft u veel stress in uw leven?",
                        "Wat zijn de belangrijkste stressfactoren?",
                        "Hoe gaat u om met stress?",
                        "Heeft u hulp gehad voor stress of depressie?",
                        "Beïnvloedt stress uw hartklachten?"
                    ],
                    riskWeight: 1,
                    urgency: "low"
                }
            },
            
            nonModifiableRiskFactors: {
                age: {
                    questions: [
                        "Wat is uw geboortedatum?",
                        "Bent u na de menopauze? (voor vrouwen)"
                    ],
                    riskThresholds: {
                        male: 45,
                        female: 55
                    }
                },
                
                gender: {
                    questions: [
                        "Wat is uw geslacht?",
                        "Gebruikt u hormoonvervanging? (voor vrouwen)"
                    ]
                },
                
                familyHistory: {
                    questions: [
                        "Heeft uw vader voor zijn 55e een hartinfarct gehad?",
                        "Heeft uw moeder voor haar 65e een hartinfarct gehad?",
                        "Zijn er familieleden jong overleden aan hartproblemen?",
                        "Komen er aangeboren hartafwijkingen voor in uw familie?",
                        "Heeft iemand in uw familie plotse hartdood gehad?"
                    ],
                    riskWeight: 2
                }
            }
        };
    }

    initializeFunctionalClassification() {
        return {
            nyhaClass: {
                classI: {
                    description: "Geen beperking van fysieke activiteit",
                    questions: [
                        "Kunt u nog alle normale activiteiten doen zonder klachten?",
                        "Heeft u geen kortademigheid bij normale inspanning?"
                    ]
                },
                classII: {
                    description: "Lichte beperking van fysieke activiteit",
                    questions: [
                        "Krijgt u klachten bij zware inspanning?",
                        "Kunt u nog trappen lopen zonder te stoppen?",
                        "Bent u kortademig bij sneller lopen?"
                    ]
                },
                classIII: {
                    description: "Duidelijke beperking van fysieke activiteit",
                    questions: [
                        "Krijgt u al klachten bij lichte inspanning?",
                        "Moet u stoppen tijdens het lopen?",
                        "Kunt u nog één trap lopen zonder klachten?"
                    ]
                },
                classIV: {
                    description: "Klachten bij elke fysieke activiteit of in rust",
                    questions: [
                        "Heeft u klachten bij de minste inspanning?",
                        "Heeft u ook klachten in rust?",
                        "Bent u kortademig bij aankleden of wassen?"
                    ]
                }
            },
            
            ccsClass: {
                classI: {
                    description: "Geen angina bij normale activiteit",
                    questions: [
                        "Heeft u geen pijn op de borst bij normale activiteiten?",
                        "Krijgt u alleen pijn bij zeer zware inspanning?"
                    ]
                },
                classII: {
                    description: "Lichte beperking door angina",
                    questions: [
                        "Krijgt u pijn bij sneller lopen of traplopen?",
                        "Heeft u pijn bij lopen in de kou of wind?",
                        "Krijgt u pijn bij emotionele stress?"
                    ]
                },
                classIII: {
                    description: "Duidelijke beperking door angina",
                    questions: [
                        "Krijgt u pijn bij normaal lopen?",
                        "Kunt u minder dan 100 meter lopen zonder pijn?",
                        "Moet u stoppen tijdens het lopen vanwege pijn?"
                    ]
                },
                classIV: {
                    description: "Angina bij minimale inspanning of rust",
                    questions: [
                        "Heeft u pijn bij de minste inspanning?",
                        "Heeft u ook pijn in rust?",
                        "Kunt u niet meer normaal functioneren door de pijn?"
                    ]
                }
            }
        };
    }

    initializeDiagnosticCriteria() {
        return {
            acuteCoronarySyndrome: {
                criteria: [
                    "chest_pain_with_radiation",
                    "shortness_of_breath",
                    "sweating",
                    "nausea",
                    "sudden_onset"
                ],
                urgency: "immediate"
            },
            
            heartFailure: {
                criteria: [
                    "shortness_of_breath",
                    "leg_swelling",
                    "fatigue",
                    "orthopnea",
                    "paroxysmal_nocturnal_dyspnea"
                ],
                urgency: "urgent"
            },
            
            arrhythmia: {
                criteria: [
                    "palpitations",
                    "irregular_rhythm",
                    "syncope",
                    "dizziness"
                ],
                urgency: "medium"
            }
        };
    }

    initializeCardiologyFollowUpRules() {
        return {
            symptomBasedRules: {
                "chest_pain": {
                    mandatoryFollowUps: [
                        "radiation_assessment",
                        "character_description",
                        "trigger_identification",
                        "severity_quantification",
                        "duration_assessment",
                        "associated_symptoms_check"
                    ],
                    conditionalFollowUps: {
                        "if_exertional": "Hoeveel inspanning is nodig om de pijn te krijgen?",
                        "if_radiation": "Straalt de pijn uit naar uw linkerarm, beide armen, nek, kaak, of rug?",
                        "if_severe": "Is de pijn zo erg dat u er niet doorheen kunt werken?",
                        "if_rest_pain": "Heeft u de pijn ook 's nachts of vroeg in de ochtend?"
                    }
                },
                
                "shortness_of_breath": {
                    mandatoryFollowUps: [
                        "exertion_tolerance_assessment",
                        "orthopnea_evaluation",
                        "pnd_assessment",
                        "functional_capacity_evaluation"
                    ]
                },
                
                "palpitations": {
                    mandatoryFollowUps: [
                        "rhythm_description",
                        "duration_assessment",
                        "trigger_identification",
                        "associated_symptoms_check"
                    ]
                }
            },
            
            riskFactorRules: {
                "high_risk_patient": {
                    additionalQuestions: [
                        "Heeft u ooit een stress-test gehad?",
                        "Wanneer was uw laatste ECG?",
                        "Heeft u ooit een echocardiogram gehad?",
                        "Neemt u aspirine ter preventie?"
                    ]
                }
            }
        };
    }

    initializeCardiologyUrgencyIndicators() {
        return {
            immediate: {
                keywords: [
                    "plotseling", "acuut", "ineens", "heel erg", "ondraaglijk", 
                    "kan niet meer", "erger dan ooit", "als een olifant op mijn borst",
                    "doodsangst", "ga dood"
                ],
                symptoms: [
                    "chest_pain_with_radiation", "severe_shortness_of_breath", 
                    "syncope_with_chest_pain", "acute_pulmonary_edema"
                ],
                combinations: [
                    ["chest_pain", "left_arm_radiation", "sweating"],
                    ["chest_pain", "shortness_of_breath", "nausea"],
                    ["syncope", "chest_pain"],
                    ["acute_shortness_of_breath", "pink_frothy_sputum"]
                ],
                message: "Deze klachten kunnen wijzen op een hartinfarct of andere levensbedreigende hartaandoening. Bel onmiddellijk 112 of ga naar de spoedeisende hulp."
            },
            
            urgent: {
                keywords: [
                    "erger geworden", "steeds meer", "niet meer normaal", 
                    "heel bezorgd", "bang voor mijn hart", "nieuwe klachten"
                ],
                symptoms: [
                    "progressive_chest_pain", "new_onset_dyspnea", 
                    "recurrent_syncope", "unstable_angina"
                ],
                combinations: [
                    ["chest_pain", "exertional"],
                    ["shortness_of_breath", "orthopnea"],
                    ["palpitations", "syncope"]
                ],
                message: "Deze klachten moeten vandaag nog door een cardioloog bekeken worden. Neem onmiddellijk contact op met uw cardioloog of huisarts."
            },
            
            routine: {
                keywords: [
                    "soms", "af en toe", "licht", "mild", "niet zo erg", 
                    "al langer", "stabiel", "niet veranderd"
                ],
                symptoms: [
                    "stable_angina", "mild_dyspnea", "occasional_palpitations"
                ],
                message: "Deze klachten kunnen binnen enkele dagen besproken worden met uw cardioloog."
            }
        };
    }

    initializeDutchCardiologyTerms() {
        return {
            // Cardiac-specific body parts
            cardiacAnatomy: {
                "hart": "heart",
                "borst": "chest",
                "borstkas": "thorax",
                "linkerarm": "left arm",
                "rechterarm": "right arm",
                "nek": "neck",
                "kaak": "jaw",
                "rug": "back",
                "schouderbladen": "shoulder blades"
            },
            
            // Cardiac pain descriptors
            cardiacPainDescriptors: {
                "drukkend": "pressing",
                "knijpend": "squeezing",
                "beklemming": "tightness",
                "brandend": "burning",
                "stekend": "stabbing",
                "scheurend": "tearing",
                "kloppend": "throbbing",
                "zwaar": "heavy"
            },
            
            // Cardiac severity indicators
            cardiacSeverity: {
                "mild": ["licht", "een beetje", "niet zo erg", "draaglijk"],
                "moderate": ["matig", "behoorlijk", "redelijk", "vervelend"],
                "severe": ["erg", "heel erg", "verschrikkelijk", "ondraaglijk", "als een olifant", "doodsangst"]
            },
            
            // Cardiac timing indicators
            cardiacTiming: {
                "acute": ["plotseling", "ineens", "acuut", "uit het niets"],
                "chronic": ["al lang", "maanden", "jaren", "altijd", "chronisch"],
                "intermittent": ["af en toe", "soms", "komt en gaat", "wisselend"],
                "progressive": ["erger geworden", "steeds meer", "toegenomen"]
            },
            
            // Functional capacity terms
            functionalTerms: {
                "excellent": ["alles", "normaal", "geen problemen", "zoals altijd"],
                "good": ["meeste dingen", "bijna alles", "weinig problemen"],
                "fair": ["beperkt", "minder", "niet meer alles", "voorzichtig"],
                "poor": ["weinig", "bijna niets", "heel beperkt", "alleen rust"]
            },
            
            // Risk factor terms
            riskFactorTerms: {
                "smoking": ["roken", "sigaretten", "tabak", "pijp", "sigaren"],
                "diabetes": ["suikerziekte", "diabetes", "suiker"],
                "hypertension": ["hoge bloeddruk", "bloeddruk", "hypertensie"],
                "cholesterol": ["cholesterol", "vet", "vetten"],
                "obesity": ["overgewicht", "dik", "zwaar", "obesitas"],
                "stress": ["stress", "spanning", "druk", "zorgen"]
            }
        };
    }

    // Enhanced analysis methods for cardiology
    analyzeResponse(response) {
        try {
            const analysis = {
                symptoms: this.extractCardiologySymptoms(response) || [],
                severity: this.extractCardiacSeverity(response) || "unknown",
                timing: this.extractCardiacTiming(response) || "unknown",
                location: this.extractCardiacLocation(response) || [],
                urgency: this.assessCardiacUrgency(response) || "routine",
                emotion: this.detectCardiacEmotion(response) || null,
                confidence: this.calculateCardiacConfidence(response) || 0.5,
                cardiacRiskFactors: this.extractRiskFactors(response) || [],
                functionalCapacity: this.assessFunctionalCapacity(response) || null,
                redFlags: this.identifyRedFlags(response) || []
            };
            
            return analysis;
        } catch (error) {
            console.warn('EnhancedMedicalKnowledge: Error in analyzeResponse, using fallback:', error);
            return {
                symptoms: [],
                severity: "unknown",
                timing: "unknown",
                location: [],
                urgency: "routine",
                emotion: null,
                confidence: 0.5,
                cardiacRiskFactors: [],
                functionalCapacity: null,
                redFlags: []
            };
        }
    }

    extractCardiologySymptoms(text) {
        const detectedSymptoms = [];
        const lowerText = text.toLowerCase();
        
        for (const [symptomKey, symptomData] of Object.entries(this.symptoms)) {
            if (symptomData && symptomData.dutch) {
                for (const dutchTerm of symptomData.dutch) {
                    if (lowerText.includes(dutchTerm.toLowerCase())) {
                        detectedSymptoms.push({
                            key: symptomKey,
                            term: dutchTerm,
                            data: symptomData,
                            confidence: this.calculateSymptomConfidence(lowerText, dutchTerm)
                        });
                    }
                }
            }
        }
        
        return detectedSymptoms;
    }

    extractRiskFactors(text) {
        const riskFactors = [];
        const lowerText = text.toLowerCase();
        
        for (const [factorType, factorData] of Object.entries(this.riskFactorAssessment.modifiableRiskFactors)) {
            const terms = this.dutchMedicalTerms.riskFactorTerms[factorType] || [];
            
            for (const term of terms) {
                if (lowerText.includes(term)) {
                    riskFactors.push({
                        type: factorType,
                        value: this.extractRiskFactorValue(lowerText, term),
                        confidence: this.calculateRiskFactorConfidence(lowerText, term)
                    });
                }
            }
        }
        
        return riskFactors;
    }

    assessFunctionalCapacity(text) {
        const lowerText = text.toLowerCase();
        
        // NYHA Class assessment based on text
        if (lowerText.includes('alles') || lowerText.includes('normaal')) {
            return { nyhaClass: 'I', description: 'Geen beperking' };
        } else if (lowerText.includes('trap') && lowerText.includes('kan')) {
            return { nyhaClass: 'II', description: 'Lichte beperking' };
        } else if (lowerText.includes('stoppen') || lowerText.includes('beperkt')) {
            return { nyhaClass: 'III', description: 'Duidelijke beperking' };
        } else if (lowerText.includes('rust') && (lowerText.includes('klachten') || lowerText.includes('kortademig'))) {
            return { nyhaClass: 'IV', description: 'Klachten in rust' };
        }
        
        return null;
    }

    identifyRedFlags(text) {
        const redFlags = [];
        const lowerText = text.toLowerCase();
        
        const redFlagIndicators = {
            "left_arm_radiation": ["linkerarm", "arm", "uitstraling"],
            "jaw_pain": ["kaak", "kaken"],
            "sudden_onset": ["plotseling", "ineens", "acuut"],
            "crushing_pain": ["olifant", "beklemming", "drukkend"],
            "rest_pain": ["rust", "s nachts", "liggen"],
            "sweating": ["zweten", "zweet", "transpireren"],
            "nausea": ["misselijk", "overgeven", "braken"],
            "syncope": ["flauwvallen", "bewusteloos", "wegzakken"]
        };
        
        for (const [flag, indicators] of Object.entries(redFlagIndicators)) {
            if (indicators.some(indicator => lowerText.includes(indicator))) {
                redFlags.push(flag);
            }
        }
        
        return redFlags;
    }

    assessCardiacUrgency(text) {
        const lowerText = text.toLowerCase();
        
        // Check for immediate urgency combinations
        const immediateIndicators = this.urgencyIndicators.immediate;
        
        // Check for keyword combinations
        for (const combination of immediateIndicators.combinations) {
            if (combination.every(symptom => 
                this.symptoms[symptom] && 
                this.symptoms[symptom].dutch.some(term => lowerText.includes(term.toLowerCase()))
            )) {
                return "immediate";
            }
        }
        
        // Check individual urgent keywords
        if (immediateIndicators.keywords.some(keyword => lowerText.includes(keyword))) {
            return "immediate";
        }
        
        // Check for urgent indicators
        const urgentIndicators = this.urgencyIndicators.urgent;
        if (urgentIndicators.keywords.some(keyword => lowerText.includes(keyword))) {
            return "urgent";
        }
        
        return "routine";
    }

    calculateCardiacConfidence(text) {
        let confidence = 0.5;
        
        const symptoms = this.extractCardiologySymptoms(text);
        if (symptoms.length > 0) confidence += 0.2;
        
        const redFlags = this.identifyRedFlags(text);
        if (redFlags.length > 0) confidence += 0.2;
        
        const riskFactors = this.extractRiskFactors(text);
        if (riskFactors.length > 0) confidence += 0.1;
        
        if (text.length > 50) confidence += 0.1;
        if (text.length < 10) confidence -= 0.2;
        
        return Math.max(0, Math.min(1, confidence));
    }

    // Helper methods
    calculateSymptomConfidence(text, term) {
        const termLength = term.length;
        const textLength = text.length;
        const baseConfidence = 0.7;
        
        // Increase confidence for longer, more specific terms
        if (termLength > 10) return Math.min(1, baseConfidence + 0.2);
        if (termLength > 5) return Math.min(1, baseConfidence + 0.1);
        
        return baseConfidence;
    }

    extractRiskFactorValue(text, term) {
        // Extract specific values for risk factors
        if (term === 'roken' || term === 'sigaretten') {
            const numberMatch = text.match(/(\d+)/);
            return numberMatch ? `${numberMatch[1]} per dag` : 'ja';
        }
        
        if (text.includes('niet') || text.includes('nee')) return 'nee';
        if (text.includes('ja') || text.includes('wel')) return 'ja';
        
        return 'onbekend';
    }

    calculateRiskFactorConfidence(text, term) {
        if (text.includes('ja') || text.includes('nee') || text.includes('niet')) {
            return 0.9;
        }
        return 0.6;
    }

    generateCardiologyFollowUpQuestion(symptom, conversationHistory) {
        const symptomData = this.symptoms[symptom.key];
        if (!symptomData) return null;
        
        // Get unasked follow-up questions
        const askedQuestions = conversationHistory.map(h => h.question || '').join(' ').toLowerCase();
        
        for (const question of symptomData.followUpQuestions) {
            const questionWords = question.toLowerCase().split(' ');
            const isAsked = questionWords.some(word => 
                word.length > 3 && askedQuestions.includes(word)
            );
            
            if (!isAsked) {
                return question;
            }
        }
        
        return null;
    }

    getCardiologyUrgencyMessage(urgencyLevel) {
        return this.urgencyIndicators[urgencyLevel]?.message || "";
    }

    detectCardiacEmotion(text) {
        const lowerText = text.toLowerCase();
        const emotions = {};
        
        const cardiacEmotionIndicators = {
            anxiety: ["bang", "bezorgd", "ongerust", "nerveus", "stress", "paniek", "doodsangst"],
            pain: ["pijn", "zeer", "ondraaglijk", "hevig", "verschrikkelijk", "olifant"],
            frustration: ["boos", "geïrriteerd", "gefrustreerd", "vervelend", "niet normaal"],
            fear: ["bang", "doodsangst", "ga dood", "hartinfarct", "sterven"]
        };
        
        for (const [emotion, indicators] of Object.entries(cardiacEmotionIndicators)) {
            emotions[emotion] = indicators.some(indicator => lowerText.includes(indicator));
        }
        
        return emotions;
    }
}

// Export for use in other modules
window.EnhancedMedicalKnowledge = EnhancedMedicalKnowledge;

