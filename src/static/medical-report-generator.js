// Professional Medical Report Generator for Cardiology Practice

class MedicalReportGenerator {
    constructor() {
        this.reportTemplates = this.initializeReportTemplates();
        this.formatters = this.initializeFormatters();
        this.validators = this.initializeValidators();
    }

    initializeReportTemplates() {
        return {
            cardiologyConsultation: {
                title: "Cardiologische Anamnese Rapport",
                sections: [
                    'patientInformation',
                    'chiefComplaint',
                    'historyOfPresentIllness',
                    'cardiacSymptoms',
                    'functionalAssessment',
                    'riskFactorAnalysis',
                    'medicationHistory',
                    'familyHistory',
                    'socialHistory',
                    'reviewOfSystems',
                    'clinicalImpression',
                    'recommendations',
                    'followUpPlan'
                ]
            },
            
            riskAssessment: {
                title: "Cardiovasculair Risico Assessment",
                sections: [
                    'patientInformation',
                    'riskFactorSummary',
                    'riskCalculation',
                    'riskStratification',
                    'recommendations'
                ]
            },
            
            functionalAssessment: {
                title: "Functionele Capaciteit Beoordeling",
                sections: [
                    'patientInformation',
                    'functionalHistory',
                    'nyhaClassification',
                    'ccsClassification',
                    'exerciseLimitations',
                    'recommendations'
                ]
            }
        };
    }

    initializeFormatters() {
        return {
            date: (date) => {
                return new Date(date).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            },
            
            time: (date) => {
                return new Date(date).toLocaleTimeString('nl-NL', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            },
            
            severity: (severity) => {
                const severityMap = {
                    'mild': 'Licht',
                    'moderate': 'Matig',
                    'severe': 'Ernstig',
                    'unknown': 'Niet gespecificeerd'
                };
                return severityMap[severity] || severity;
            },
            
            urgency: (urgency) => {
                const urgencyMap = {
                    'immediate': 'Onmiddellijk',
                    'urgent': 'Urgent',
                    'routine': 'Routine',
                    'none': 'Geen'
                };
                return urgencyMap[urgency] || urgency;
            },
            
            yesNo: (value) => {
                if (value === true || value === 'ja' || value === 'yes') return 'Ja';
                if (value === false || value === 'nee' || value === 'no') return 'Nee';
                return 'Onbekend';
            },
            
            riskLevel: (level) => {
                const riskMap = {
                    'low': 'Laag risico',
                    'moderate': 'Matig risico',
                    'high': 'Hoog risico',
                    'very_high': 'Zeer hoog risico'
                };
                return riskMap[level] || level;
            }
        };
    }

    initializeValidators() {
        return {
            requiredFields: [
                'patientInformation.name',
                'chiefComplaint',
                'conversationDate'
            ],
            
            validatePatientInfo: (patientInfo) => {
                const errors = [];
                if (!patientInfo.name) errors.push('Patiëntnaam ontbreekt');
                if (!patientInfo.age && !patientInfo.birthDate) errors.push('Leeftijd of geboortedatum ontbreekt');
                return errors;
            },
            
            validateSymptoms: (symptoms) => {
                const errors = [];
                if (!symptoms || symptoms.length === 0) {
                    errors.push('Geen symptomen gedocumenteerd');
                }
                return errors;
            }
        };
    }

    generateCardiologyReport(conversationData) {
        try {
            const reportData = this.processConversationData(conversationData);
            const report = this.buildCardiologyReport(reportData);
            
            return {
                success: true,
                report: report,
                metadata: {
                    generatedAt: new Date(),
                    reportType: 'cardiologyConsultation',
                    version: '1.0',
                    completeness: this.assessReportCompleteness(reportData)
                }
            };
        } catch (error) {
            console.error('Error generating cardiology report:', error);
            return {
                success: false,
                error: error.message,
                report: null
            };
        }
    }

    processConversationData(conversationData) {
        const summary = conversationData.generateCardiologySummary();
        const detailedReport = conversationData.generateDetailedMedicalReport();
        
        return {
            patientInformation: this.extractPatientInformation(summary, detailedReport),
            chiefComplaint: this.extractChiefComplaint(summary, detailedReport),
            cardiacSymptoms: this.extractCardiacSymptoms(summary, detailedReport),
            functionalAssessment: this.extractFunctionalAssessment(summary, detailedReport),
            riskFactors: this.extractRiskFactors(summary, detailedReport),
            medications: this.extractMedications(summary, detailedReport),
            familyHistory: this.extractFamilyHistory(summary, detailedReport),
            socialHistory: this.extractSocialHistory(summary, detailedReport),
            clinicalImpression: this.extractClinicalImpression(summary, detailedReport),
            recommendations: this.extractRecommendations(summary, detailedReport),
            conversationMetrics: summary.conversationQuality
        };
    }

    buildCardiologyReport(reportData) {
        const report = {
            header: this.generateReportHeader(reportData),
            sections: {}
        };

        const template = this.reportTemplates.cardiologyConsultation;
        
        for (const sectionName of template.sections) {
            report.sections[sectionName] = this.generateSection(sectionName, reportData);
        }

        return report;
    }

    generateReportHeader(reportData) {
        return {
            title: "CARDIOLOGISCHE ANAMNESE RAPPORT",
            subtitle: "Geautomatiseerde anamnese via AI Medische Assistent",
            patientName: reportData.patientInformation.name || "Niet gespecificeerd",
            reportDate: this.formatters.date(new Date()),
            reportTime: this.formatters.time(new Date()),
            generatedBy: "AI Medische Assistent - Cardiologie Module",
            version: "v2.0",
            confidentiality: "VERTROUWELIJK - Alleen voor medisch gebruik"
        };
    }

    generateSection(sectionName, reportData) {
        const sectionGenerators = {
            patientInformation: () => this.generatePatientInformationSection(reportData),
            chiefComplaint: () => this.generateChiefComplaintSection(reportData),
            historyOfPresentIllness: () => this.generateHistoryOfPresentIllnessSection(reportData),
            cardiacSymptoms: () => this.generateCardiacSymptomsSection(reportData),
            functionalAssessment: () => this.generateFunctionalAssessmentSection(reportData),
            riskFactorAnalysis: () => this.generateRiskFactorAnalysisSection(reportData),
            medicationHistory: () => this.generateMedicationHistorySection(reportData),
            familyHistory: () => this.generateFamilyHistorySection(reportData),
            socialHistory: () => this.generateSocialHistorySection(reportData),
            reviewOfSystems: () => this.generateReviewOfSystemsSection(reportData),
            clinicalImpression: () => this.generateClinicalImpressionSection(reportData),
            recommendations: () => this.generateRecommendationsSection(reportData),
            followUpPlan: () => this.generateFollowUpPlanSection(reportData)
        };

        const generator = sectionGenerators[sectionName];
        if (generator) {
            return generator();
        } else {
            return {
                title: sectionName.toUpperCase(),
                content: "Sectie niet geïmplementeerd",
                isEmpty: true
            };
        }
    }

    generatePatientInformationSection(reportData) {
        const patient = reportData.patientInformation;
        
        return {
            title: "PATIËNTGEGEVENS",
            content: {
                naam: patient.name || "Niet opgegeven",
                leeftijd: patient.age || "Niet opgegeven",
                geslacht: patient.gender || "Niet opgegeven",
                geboortedatum: patient.birthDate ? this.formatters.date(patient.birthDate) : "Niet opgegeven",
                contactgegevens: patient.contact || "Niet opgegeven",
                huisarts: patient.primaryPhysician || "Niet opgegeven",
                verzekering: patient.insurance || "Niet opgegeven"
            },
            isEmpty: !patient.name && !patient.age && !patient.gender
        };
    }

    generateChiefComplaintSection(reportData) {
        const complaint = reportData.chiefComplaint;
        
        return {
            title: "HOOFDKLACHT",
            content: {
                beschrijving: complaint.description || "Niet gespecificeerd",
                duur: complaint.duration || "Niet gespecificeerd",
                ernst: this.formatters.severity(complaint.severity || "unknown"),
                context: complaint.context || "Geen specifieke context vermeld",
                begeleidendeSympomen: complaint.associatedSymptoms || []
            },
            isEmpty: !complaint.description
        };
    }

    generateHistoryOfPresentIllnessSection(reportData) {
        const symptoms = reportData.cardiacSymptoms;
        const timeline = reportData.timeline || [];
        
        return {
            title: "ANAMNESE VAN HUIDIGE ZIEKTE",
            content: {
                ontstaan: this.extractOnset(symptoms, timeline),
                beloop: this.extractCourse(symptoms, timeline),
                uitlokkendeFactor: this.extractTriggers(symptoms),
                verzachtendeFactor: this.extractReliefFactors(symptoms),
                begeleidendeSympomen: this.extractAssociatedSymptoms(symptoms),
                functioneleImpact: this.extractFunctionalImpact(reportData.functionalAssessment)
            },
            isEmpty: !symptoms || symptoms.length === 0
        };
    }

    generateCardiacSymptomsSection(reportData) {
        const symptoms = reportData.cardiacSymptoms;
        
        return {
            title: "CARDIALE SYMPTOMEN",
            content: {
                borstpijn: this.analyzeChestPain(symptoms),
                dyspnoe: this.analyzeDyspnea(symptoms),
                hartkloppingen: this.analyzePalpitations(symptoms),
                syncope: this.analyzeSyncope(symptoms),
                oedeem: this.analyzeEdema(symptoms),
                vermoeidheid: this.analyzeFatigue(symptoms),
                andereSympomen: this.analyzeOtherSymptoms(symptoms)
            },
            isEmpty: !symptoms || symptoms.length === 0
        };
    }

    generateFunctionalAssessmentSection(reportData) {
        const functional = reportData.functionalAssessment;
        
        return {
            title: "FUNCTIONELE BEOORDELING",
            content: {
                nyhaKlasse: this.determineNYHAClass(functional),
                ccsKlasse: this.determineCCSClass(functional),
                inspanningstolerantie: this.assessExerciseTolerance(functional),
                dagelijkseActiviteiten: this.assessDailyActivities(functional),
                kwaliteitVanLeven: this.assessQualityOfLife(functional),
                beperkingen: this.identifyLimitations(functional)
            },
            isEmpty: !functional
        };
    }

    generateRiskFactorAnalysisSection(reportData) {
        const riskFactors = reportData.riskFactors;
        
        return {
            title: "RISICOFACTOR ANALYSE",
            content: {
                modificeerbareRisicofactoren: this.analyzeModifiableRiskFactors(riskFactors),
                nietModificeerbareRisicofactoren: this.analyzeNonModifiableRiskFactors(riskFactors),
                risicoScore: this.calculateRiskScore(riskFactors),
                risicoStratificatie: this.stratifyRisk(riskFactors),
                aanbevelingenRisicoreductie: this.generateRiskReductionRecommendations(riskFactors)
            },
            isEmpty: !riskFactors || Object.keys(riskFactors).length === 0
        };
    }

    generateMedicationHistorySection(reportData) {
        const medications = reportData.medications;
        
        return {
            title: "MEDICATIE ANAMNESE",
            content: {
                huidigeMedicatie: this.listCurrentMedications(medications),
                cardialeMedicatie: this.listCardiacMedications(medications),
                allergieën: this.listAllergies(medications),
                bijwerkingen: this.listAdverseReactions(medications),
                therapietrouw: this.assessCompliance(medications),
                interacties: this.checkInteractions(medications)
            },
            isEmpty: !medications || medications.length === 0
        };
    }

    generateFamilyHistorySection(reportData) {
        const familyHistory = reportData.familyHistory;
        
        return {
            title: "FAMILIE ANAMNESE",
            content: {
                cardiovasculaireAandoeningen: this.extractCardiovascularFamilyHistory(familyHistory),
                plotseHartdood: this.extractSuddenDeathHistory(familyHistory),
                aangeboren: this.extractCongenitalHistory(familyHistory),
                risicoFactoren: this.extractFamilyRiskFactors(familyHistory),
                erfelijkheidspatroon: this.analyzeInheritancePattern(familyHistory)
            },
            isEmpty: !familyHistory || familyHistory.length === 0
        };
    }

    generateSocialHistorySection(reportData) {
        const socialHistory = reportData.socialHistory;
        
        return {
            title: "SOCIALE ANAMNESE",
            content: {
                roken: this.analyzeSmokingHistory(socialHistory),
                alcohol: this.analyzeAlcoholUse(socialHistory),
                drugs: this.analyzeDrugUse(socialHistory),
                beroep: this.analyzeProfession(socialHistory),
                sport: this.analyzeExerciseHabits(socialHistory),
                stress: this.analyzeStressFactors(socialHistory),
                slaap: this.analyzeSleepPatterns(socialHistory)
            },
            isEmpty: !socialHistory || Object.keys(socialHistory).length === 0
        };
    }

    generateReviewOfSystemsSection(reportData) {
        const symptoms = reportData.cardiacSymptoms;
        const otherSymptoms = reportData.otherSymptoms || [];
        
        return {
            title: "SYSTEEM REVIEW",
            content: {
                cardiovasculair: this.reviewCardiovascularSystem(symptoms),
                respiratoir: this.reviewRespiratorySystem(otherSymptoms),
                neurologisch: this.reviewNeurologicalSystem(otherSymptoms),
                gastrointestinaal: this.reviewGastrointestinalSystem(otherSymptoms),
                genitourinair: this.reviewGenitourinarySystem(otherSymptoms),
                endocrien: this.reviewEndocrineSystem(otherSymptoms),
                musculoskeletaal: this.reviewMusculoskeletalSystem(otherSymptoms)
            },
            isEmpty: false // Always include this section
        };
    }

    generateClinicalImpressionSection(reportData) {
        const impression = reportData.clinicalImpression;
        
        return {
            title: "KLINISCHE INDRUK",
            content: {
                samenvatting: this.generateClinicalSummary(reportData),
                differentiaalDiagnose: this.generateDifferentialDiagnosis(reportData),
                urgentie: this.formatters.urgency(impression.urgency || 'routine'),
                risicoInschatting: this.assessOverallRisk(reportData),
                prognose: this.assessPrognosis(reportData),
                aandachtspunten: this.identifyKeyPoints(reportData)
            },
            isEmpty: false // Always include this section
        };
    }

    generateRecommendationsSection(reportData) {
        const recommendations = reportData.recommendations;
        
        return {
            title: "AANBEVELINGEN",
            content: {
                diagnostiek: this.generateDiagnosticRecommendations(reportData),
                behandeling: this.generateTreatmentRecommendations(reportData),
                leefstijl: this.generateLifestyleRecommendations(reportData),
                monitoring: this.generateMonitoringRecommendations(reportData),
                verwijzing: this.generateReferralRecommendations(reportData),
                patiënteneducatie: this.generatePatientEducationRecommendations(reportData)
            },
            isEmpty: !recommendations || recommendations.length === 0
        };
    }

    generateFollowUpPlanSection(reportData) {
        return {
            title: "VERVOLGPLAN",
            content: {
                kortetermijn: this.generateShortTermPlan(reportData),
                langetermijn: this.generateLongTermPlan(reportData),
                controleAfspraken: this.generateFollowUpSchedule(reportData),
                alarmsympomen: this.generateAlarmSymptoms(reportData),
                contactinformatie: this.generateContactInformation(reportData)
            },
            isEmpty: false // Always include this section
        };
    }

    // Helper methods for data extraction and analysis
    extractPatientInformation(summary, detailedReport) {
        return {
            name: summary.patientInfo?.name || detailedReport.patientInformation?.name,
            age: summary.patientInfo?.age || detailedReport.patientInformation?.age,
            gender: summary.patientInfo?.gender || detailedReport.patientInformation?.gender,
            birthDate: summary.patientInfo?.birthDate || detailedReport.patientInformation?.birthDate,
            contact: summary.patientInfo?.contact || detailedReport.patientInformation?.contact,
            primaryPhysician: summary.patientInfo?.primaryPhysician || detailedReport.patientInformation?.primaryPhysician
        };
    }

    extractChiefComplaint(summary, detailedReport) {
        return {
            description: summary.chiefComplaint || detailedReport.chiefComplaint?.description,
            duration: detailedReport.chiefComplaint?.duration,
            severity: detailedReport.chiefComplaint?.severity,
            context: detailedReport.chiefComplaint?.context,
            associatedSymptoms: detailedReport.chiefComplaint?.associatedSymptoms || []
        };
    }

    extractCardiacSymptoms(summary, detailedReport) {
        return summary.cardiacSymptoms || detailedReport.presentIllness?.cardiacSymptoms || [];
    }

    extractFunctionalAssessment(summary, detailedReport) {
        return summary.functionalCapacity || detailedReport.functionalAssessment || null;
    }

    extractRiskFactors(summary, detailedReport) {
        return summary.riskFactors || detailedReport.riskFactorAssessment || {};
    }

    extractMedications(summary, detailedReport) {
        return summary.medications || detailedReport.medicationHistory?.currentMedications || [];
    }

    extractFamilyHistory(summary, detailedReport) {
        return summary.familyHistory || detailedReport.familyHistory || [];
    }

    extractSocialHistory(summary, detailedReport) {
        return summary.socialHistory || detailedReport.socialHistory || {};
    }

    extractClinicalImpression(summary, detailedReport) {
        return {
            urgency: summary.urgencyFlags?.length > 0 ? summary.urgencyFlags[0].flag : 'routine',
            recommendations: summary.recommendations || detailedReport.clinicalImpression?.recommendations || []
        };
    }

    extractRecommendations(summary, detailedReport) {
        return summary.recommendations || detailedReport.clinicalImpression?.recommendations || [];
    }

    // Symptom analysis methods
    analyzeChestPain(symptoms) {
        const chestPainSymptoms = symptoms.filter(s => s.symptom?.includes('pijn') || s.symptom?.includes('borst'));
        
        if (chestPainSymptoms.length === 0) {
            return {
                aanwezig: false,
                beschrijving: "Geen borstpijn gerapporteerd"
            };
        }

        const chestPain = chestPainSymptoms[0];
        return {
            aanwezig: true,
            locatie: chestPain.location || "Niet gespecificeerd",
            karakter: chestPain.character || "Niet beschreven",
            ernst: this.formatters.severity(chestPain.severity),
            duur: chestPain.timing || "Niet gespecificeerd",
            uitstraling: chestPain.radiation || "Geen uitstraling vermeld",
            uitlokkendeFactor: chestPain.triggers || "Niet geïdentificeerd",
            verzachtendeFactor: chestPain.relief || "Niet geïdentificeerd"
        };
    }

    analyzeDyspnea(symptoms) {
        const dyspneaSymptoms = symptoms.filter(s => 
            s.symptom?.includes('kortademig') || 
            s.symptom?.includes('benauwd') || 
            s.symptom?.includes('ademen')
        );
        
        if (dyspneaSymptoms.length === 0) {
            return {
                aanwezig: false,
                beschrijving: "Geen kortademigheid gerapporteerd"
            };
        }

        return {
            aanwezig: true,
            type: this.determineDyspneaType(dyspneaSymptoms),
            ernst: this.formatters.severity(dyspneaSymptoms[0].severity),
            uitlokkendeFactor: dyspneaSymptoms[0].triggers || "Niet gespecificeerd",
            orthopnoe: this.checkForOrthopnea(dyspneaSymptoms),
            pnd: this.checkForPND(dyspneaSymptoms)
        };
    }

    analyzePalpitations(symptoms) {
        const palpitationSymptoms = symptoms.filter(s => 
            s.symptom?.includes('hartkloppingen') || 
            s.symptom?.includes('bonzend') ||
            s.symptom?.includes('onregelmatig')
        );
        
        if (palpitationSymptoms.length === 0) {
            return {
                aanwezig: false,
                beschrijving: "Geen hartkloppingen gerapporteerd"
            };
        }

        return {
            aanwezig: true,
            type: this.determinePalpitationType(palpitationSymptoms),
            duur: palpitationSymptoms[0].timing || "Niet gespecificeerd",
            frequentie: palpitationSymptoms[0].frequency || "Niet gespecificeerd",
            uitlokkendeFactor: palpitationSymptoms[0].triggers || "Niet gespecificeerd"
        };
    }

    analyzeSyncope(symptoms) {
        const syncopeSymptoms = symptoms.filter(s => 
            s.symptom?.includes('flauwvallen') || 
            s.symptom?.includes('bewusteloos') ||
            s.symptom?.includes('wegzakken')
        );
        
        if (syncopeSymptoms.length === 0) {
            return {
                aanwezig: false,
                beschrijving: "Geen syncope gerapporteerd"
            };
        }

        return {
            aanwezig: true,
            frequentie: syncopeSymptoms[0].frequency || "Niet gespecificeerd",
            prodromaalSymptomen: syncopeSymptoms[0].prodrome || "Niet vermeld",
            uitlokkendeFactor: syncopeSymptoms[0].triggers || "Niet gespecificeerd",
            herstel: syncopeSymptoms[0].recovery || "Niet beschreven"
        };
    }

    analyzeEdema(symptoms) {
        const edemaSymptoms = symptoms.filter(s => 
            s.symptom?.includes('gezwollen') || 
            s.symptom?.includes('oedeem') ||
            s.symptom?.includes('dik')
        );
        
        if (edemaSymptoms.length === 0) {
            return {
                aanwezig: false,
                beschrijving: "Geen oedeem gerapporteerd"
            };
        }

        return {
            aanwezig: true,
            locatie: edemaSymptoms[0].location || "Niet gespecificeerd",
            ernst: this.formatters.severity(edemaSymptoms[0].severity),
            tijdspatroon: edemaSymptoms[0].timing || "Niet gespecificeerd",
            pittingOedeem: edemaSymptoms[0].pitting || "Niet onderzocht"
        };
    }

    analyzeFatigue(symptoms) {
        const fatigueSymptoms = symptoms.filter(s => 
            s.symptom?.includes('moe') || 
            s.symptom?.includes('vermoeid') ||
            s.symptom?.includes('energie')
        );
        
        if (fatigueSymptoms.length === 0) {
            return {
                aanwezig: false,
                beschrijving: "Geen vermoeidheid gerapporteerd"
            };
        }

        return {
            aanwezig: true,
            ernst: this.formatters.severity(fatigueSymptoms[0].severity),
            patroon: fatigueSymptoms[0].pattern || "Niet gespecificeerd",
            impact: fatigueSymptoms[0].impact || "Niet beschreven"
        };
    }

    analyzeOtherSymptoms(symptoms) {
        const otherSymptoms = symptoms.filter(s => 
            !s.symptom?.includes('pijn') && 
            !s.symptom?.includes('kortademig') &&
            !s.symptom?.includes('hartkloppingen') &&
            !s.symptom?.includes('flauwvallen') &&
            !s.symptom?.includes('gezwollen') &&
            !s.symptom?.includes('moe')
        );
        
        return otherSymptoms.map(symptom => ({
            symptom: symptom.symptom,
            beschrijving: symptom.description || "Geen details",
            ernst: this.formatters.severity(symptom.severity)
        }));
    }

    // Functional assessment methods
    determineNYHAClass(functional) {
        if (!functional || !functional.nyhaClass) {
            return {
                klasse: "Niet bepaald",
                beschrijving: "Functionele klasse niet geëvalueerd"
            };
        }

        const nyhaDescriptions = {
            'I': 'Klasse I - Geen beperking van fysieke activiteit',
            'II': 'Klasse II - Lichte beperking van fysieke activiteit',
            'III': 'Klasse III - Duidelijke beperking van fysieke activiteit',
            'IV': 'Klasse IV - Klachten bij elke fysieke activiteit of in rust'
        };

        return {
            klasse: `NYHA ${functional.nyhaClass}`,
            beschrijving: nyhaDescriptions[functional.nyhaClass] || "Onbekende klasse"
        };
    }

    determineCCSClass(functional) {
        if (!functional || !functional.ccsClass) {
            return {
                klasse: "Niet bepaald",
                beschrijving: "CCS klasse niet geëvalueerd"
            };
        }

        const ccsDescriptions = {
            'I': 'Klasse I - Geen angina bij normale activiteit',
            'II': 'Klasse II - Lichte beperking door angina',
            'III': 'Klasse III - Duidelijke beperking door angina',
            'IV': 'Klasse IV - Angina bij minimale inspanning of rust'
        };

        return {
            klasse: `CCS ${functional.ccsClass}`,
            beschrijving: ccsDescriptions[functional.ccsClass] || "Onbekende klasse"
        };
    }

    assessExerciseTolerance(functional) {
        if (!functional) {
            return "Niet geëvalueerd";
        }

        // Extract exercise tolerance information
        const tolerance = functional.exerciseTolerance || functional.description || "";
        
        if (tolerance.includes('trap')) {
            return "Beperkt tot traplopen";
        } else if (tolerance.includes('lopen')) {
            return "Beperkt tot wandelen";
        } else if (tolerance.includes('rust')) {
            return "Klachten in rust";
        } else {
            return "Normale inspanningstolerantie";
        }
    }

    assessDailyActivities(functional) {
        if (!functional) {
            return "Niet geëvalueerd";
        }

        return functional.dailyActivities || "Geen specifieke beperkingen vermeld";
    }

    assessQualityOfLife(functional) {
        if (!functional) {
            return "Niet geëvalueerd";
        }

        return functional.qualityOfLife || "Niet specifiek beoordeeld";
    }

    identifyLimitations(functional) {
        if (!functional) {
            return [];
        }

        const limitations = [];
        
        if (functional.nyhaClass === 'III' || functional.nyhaClass === 'IV') {
            limitations.push("Significante beperking van dagelijkse activiteiten");
        }
        
        if (functional.ccsClass === 'III' || functional.ccsClass === 'IV') {
            limitations.push("Significante beperking door angina pectoris");
        }
        
        return limitations;
    }

    // Risk factor analysis methods
    analyzeModifiableRiskFactors(riskFactors) {
        const modifiable = {};
        
        if (riskFactors.smoking !== undefined) {
            modifiable.roken = {
                status: this.formatters.yesNo(riskFactors.smoking),
                details: riskFactors.smokingDetails || "Geen details"
            };
        }
        
        if (riskFactors.hypertension !== undefined) {
            modifiable.hypertensie = {
                status: this.formatters.yesNo(riskFactors.hypertension),
                details: riskFactors.hypertensionDetails || "Geen details"
            };
        }
        
        if (riskFactors.diabetes !== undefined) {
            modifiable.diabetes = {
                status: this.formatters.yesNo(riskFactors.diabetes),
                details: riskFactors.diabetesDetails || "Geen details"
            };
        }
        
        if (riskFactors.cholesterol !== undefined) {
            modifiable.cholesterol = {
                status: this.formatters.yesNo(riskFactors.cholesterol),
                details: riskFactors.cholesterolDetails || "Geen details"
            };
        }
        
        if (riskFactors.obesity !== undefined) {
            modifiable.overgewicht = {
                status: this.formatters.yesNo(riskFactors.obesity),
                details: riskFactors.obesityDetails || "Geen details"
            };
        }
        
        return modifiable;
    }

    analyzeNonModifiableRiskFactors(riskFactors) {
        const nonModifiable = {};
        
        if (riskFactors.age !== undefined) {
            nonModifiable.leeftijd = {
                waarde: riskFactors.age,
                risico: riskFactors.age > 65 ? "Verhoogd risico" : "Normaal risico"
            };
        }
        
        if (riskFactors.gender !== undefined) {
            nonModifiable.geslacht = {
                waarde: riskFactors.gender,
                risico: this.assessGenderRisk(riskFactors.gender, riskFactors.age)
            };
        }
        
        if (riskFactors.familyHistory !== undefined) {
            nonModifiable.familiegeschiedenis = {
                status: this.formatters.yesNo(riskFactors.familyHistory),
                details: riskFactors.familyHistoryDetails || "Geen details"
            };
        }
        
        return nonModifiable;
    }

    calculateRiskScore(riskFactors) {
        let score = 0;
        
        if (riskFactors.smoking === true) score += 2;
        if (riskFactors.hypertension === true) score += 2;
        if (riskFactors.diabetes === true) score += 2;
        if (riskFactors.familyHistory === true) score += 1;
        if (riskFactors.obesity === true) score += 1;
        if (riskFactors.age > 65) score += 1;
        
        return {
            score: score,
            maximumScore: 9,
            percentage: Math.round((score / 9) * 100)
        };
    }

    stratifyRisk(riskFactors) {
        const riskScore = this.calculateRiskScore(riskFactors);
        
        if (riskScore.score >= 6) {
            return {
                niveau: "Hoog risico",
                beschrijving: "Patiënt heeft een hoog cardiovasculair risico",
                aanbeveling: "Intensieve risicofactor modificatie en cardiologische evaluatie"
            };
        } else if (riskScore.score >= 3) {
            return {
                niveau: "Matig risico",
                beschrijving: "Patiënt heeft een matig cardiovasculair risico",
                aanbeveling: "Risicofactor modificatie en regelmatige controle"
            };
        } else {
            return {
                niveau: "Laag risico",
                beschrijving: "Patiënt heeft een laag cardiovasculair risico",
                aanbeveling: "Preventieve maatregelen en leefstijladvies"
            };
        }
    }

    generateRiskReductionRecommendations(riskFactors) {
        const recommendations = [];
        
        if (riskFactors.smoking === true) {
            recommendations.push({
                factor: "Roken",
                aanbeveling: "Stoppen met roken is de belangrijkste maatregel",
                prioriteit: "Hoog"
            });
        }
        
        if (riskFactors.hypertension === true) {
            recommendations.push({
                factor: "Hypertensie",
                aanbeveling: "Optimale bloeddrukcontrole nastreven",
                prioriteit: "Hoog"
            });
        }
        
        if (riskFactors.diabetes === true) {
            recommendations.push({
                factor: "Diabetes",
                aanbeveling: "Optimale glycemische controle",
                prioriteit: "Hoog"
            });
        }
        
        if (riskFactors.obesity === true) {
            recommendations.push({
                factor: "Overgewicht",
                aanbeveling: "Gewichtsreductie door dieet en beweging",
                prioriteit: "Matig"
            });
        }
        
        return recommendations;
    }

    // Additional helper methods
    assessReportCompleteness(reportData) {
        let completeness = 0;
        let totalSections = 10;
        
        if (reportData.patientInformation && reportData.patientInformation.name) completeness++;
        if (reportData.chiefComplaint && reportData.chiefComplaint.description) completeness++;
        if (reportData.cardiacSymptoms && reportData.cardiacSymptoms.length > 0) completeness++;
        if (reportData.functionalAssessment) completeness++;
        if (reportData.riskFactors && Object.keys(reportData.riskFactors).length > 0) completeness++;
        if (reportData.medications && reportData.medications.length > 0) completeness++;
        if (reportData.familyHistory && reportData.familyHistory.length > 0) completeness++;
        if (reportData.socialHistory && Object.keys(reportData.socialHistory).length > 0) completeness++;
        if (reportData.clinicalImpression) completeness++;
        if (reportData.recommendations && reportData.recommendations.length > 0) completeness++;
        
        return {
            score: completeness,
            total: totalSections,
            percentage: Math.round((completeness / totalSections) * 100),
            level: completeness >= 8 ? "Volledig" : completeness >= 6 ? "Goed" : completeness >= 4 ? "Matig" : "Onvolledig"
        };
    }

    // Generate formatted report output
    generateFormattedReport(report) {
        let formattedReport = "";
        
        // Header
        formattedReport += `${report.header.title}\n`;
        formattedReport += `${report.header.subtitle}\n`;
        formattedReport += `${"=".repeat(60)}\n\n`;
        
        formattedReport += `Patiënt: ${report.header.patientName}\n`;
        formattedReport += `Datum: ${report.header.reportDate}\n`;
        formattedReport += `Tijd: ${report.header.reportTime}\n`;
        formattedReport += `Gegenereerd door: ${report.header.generatedBy}\n`;
        formattedReport += `${report.header.confidentiality}\n\n`;
        
        // Sections
        for (const [sectionName, section] of Object.entries(report.sections)) {
            if (!section.isEmpty) {
                formattedReport += `${section.title}\n`;
                formattedReport += `${"-".repeat(section.title.length)}\n`;
                
                if (typeof section.content === 'object') {
                    formattedReport += this.formatSectionContent(section.content);
                } else {
                    formattedReport += `${section.content}\n`;
                }
                
                formattedReport += "\n";
            }
        }
        
        return formattedReport;
    }

    formatSectionContent(content, indent = 0) {
        let formatted = "";
        const indentStr = "  ".repeat(indent);
        
        for (const [key, value] of Object.entries(content)) {
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    formatted += `${indentStr}${label}:\n`;
                    for (const item of value) {
                        if (typeof item === 'object') {
                            formatted += this.formatSectionContent(item, indent + 1);
                        } else {
                            formatted += `${indentStr}  - ${item}\n`;
                        }
                    }
                } else {
                    formatted += `${indentStr}${label}:\n`;
                    formatted += this.formatSectionContent(value, indent + 1);
                }
            } else {
                formatted += `${indentStr}${label}: ${value || "Niet gespecificeerd"}\n`;
            }
        }
        
        return formatted;
    }

    // Placeholder methods for missing implementations
    extractOnset(symptoms, timeline) { return "Niet gespecificeerd"; }
    extractCourse(symptoms, timeline) { return "Niet gespecificeerd"; }
    extractTriggers(symptoms) { return "Niet gespecificeerd"; }
    extractReliefFactors(symptoms) { return "Niet gespecificeerd"; }
    extractAssociatedSymptoms(symptoms) { return []; }
    extractFunctionalImpact(functional) { return "Niet gespecificeerd"; }
    determineDyspneaType(symptoms) { return "Niet gespecificeerd"; }
    checkForOrthopnea(symptoms) { return "Niet onderzocht"; }
    checkForPND(symptoms) { return "Niet onderzocht"; }
    determinePalpitationType(symptoms) { return "Niet gespecificeerd"; }
    listCurrentMedications(medications) { return []; }
    listCardiacMedications(medications) { return []; }
    listAllergies(medications) { return []; }
    listAdverseReactions(medications) { return []; }
    assessCompliance(medications) { return "Niet beoordeeld"; }
    checkInteractions(medications) { return []; }
    extractCardiovascularFamilyHistory(familyHistory) { return []; }
    extractSuddenDeathHistory(familyHistory) { return []; }
    extractCongenitalHistory(familyHistory) { return []; }
    extractFamilyRiskFactors(familyHistory) { return []; }
    analyzeInheritancePattern(familyHistory) { return "Niet geanalyseerd"; }
    analyzeSmokingHistory(socialHistory) { return "Niet gespecificeerd"; }
    analyzeAlcoholUse(socialHistory) { return "Niet gespecificeerd"; }
    analyzeDrugUse(socialHistory) { return "Niet gespecificeerd"; }
    analyzeProfession(socialHistory) { return "Niet gespecificeerd"; }
    analyzeExerciseHabits(socialHistory) { return "Niet gespecificeerd"; }
    analyzeStressFactors(socialHistory) { return "Niet gespecificeerd"; }
    analyzeSleepPatterns(socialHistory) { return "Niet gespecificeerd"; }
    reviewCardiovascularSystem(symptoms) { return "Zie cardiale symptomen sectie"; }
    reviewRespiratorySystem(symptoms) { return "Geen specifieke klachten"; }
    reviewNeurologicalSystem(symptoms) { return "Geen specifieke klachten"; }
    reviewGastrointestinalSystem(symptoms) { return "Geen specifieke klachten"; }
    reviewGenitourinarySystem(symptoms) { return "Geen specifieke klachten"; }
    reviewEndocrineSystem(symptoms) { return "Geen specifieke klachten"; }
    reviewMusculoskeletalSystem(symptoms) { return "Geen specifieke klachten"; }
    generateClinicalSummary(reportData) { return "Cardiologische anamnese afgenomen"; }
    generateDifferentialDiagnosis(reportData) { return []; }
    assessOverallRisk(reportData) { return "Niet beoordeeld"; }
    assessPrognosis(reportData) { return "Niet beoordeeld"; }
    identifyKeyPoints(reportData) { return []; }
    generateDiagnosticRecommendations(reportData) { return []; }
    generateTreatmentRecommendations(reportData) { return []; }
    generateLifestyleRecommendations(reportData) { return []; }
    generateMonitoringRecommendations(reportData) { return []; }
    generateReferralRecommendations(reportData) { return []; }
    generatePatientEducationRecommendations(reportData) { return []; }
    generateShortTermPlan(reportData) { return "Cardiologische evaluatie"; }
    generateLongTermPlan(reportData) { return "Risicofactor management"; }
    generateFollowUpSchedule(reportData) { return "Volgens cardioloog"; }
    generateAlarmSymptoms(reportData) { return []; }
    generateContactInformation(reportData) { return "Contacteer uw cardioloog"; }
    assessGenderRisk(gender, age) { return "Normaal risico"; }
}

// Export for use in other modules
window.MedicalReportGenerator = MedicalReportGenerator;

