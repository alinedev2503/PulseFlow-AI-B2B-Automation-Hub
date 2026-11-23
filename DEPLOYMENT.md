# PulseFlow AI — Cloud Deployment & Environment Setup Guide

## 1. Environment Variables

Configure these variables in your runtime environment (never commit secrets to Git):

### Frontend / Express Runtime (`.env`)
```env
GEMINI_API_KEY="your-google-gemini-api-key"
APP_URL="https://your-production-domain.com"
```

### Python FastAPI Cloud Run Service (`backend/.env`)
```env
GEMINI_API_KEY="your-google-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
FIRESTORE_DATABASE_ID="ai-studio-143e3c34-0e27-44ae-ab0b-45703a2caf7c"
CORS_ALLOW_ORIGINS="https://your-vercel-app.vercel.app,http://localhost:3000"
# Local development only (Cloud Run uses Application Default Credentials automatically):
# GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

---

## 2. Firebase Setup & Authentication Providers

1. **Firestore Security Rules**:
   Deploy `firestore.rules` to your Firebase project:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. **Enable Sign-In Providers** (Firebase Console -> Authentication -> Sign-in method):
   - **Google Sign-In**: Enabled automatically when provisioned.
   - **Email/Password**: Click **Add new provider -> Email/Password -> Enable**.
   - **Authorized Domains**: Add your Cloud Run and Vercel domains under Authentication -> Settings -> Authorized domains.

---

## 3. Deploy Python FastAPI Backend to Google Cloud Run

```bash
cd backend

# Option A: Deploy directly from source using Cloud Build
gcloud run deploy pulseflow-ai-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_MODEL=gemini-2.5-flash,FIRESTORE_DATABASE_ID=ai-studio-143e3c34-0e27-44ae-ab0b-45703a2caf7c" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

> **Note**: Grant the Cloud Run service account the `Cloud Datastore User` (`roles/datastore.user`) and `Firebase Authentication Viewer` (`roles/firebaseauth.viewer`) IAM roles so `firebase-admin` can verify ID tokens and persist `workflow_runs` and `error_logs`.

---

## 4. Deploy Frontend to Vercel (or Node Full-Stack to Cloud Run)

### Option A: Vercel Static SPA (pointing to Cloud Run FastAPI URL)
```bash
npm install
npm run build
npx vercel --prod
```

### Option B: Unified Node.js Full-Stack Server (Express + Vite Build)
```bash
npm install
npm run build
npm start
```
