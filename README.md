# AI Medical Voice Chat Assistant

Een geavanceerde AI-gestuurde medische voice chat applicatie die intelligente gesprekken voert met patiënten in het Nederlands en Vlaams, inclusief West-Vlaams dialect ondersteuning.

## 🎯 Features

### 🎤 Geavanceerde Spraakherkenning
- **OpenAI Whisper API** integratie voor nauwkeurige Nederlandse spraakherkenning
- **Real-time audio processing** met noise suppression
- **Dialect ondersteuning** voor Nederlands en Vlaams
- **Professional audio handling** met MediaRecorder API

### 🧠 Intelligente Conversatie
- **Dynamische vraag-generatie** gebaseerd op patiënt antwoorden
- **Medische symptoom analyse** met urgentie detectie
- **Empathische responses** en natuurlijke gespreksvoering
- **Context-bewuste follow-up** vragen zoals een echte dokter

### 🏥 Medische Intelligentie
- **Symptoom prioritering** - urgente klachten krijgen voorrang
- **Red flag herkenning** voor kritieke situaties
- **Nederlandse medische terminologie** database
- **GDPR-compliant** privacy en data bescherming

### ♿ Toegankelijkheid
- **WCAG 2.1 AA compliant** design
- **Elderly-friendly** interface met grote fonts en hoge contrast
- **Touch-friendly** controls voor alle apparaten
- **Keyboard navigation** en screen reader ondersteuning

## 🏗️ Architectuur

### Backend (Flask)
- **Flask REST API** met CORS ondersteuning
- **OpenAI Whisper** integratie voor spraakherkenning
- **SQLAlchemy** database voor gesprek logging
- **Environment-based** configuratie voor deployment

### Frontend (Vanilla JS)
- **Modern ES6+** JavaScript zonder frameworks
- **Responsive design** voor desktop en mobile
- **Real-time voice feedback** met visual indicators
- **Progressive Web App** ready

## 🚀 Quick Start

### Lokale Development

1. **Clone het repository**
   ```bash
   git clone https://github.com/yourusername/medical-voice-chat-backend.git
   cd medical-voice-chat-backend
   ```

2. **Setup Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # of
   venv\Scripts\activate     # Windows
   ```

3. **Installeer dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configureer environment variables**
   ```bash
   cp .env.example .env
   # Edit .env en voeg je OpenAI API key toe
   ```

5. **Start de applicatie**
   ```bash
   python src/main.py
   ```

6. **Open in browser**
   ```
   http://localhost:5000
   ```

### Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your_secret_key_here

# CORS Configuration
CORS_ORIGINS=*

# Upload Configuration
MAX_CONTENT_LENGTH=16777216  # 16MB
UPLOAD_FOLDER=uploads
```

## 📡 API Endpoints

### Whisper API
- `POST /api/transcribe` - Transcribeer audio naar tekst
- `GET /api/health` - Health check voor Whisper service

### Health Check
- `GET /health` - Algemene health check

## 🧪 Testing

### Tekstversie testen
1. Klik "💬 Start Tekstgesprek"
2. Type een medische klacht (bijv. "Ik heb hoofdpijn")
3. AI reageert met intelligente follow-up vragen

### Voice versie testen
1. Klik "🎤 Start Spraakgesprek"
2. Klik de microfoon knop
3. Spreek uw klacht duidelijk in het Nederlands
4. AI verwerkt spraak en reageert automatisch

## 🚀 Deployment

### Render Deployment

1. **Push naar GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect Render**
   - Ga naar [Render Dashboard](https://dashboard.render.com)
   - Klik "New +" → "Web Service"
   - Connect je GitHub repository

3. **Configure Build**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python src/main.py`
   - **Environment**: Python 3

4. **Set Environment Variables**
   - `OPENAI_API_KEY`: Je OpenAI API key
   - `FLASK_ENV`: `production`
   - `SECRET_KEY`: Een veilige secret key

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "src/main.py"]
```

## 🔧 Development

### Project Structure
```
medical-voice-chat-backend/
├── src/
│   ├── main.py              # Flask app entry point
│   ├── routes/
│   │   ├── whisper.py       # Whisper API routes
│   │   └── user.py          # User management routes
│   ├── models/
│   │   └── user.py          # Database models
│   ├── static/              # Frontend files
│   │   ├── index.html       # Main HTML
│   │   ├── styles.css       # Styling
│   │   ├── app.js           # Main app logic
│   │   ├── conversation-engine.js  # AI conversation logic
│   │   ├── whisper-voice-handler.js # Voice handling
│   │   └── medical-knowledge.js    # Medical knowledge base
│   └── database/
│       └── app.db           # SQLite database
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

### Adding New Features

1. **Backend API**: Voeg routes toe in `src/routes/`
2. **Frontend Logic**: Update JavaScript files in `src/static/`
3. **Medical Knowledge**: Extend `medical-knowledge.js`
4. **Styling**: Update `styles.css` voor UI changes

## 🔒 Security & Privacy

- **GDPR Compliant**: Geen persoonlijke data opslag zonder consent
- **Secure API**: Environment-based API key management
- **CORS Protection**: Configureerbare origin restrictions
- **Input Validation**: Alle user input wordt gevalideerd
- **File Upload Security**: Bestandstype en grootte validatie

## 🌍 Internationalization

Momenteel ondersteund:
- **Nederlands** (primair)
- **Vlaams** (inclusief West-Vlaams)

Toekomstige uitbreidingen:
- Engels
- Frans
- Duits

## 🤝 Contributing

1. Fork het repository
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je changes (`git commit -m 'Add amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

## 📄 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 🆘 Support

Voor vragen of problemen:
- Open een [GitHub Issue](https://github.com/yourusername/medical-voice-chat-backend/issues)
- Contact: [your-email@example.com](mailto:your-email@example.com)

## 🙏 Acknowledgments

- **OpenAI** voor de Whisper API
- **Flask** community voor de uitstekende documentatie
- **Medical professionals** die feedback hebben gegeven op de conversatie flows

