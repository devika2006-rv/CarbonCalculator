# CarbonCalculator
> **"Understand. Calculate. Reduce."**  
> *"Your Everyday Choices Shape Our Planet. Small Changes. Meaningful Impact."*

[![GitHub Repository](https://img.shields.io/badge/GitHub-devika2006--rv%2FCarbonCalculator-emerald?style=flat&logo=github)](https://github.com/devika2006-rv/CarbonCalculator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v22-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

A professional, full-stack sustainability technology and carbon awareness platform engineered for students, NSS volunteers, educators, and communities across Kerala and India.

Developed under the auspices of **Vidya Academy of Science and Technology (VAST)**, in collaboration with **Vidya NSS Units (101, 200, 663)** and the **APJAKTU NSS Energy Cell**.

---

## 🌟 Key Features

1. **Brand Identity & Vector Logo:**
   - Original sustainability mark combining a planetary sphere, carbon footprint path, and emerald leaf with crisp vector typography.
   - Fully responsive across mobile screens, tablets, desktops, headers, footers, and social preview metadata.

2. **Scientific Carbon Footprint Calculator:**
   - **6 Essential Activity Categories:** Electricity Consumption, Transportation, Food Habits, Plastic & Shopping, Waste Management, and Lifestyle & Cooking.
   - **Documented Emission Factors:** Sourced from the **Central Electricity Authority (CEA) v19 Baseline (0.716 kg CO2e/kWh)**, **ARAI / CPCB India vehicle standards**, and **IPCC AR6 Working Group III**.
   - **Detailed Outputs:** Daily kg CO2e, Monthly kg CO2e, Annual tonnes CO2e, category breakdowns, and personalized actionable recommendations.
   - **Live Charts & History:** Recharts visual category distribution and historical calculation comparisons.
   - **Methodology Transparency:** Dedicated Calculation Methodology section documenting scientific formulas and sources.

3. **Daily Green Challenges & Habit Gamification:**
   - 10+ actionable daily and weekly sustainability challenges (e.g., *Banish Phantom Loads*, *Carry Reusable Bottle*, *Source Segregation*, *Campus Energy Audit*).
   - Milestone badges (*Carbon Conscious*, *Plastic Free Pioneer*, *NSS Eco Warrior*, etc.).
   - Ethical gamification: clearly separates habit formation points from verified carbon offsets.

4. **Personalized "My Impact" Dashboard:**
   - User profile with category badge (Student, NSS Volunteer, Teacher, General Public).
   - Monthly and annual footprint projections, category donut breakdown, historical progression line charts, and unlocked badge shelf.
   - Clean, friendly empty states for new participants.

5. **Learn & Explore:**
   - 12 comprehensive sustainability educational guides tailored for campus awareness drives, complete with key facts, practical tips, real-world Kerala examples, and linked challenges.

6. **Community Participation & Institutional Leaderboard:**
   - Aggregated, privacy-guaranteed rankings by educational institution and district.
   - Strict privacy safeguards: individual names and personal calculation histories are never publicly exposed.

7. **About Us & Institutional Heritage:**
   - Complete institutional descriptions for Vidya Academy of Science and Technology (VAST), Vidya NSS (Units 101, 200, 663), and the APJAKTU NSS Energy Cell.
   - Official contact email: `tl24btcs0304@vidyaacademy.ac.in`
   - Verified Instagram links for Vidya NSS and APJAKTU NSS Energy Cell.

8. **Administrative Portal & Multi-Format Data Exports:**
   - Discreetly accessible via login page or footer.
   - Real database analytics (registered users, calculations, challenges, district distributions).
   - User directory with search, filters (district, category, institution), and data-removal request handling.
   - **Reports & Data Export Center:**
     - Download CSV (Users, Calculations, Institutions)
     - Download Multi-Sheet Excel Workbook (`.xlsx`)
     - Download Formatted Executive PDF Report (`.pdf`)
     - Download Raw SQLite Database Backup (`.db`)
     - Download Full JSON Database Dump (`.json`)

---

## 🛠️ Technology Stack & Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons
- **Backend:** Node.js, Express 5, Better-SQLite3 (WAL mode), JSON Web Tokens (JWT), Bcrypt.js
- **Exports Engine:** XLSX (SheetJS), jsPDF, jsPDF-AutoTable
- **Architecture:** Zero cloud vendor lock-in, zero monthly fees, zero database sleep pauses, 100% portable. Single unified process or split microservice compatible.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher (v22 recommended)
- [npm](https://www.npmjs.com/) v9 or higher
- [Git](https://git-scm.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/devika2006-rv/CarbonCalculator.git
cd CarbonCalculator
```

### 3. Install Dependencies
```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 4. Run Locally
```bash
npm run dev
```

This concurrently launches:
- **Backend API Server:** `http://localhost:5000`
- **Frontend Web Application:** `http://localhost:3000`

### 5. Default Administrative Access
- **Portal URL:** `http://localhost:3000` (click "Admin Access" on the login page or footer)
- **Admin Email:** `admin@vastenergycell.in`
- **Admin Password:** `vastEnergyCell@2026`

---

## 🌐 Live Production Deployment Guide

CarbonCalculator is engineered to deploy seamlessly as either a **Unified Full-Stack Web Service** (Recommended) or a **Split Frontend/Backend Architecture**.

### Option A: Render (Unified Full-Stack — Recommended)
Render provides free hosting that runs both the Node.js Express backend and the pre-built React frontend from a single unified HTTPS URL.

1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in with your GitHub account (**devika2006-rv**).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository**, choose `devika2006-rv/CarbonCalculator`.
4. Configure the service settings:
   - **Name:** `carboncalculator`
   - **Environment:** `Node`
   - **Region:** `Oregon (US West)` or `Frankfurt (EU)`
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
5. Under **Advanced / Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = *(Click Generate or enter a secure 32+ character random string)*
   - `ADMIN_EMAIL` = `admin@vastenergycell.in`
   - `ADMIN_PASSWORD` = `vastEnergyCell@2026`
6. Click **Create Web Service**.
7. Render will build the frontend, initialize the SQLite database, and deploy your live public website at `https://carboncalculator.onrender.com`.

> [!TIP]
> **Continuous Deployment:** Every future commit pushed to `https://github.com/devika2006-rv/CarbonCalculator` automatically triggers Render to build and deploy the update with zero downtime.

---

### Option B: Vercel (Frontend) + Render (Backend)

If you prefer hosting the React frontend on Vercel's global CDN:

1. **Deploy Backend on Render / Railway:**
   - Deploy `devika2006-rv/CarbonCalculator` as a web service.
   - Note the backend API URL (e.g., `https://carboncalculator-api.onrender.com`).
2. **Deploy Frontend on Vercel:**
   - Go to [Vercel](https://vercel.com/) and sign in with GitHub.
   - Click **Add New...** → **Project**.
   - Import `devika2006-rv/CarbonCalculator`.
   - Set **Root Directory** to `client`.
   - Under **Environment Variables**, add:
     - `VITE_API_BASE` = `https://carboncalculator-api.onrender.com/api`
   - Click **Deploy**.

---

## 🛡️ Security, Privacy & Compliance

- **No Brittle OTPs:** Standard, dependable email/password authentication and Google OAuth without external SMS/OTP gateway rate limits.
- **Bcrypt Encryption:** All user and administrative passwords are encrypted using bcrypt with salt rounds before database persistence.
- **Privacy First:** Only anonymized, aggregated institutional metrics are shown on the community leaderboard. Individual personal records are strictly private.
- **Right to be Forgotten:** Instant account and personal calculation record deletion capabilities are built-in.
- **Zero Secret Exposure:** All credentials, keys, and tokens remain strictly in environment variables outside client-side bundles.

---

## 🏛️ Institutional Accreditation

- **Institution:** Vidya Academy of Science and Technology (VAST), Thalakkottukara, Thrissur, Kerala
- **NSS Units:** Units 101, 200, 663
- **Affiliated Cell:** APJAKTU NSS Energy Cell
- **Official Contact:** `tl24btcs0304@vidyaacademy.ac.in`
