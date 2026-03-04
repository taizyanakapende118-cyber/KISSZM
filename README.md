# ChooseYourGameMode – Kiss Condoms Website

## Quick Start

```bash
npm install
npm start
```

Open http://localhost:3000

## Deployment

This is a static Express app. Deploy to:
- **Render**: Connect repo, set build command `npm install`, start command `npm start`
- **Railway**: Auto-detects Node.js
- **Heroku**: `git push heroku main`
- **Static hosting** (Netlify/Vercel): Deploy the `/public` folder directly — no server needed

## Structure

```
chooseyourgamemode/
├── server.js          ← Express server
├── package.json
└── public/
    ├── index.html     ← Full multi-page website
    └── images/        ← All brand images
```

## Pages
- **Home** – Hero, stats, gallery, intro
- **Game Modes** – All 4 Kiss Condom variants with 3D CSS packs
- **Health Hub** – Full sexual health education (WHO/MOH Zambia content)
- **Health Pro** – Clinical resources for healthcare professionals
- **Find Support** – Zambia health resources & contact info
- **FAQ** – 9 detailed Q&As

## Contact
- +260 97 7725114 | +260 97 9351203 | +260 97 5620011
- @KissCondomsZM | dkteastafrica.org


## Email (Gmail SMTP) setup — uchichinyama@gmail.com

### 1) Create an App Password (required)
1. Open your Google Account → **Security**
2. Turn on **2‑Step Verification**
3. Search **App passwords**
4. App: **Mail** → Device: **Other** → name it `ChooseYourGameMode`
5. Copy the **16‑character** app password

### 2) Create `.env`
Copy `.env.example` → `.env` and set:
- `SMTP_USER=uchichinyama@gmail.com`
- `SMTP_PASS=<your app password>`

Gmail values:
- Host: `smtp.gmail.com`
- Port: `465` (Secure = true) OR `587` (Secure = false / STARTTLS)

### 3) Run
```bash
npm install
npm run dev
```

The Support page has a “Send a confidential message” form that posts to `/api/contact`.

## Add the Kiss Community MP4 (you do this manually)
1. Create folder: `public/videos/`
2. Put your video file here: `public/videos/kiss-community.mp4`
3. Refresh the site — it will load automatically.

