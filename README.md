# SalamiWala 💸 — Deploy Guide

## Architecture
```
Firebase Hosting  →  React frontend  (salamiwala.web.app)
Vercel            →  Express API      (salamiwala-api.vercel.app)
MongoDB Atlas     →  Database         (your cluster)
Cloudinary        →  QR image storage (free)
```

---

## STEP 1 — Cloudinary Setup (Free — 2 min)

1. Go to https://cloudinary.com → Sign up free
2. Dashboard → copy these 3 values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## STEP 2 — Deploy Backend to Vercel

### 2a. Push `api/` folder to GitHub
```bash
cd salamiwala/api
git init
git add .
git commit -m "SalamiWala API init"
```
Create a new repo on github.com called `salamiwala-api`, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/salamiwala-api.git
git push -u origin main
```

### 2b. Deploy on Vercel
1. Go to https://vercel.com → Sign up with GitHub
2. Click **"Add New Project"** → Import `salamiwala-api`
3. Framework Preset: **Other**
4. Click **"Environment Variables"** and add ALL of these:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://admin12:admin12@cluster0.1bviphv.mongodb.net/salamiwala?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `salamiwala-secret-2025-eid` |
| `CLOUDINARY_CLOUD_NAME` | (from Cloudinary dashboard) |
| `CLOUDINARY_API_KEY` | (from Cloudinary dashboard) |
| `CLOUDINARY_API_SECRET` | (from Cloudinary dashboard) |
| `FRONTEND_URL` | `https://salamiwala.web.app` |

5. Click **Deploy**
6. After deploy, copy your URL — looks like: `https://salamiwala-api.vercel.app`

### 2c. Test the API
Open in browser: `https://salamiwala-api.vercel.app/health`
You should see: `{"status":"ok","app":"SalamiWala 💸",...}`

---

## STEP 3 — Deploy Frontend to Firebase

### 3a. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **"Add project"** → Name: `salamiwala`
3. Disable Google Analytics (optional) → Create project
4. Left sidebar → **Hosting** → Get started → Next → Next → Finish

### 3b. Build and Deploy
```bash
cd salamiwala/frontend

# Install deps
npm install

# Create .env.local with your Vercel URL from Step 2
echo "VITE_API_URL=https://salamiwala-api.vercel.app" > .env.local

# Build the React app
npm run build

# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting (run from frontend/ folder)
firebase init hosting
```

When prompted:
- **Which Firebase project?** → Select `salamiwala`
- **Public directory?** → type `dist`
- **Single-page app?** → `y`
- **Overwrite dist/index.html?** → `n`

```bash
# Deploy!
firebase deploy
```

✅ Your app is live at: **https://salamiwala.web.app**

---

## STEP 4 — Update CORS in Vercel

After Firebase gives you the URL, go to Vercel → your project → Settings → Environment Variables:
- Update `FRONTEND_URL` to your exact Firebase URL (e.g. `https://salamiwala.web.app`)
- Click **Redeploy**

---

## Local Development

```bash
# Terminal 1 — Backend
cd api
npm install
cp .env.example .env    # fill in your values
npm run dev             # runs on http://localhost:3000

# Terminal 2 — Frontend
cd frontend
npm install
# No .env.local needed in dev — Vite proxy handles /api → :3000
npm run dev             # runs on http://localhost:5173
```

---

## MongoDB Collections (auto-created)

| Collection | Data |
|-----------|------|
| `users` | name, phone, hashed password, Cloudinary QR URL, unique slug |
| `salamientries` | who owes salami, amount, paid status |
| `sharevisits` | who visited the public share page |

---

## Features

- 🔑 JWT Auth (30 days)
- 📲 bKash QR upload → stored on Cloudinary
- 📋 Tracker — add / pay / undo / delete / filter
- 📊 Live stats — total owed, received, pending, visit count
- 🌙 Public share page — `/share/your-name-xxxx`
- 📘 Facebook / 💬 WhatsApp / 📸 Instagram share
- 😇 Copy-paste sarcastic messages
- 🎉 Coin burst celebration

ঈদ মুবারক! 🌙💸
# salamiwala-api
