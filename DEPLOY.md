# Render Deployment Guide

This guide will help you deploy the AI Medical Voice Chat application on Render.

## Prerequisites

- GitHub account with the repository: `https://github.com/jdverbek/ai-medical-voice-chat`
- Render account (free): `https://render.com`
- OpenAI API key

## Step-by-Step Deployment

### 1. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 2. Create New Web Service
1. Click "New +" in Render dashboard
2. Select "Web Service"
3. Connect your GitHub repository: `jdverbek/ai-medical-voice-chat`
4. Click "Connect"

### 3. Configure Service Settings
Fill in the following settings:

**Basic Settings:**
- **Name**: `ai-medical-voice-chat`
- **Region**: Choose closest to your users
- **Branch**: `master`
- **Runtime**: `Python 3`

**Build & Deploy:**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python src/main.py`

**Advanced Settings:**
- **Auto-Deploy**: Yes (recommended)

### 4. Set Environment Variables
In the "Environment" section, add these variables:

| Key | Value |
|-----|-------|
| `FLASK_ENV` | `production` |
| `FLASK_DEBUG` | `False` |
| `CORS_ORIGINS` | `*` |
| `MAX_CONTENT_LENGTH` | `16777216` |
| `UPLOAD_FOLDER` | `uploads` |
| `OPENAI_API_KEY` | `your_openai_api_key_here` |

**Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 5. Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Wait for the build to complete (usually 2-5 minutes)
4. Your app will be available at: `https://your-service-name.onrender.com`

## Post-Deployment

### Verify Deployment
1. Visit your Render URL
2. Test the text conversation feature
3. Test the voice conversation feature
4. Check the health endpoint: `https://your-app.onrender.com/health`

### Monitor Application
- **Logs**: Available in Render dashboard
- **Metrics**: CPU, memory usage in dashboard
- **Health Checks**: Automatic monitoring

### Custom Domain (Optional)
1. Go to "Settings" in your service
2. Add your custom domain
3. Configure DNS records as instructed

## Troubleshooting

### Common Issues

**Build Fails:**
- Check that all dependencies are in `requirements.txt`
- Verify Python version compatibility

**App Won't Start:**
- Check environment variables are set correctly
- Review logs in Render dashboard
- Ensure `OPENAI_API_KEY` is valid

**Voice Features Not Working:**
- Verify OpenAI API key is correct
- Check API quota and billing
- Test API endpoint: `/api/whisper/health`

### Support
- Render Documentation: https://render.com/docs
- GitHub Issues: https://github.com/jdverbek/ai-medical-voice-chat/issues

## Automatic Deployments

Once connected, Render will automatically deploy when you push to the `master` branch:

```bash
git add .
git commit -m "Update application"
git push origin master
```

Your changes will be live within minutes!

