// PDF Report Generator for Medical Reports

class PDFReportGenerator {
    constructor() {
        this.pageSettings = {
            format: 'A4',
            margin: {
                top: '2cm',
                right: '2cm',
                bottom: '2cm',
                left: '2cm'
            }
        };
        this.styles = this.initializeStyles();
    }

    initializeStyles() {
        return {
            header: {
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '20px',
                color: '#2c3e50'
            },
            subtitle: {
                fontSize: '14px',
                textAlign: 'center',
                marginBottom: '30px',
                color: '#7f8c8d'
            },
            sectionTitle: {
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '25px',
                marginBottom: '15px',
                color: '#34495e',
                borderBottom: '2px solid #3498db',
                paddingBottom: '5px'
            },
            subsectionTitle: {
                fontSize: '14px',
                fontWeight: 'bold',
                marginTop: '15px',
                marginBottom: '10px',
                color: '#2c3e50'
            },
            content: {
                fontSize: '12px',
                lineHeight: '1.6',
                marginBottom: '10px',
                color: '#2c3e50'
            },
            label: {
                fontWeight: 'bold',
                display: 'inline-block',
                minWidth: '150px',
                color: '#34495e'
            },
            value: {
                color: '#2c3e50'
            },
            urgent: {
                color: '#e74c3c',
                fontWeight: 'bold'
            },
            warning: {
                color: '#f39c12',
                fontWeight: 'bold'
            },
            normal: {
                color: '#27ae60'
            },
            footer: {
                fontSize: '10px',
                textAlign: 'center',
                marginTop: '30px',
                color: '#95a5a6',
                borderTop: '1px solid #bdc3c7',
                paddingTop: '10px'
            }
        };
    }

    async generatePDF(reportData, options = {}) {
        try {
            const htmlContent = this.generateHTMLReport(reportData, options);
            const pdfBlob = await this.convertHTMLToPDF(htmlContent);
            
            return {
                success: true,
                blob: pdfBlob,
                filename: this.generateFilename(reportData),
                size: pdfBlob.size
            };
        } catch (error) {
            console.error('Error generating PDF:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    generateHTMLReport(reportData, options = {}) {
        const report = reportData.report;
        const metadata = reportData.metadata;
        
        let html = this.generateHTMLHeader();
        html += this.generateReportHeader(report.header);
        html += this.generateMetadataSection(metadata);
        
        // Generate sections
        for (const [sectionName, section] of Object.entries(report.sections)) {
            if (!section.isEmpty || options.includeEmptySections) {
                html += this.generateSectionHTML(section);
            }
        }
        
        html += this.generateHTMLFooter(report.header);
        
        return html;
    }

    generateHTMLHeader() {
        return `
        <!DOCTYPE html>
        <html lang="nl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cardiologisch Rapport</title>
            <style>
                ${this.generateCSS()}
            </style>
        </head>
        <body>
        `;
    }

    generateCSS() {
        return `
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #2c3e50;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #3498db;
                padding-bottom: 20px;
            }
            
            .header h1 {
                font-size: 24px;
                color: #2c3e50;
                margin: 0 0 10px 0;
                font-weight: bold;
            }
            
            .header .subtitle {
                font-size: 16px;
                color: #7f8c8d;
                margin: 0;
            }
            
            .patient-info {
                background-color: #ecf0f1;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 25px;
                border-left: 4px solid #3498db;
            }
            
            .patient-info h2 {
                margin: 0 0 10px 0;
                color: #2c3e50;
                font-size: 18px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            
            .info-item {
                display: flex;
                margin-bottom: 5px;
            }
            
            .info-label {
                font-weight: bold;
                min-width: 120px;
                color: #34495e;
            }
            
            .info-value {
                color: #2c3e50;
            }
            
            .section {
                margin-bottom: 30px;
                page-break-inside: avoid;
            }
            
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #2c3e50;
                margin: 0 0 15px 0;
                padding-bottom: 8px;
                border-bottom: 2px solid #3498db;
            }
            
            .subsection {
                margin-bottom: 20px;
            }
            
            .subsection-title {
                font-size: 14px;
                font-weight: bold;
                color: #34495e;
                margin: 0 0 10px 0;
            }
            
            .content-item {
                margin-bottom: 8px;
                display: flex;
                align-items: flex-start;
            }
            
            .content-label {
                font-weight: bold;
                min-width: 150px;
                color: #34495e;
                flex-shrink: 0;
            }
            
            .content-value {
                color: #2c3e50;
                flex-grow: 1;
            }
            
            .urgent {
                color: #e74c3c;
                font-weight: bold;
            }
            
            .warning {
                color: #f39c12;
                font-weight: bold;
            }
            
            .normal {
                color: #27ae60;
            }
            
            .risk-high {
                background-color: #fdf2f2;
                border-left: 4px solid #e74c3c;
                padding: 10px;
                margin: 10px 0;
            }
            
            .risk-medium {
                background-color: #fefbf3;
                border-left: 4px solid #f39c12;
                padding: 10px;
                margin: 10px 0;
            }
            
            .risk-low {
                background-color: #f0f9f4;
                border-left: 4px solid #27ae60;
                padding: 10px;
                margin: 10px 0;
            }
            
            .recommendations {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
            }
            
            .recommendation-item {
                margin-bottom: 10px;
                padding: 8px;
                background-color: #ffffff;
                border-radius: 4px;
                border-left: 3px solid #3498db;
            }
            
            .priority-high {
                border-left-color: #e74c3c;
            }
            
            .priority-medium {
                border-left-color: #f39c12;
            }
            
            .priority-low {
                border-left-color: #27ae60;
            }
            
            .symptom-present {
                color: #e74c3c;
                font-weight: bold;
            }
            
            .symptom-absent {
                color: #95a5a6;
            }
            
            .functional-class {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 12px;
            }
            
            .nyha-1 { background-color: #d5f4e6; color: #27ae60; }
            .nyha-2 { background-color: #fff3cd; color: #856404; }
            .nyha-3 { background-color: #f8d7da; color: #721c24; }
            .nyha-4 { background-color: #f5c6cb; color: #491217; }
            
            .metadata {
                background-color: #f8f9fa;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 20px;
                font-size: 11px;
                color: #6c757d;
            }
            
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                text-align: center;
                font-size: 11px;
                color: #6c757d;
            }
            
            .page-break {
                page-break-before: always;
            }
            
            @media print {
                body {
                    margin: 0;
                    padding: 15px;
                }
                
                .section {
                    page-break-inside: avoid;
                }
                
                .patient-info {
                    page-break-inside: avoid;
                }
            }
            
            ul, ol {
                margin: 0;
                padding-left: 20px;
            }
            
            li {
                margin-bottom: 5px;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
            }
            
            th, td {
                border: 1px solid #dee2e6;
                padding: 8px;
                text-align: left;
            }
            
            th {
                background-color: #f8f9fa;
                font-weight: bold;
            }
        `;
    }

    generateReportHeader(header) {
        return `
        <div class="header">
            <h1>${header.title}</h1>
            <p class="subtitle">${header.subtitle}</p>
        </div>
        
        <div class="patient-info">
            <h2>Patiëntinformatie</h2>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Naam:</span>
                    <span class="info-value">${header.patientName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Datum:</span>
                    <span class="info-value">${header.reportDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tijd:</span>
                    <span class="info-value">${header.reportTime}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Gegenereerd door:</span>
                    <span class="info-value">${header.generatedBy}</span>
                </div>
            </div>
        </div>
        `;
    }

    generateMetadataSection(metadata) {
        if (!metadata) return '';
        
        return `
        <div class="metadata">
            <strong>Rapport Metadata:</strong>
            Type: ${metadata.reportType} | 
            Versie: ${metadata.version} | 
            Volledigheid: ${metadata.completeness?.percentage || 0}% (${metadata.completeness?.level || 'Onbekend'}) |
            Gegenereerd: ${new Date(metadata.generatedAt).toLocaleString('nl-NL')}
        </div>
        `;
    }

    generateSectionHTML(section) {
        let html = `
        <div class="section">
            <h2 class="section-title">${section.title}</h2>
        `;
        
        if (section.content) {
            html += this.generateContentHTML(section.content);
        }
        
        html += '</div>';
        return html;
    }

    generateContentHTML(content, level = 0) {
        let html = '';
        
        if (typeof content === 'string') {
            html += `<div class="content-item"><span class="content-value">${content}</span></div>`;
        } else if (Array.isArray(content)) {
            html += '<ul>';
            for (const item of content) {
                if (typeof item === 'object') {
                    html += '<li>' + this.generateContentHTML(item, level + 1) + '</li>';
                } else {
                    html += `<li>${item}</li>`;
                }
            }
            html += '</ul>';
        } else if (typeof content === 'object' && content !== null) {
            for (const [key, value] of Object.entries(content)) {
                const label = this.formatLabel(key);
                
                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        html += `
                        <div class="subsection">
                            <h3 class="subsection-title">${label}</h3>
                            ${this.generateContentHTML(value, level + 1)}
                        </div>
                        `;
                    } else {
                        html += `
                        <div class="subsection">
                            <h3 class="subsection-title">${label}</h3>
                            ${this.generateContentHTML(value, level + 1)}
                        </div>
                        `;
                    }
                } else {
                    const formattedValue = this.formatValue(key, value);
                    const cssClass = this.getValueCSSClass(key, value);
                    
                    html += `
                    <div class="content-item">
                        <span class="content-label">${label}:</span>
                        <span class="content-value ${cssClass}">${formattedValue}</span>
                    </div>
                    `;
                }
            }
        }
        
        return html;
    }

    formatLabel(key) {
        const labelMap = {
            'naam': 'Naam',
            'leeftijd': 'Leeftijd',
            'geslacht': 'Geslacht',
            'beschrijving': 'Beschrijving',
            'duur': 'Duur',
            'ernst': 'Ernst',
            'locatie': 'Locatie',
            'karakter': 'Karakter',
            'uitstraling': 'Uitstraling',
            'aanwezig': 'Aanwezig',
            'nyhaKlasse': 'NYHA Klasse',
            'ccsKlasse': 'CCS Klasse',
            'risicoScore': 'Risico Score',
            'aanbeveling': 'Aanbeveling',
            'prioriteit': 'Prioriteit',
            'status': 'Status',
            'details': 'Details',
            'modificeerbareRisicofactoren': 'Modificeerbare Risicofactoren',
            'nietModificeerbareRisicofactoren': 'Niet-modificeerbare Risicofactoren',
            'huidigeMedicatie': 'Huidige Medicatie',
            'cardialeMedicatie': 'Cardiale Medicatie',
            'allergieën': 'Allergieën',
            'bijwerkingen': 'Bijwerkingen',
            'cardiovasculaireAandoeningen': 'Cardiovasculaire Aandoeningen',
            'plotseHartdood': 'Plotse Hartdood',
            'roken': 'Roken',
            'alcohol': 'Alcohol',
            'sport': 'Sport',
            'stress': 'Stress',
            'diagnostiek': 'Diagnostiek',
            'behandeling': 'Behandeling',
            'leefstijl': 'Leefstijl',
            'monitoring': 'Monitoring',
            'kortetermijn': 'Korte Termijn',
            'langetermijn': 'Lange Termijn'
        };
        
        return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
    }

    formatValue(key, value) {
        if (value === null || value === undefined) {
            return 'Niet gespecificeerd';
        }
        
        if (typeof value === 'boolean') {
            return value ? 'Ja' : 'Nee';
        }
        
        if (key === 'ernst' || key === 'severity') {
            const severityMap = {
                'mild': 'Licht',
                'moderate': 'Matig',
                'severe': 'Ernstig',
                'unknown': 'Niet gespecificeerd'
            };
            return severityMap[value] || value;
        }
        
        if (key === 'urgentie' || key === 'urgency') {
            const urgencyMap = {
                'immediate': 'Onmiddellijk',
                'urgent': 'Urgent',
                'routine': 'Routine'
            };
            return urgencyMap[value] || value;
        }
        
        if (key.includes('risico') || key.includes('risk')) {
            const riskMap = {
                'low': 'Laag',
                'moderate': 'Matig',
                'high': 'Hoog',
                'very_high': 'Zeer hoog'
            };
            return riskMap[value] || value;
        }
        
        return value.toString();
    }

    getValueCSSClass(key, value) {
        if (key === 'ernst' || key === 'severity') {
            if (value === 'severe') return 'urgent';
            if (value === 'moderate') return 'warning';
            if (value === 'mild') return 'normal';
        }
        
        if (key === 'urgentie' || key === 'urgency') {
            if (value === 'immediate') return 'urgent';
            if (value === 'urgent') return 'warning';
            if (value === 'routine') return 'normal';
        }
        
        if (key === 'aanwezig') {
            return value ? 'symptom-present' : 'symptom-absent';
        }
        
        if (key.includes('nyha')) {
            if (value.includes('I')) return 'nyha-1';
            if (value.includes('II')) return 'nyha-2';
            if (value.includes('III')) return 'nyha-3';
            if (value.includes('IV')) return 'nyha-4';
        }
        
        if (key.includes('risico') || key.includes('risk')) {
            if (value.includes('Hoog') || value.includes('high')) return 'urgent';
            if (value.includes('Matig') || value.includes('moderate')) return 'warning';
            if (value.includes('Laag') || value.includes('low')) return 'normal';
        }
        
        return '';
    }

    generateHTMLFooter(header) {
        return `
        <div class="footer">
            <p><strong>${header.confidentiality}</strong></p>
            <p>Dit rapport is automatisch gegenereerd door ${header.generatedBy}</p>
            <p>Voor vragen over dit rapport, neem contact op met uw behandelend cardioloog</p>
            <p>Gegenereerd op: ${new Date().toLocaleString('nl-NL')}</p>
        </div>
        </body>
        </html>
        `;
    }

    async convertHTMLToPDF(htmlContent) {
        // For browser environment, we'll use the browser's print functionality
        // In a real implementation, you might use libraries like jsPDF, Puppeteer, or server-side conversion
        
        return new Promise((resolve, reject) => {
            try {
                // Create a new window for printing
                const printWindow = window.open('', '_blank');
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                
                // Wait for content to load
                printWindow.onload = () => {
                    // Trigger print dialog
                    printWindow.print();
                    
                    // For demo purposes, create a simple text blob
                    // In production, you'd use proper PDF generation
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    resolve(blob);
                    
                    // Close the print window after a delay
                    setTimeout(() => {
                        printWindow.close();
                    }, 1000);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    generateFilename(reportData) {
        const date = new Date().toISOString().split('T')[0];
        const patientName = reportData.report?.header?.patientName || 'Patient';
        const sanitizedName = patientName.replace(/[^a-zA-Z0-9]/g, '_');
        
        return `Cardiologie_Rapport_${sanitizedName}_${date}.pdf`;
    }

    downloadPDF(reportData, options = {}) {
        this.generatePDF(reportData, options).then(result => {
            if (result.success) {
                // Create download link
                const url = URL.createObjectURL(result.blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = result.filename;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up
                URL.revokeObjectURL(url);
                
                console.log(`PDF downloaded: ${result.filename} (${result.size} bytes)`);
            } else {
                console.error('Failed to generate PDF:', result.error);
                alert('Er is een fout opgetreden bij het genereren van het PDF rapport.');
            }
        }).catch(error => {
            console.error('Error downloading PDF:', error);
            alert('Er is een fout opgetreden bij het downloaden van het rapport.');
        });
    }

    previewReport(reportData, options = {}) {
        const htmlContent = this.generateHTMLReport(reportData, options);
        
        // Open in new window for preview
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(htmlContent);
        previewWindow.document.close();
        
        return previewWindow;
    }

    // Generate summary report (shorter version)
    generateSummaryReport(reportData) {
        const summaryData = {
            report: {
                header: reportData.report.header,
                sections: {
                    patientInformation: reportData.report.sections.patientInformation,
                    chiefComplaint: reportData.report.sections.chiefComplaint,
                    cardiacSymptoms: reportData.report.sections.cardiacSymptoms,
                    riskFactorAnalysis: reportData.report.sections.riskFactorAnalysis,
                    clinicalImpression: reportData.report.sections.clinicalImpression,
                    recommendations: reportData.report.sections.recommendations
                }
            },
            metadata: {
                ...reportData.metadata,
                reportType: 'cardiologySummary'
            }
        };
        
        return this.generatePDF(summaryData, { includeEmptySections: false });
    }
}

// Export for use in other modules
window.PDFReportGenerator = PDFReportGenerator;

