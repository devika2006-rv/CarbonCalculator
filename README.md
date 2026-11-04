# CarbonCalculator
> **"Understand. Calculate. Reduce."**  
> *"Your Everyday Choices Shape Our Planet. Small Changes. Meaningful Impact."*

A professional, full-stack sustainability technology and carbon awareness platform engineered for students, NSS volunteers, educators, and communities across Kerala and India.

Developed under the auspices of **Vidya Academy of Science and Technology (VAST)**, in collaboration with **Vidya NSS Units (101, 200, 663)** and the **APJAKTU NSS Energy Cell**.

---

## 🌟 Key Features

1. **Brand Identity & Vector Logo:**
   - Original sustainability mark combining a planetary sphere, carbon footprint path, and emerald leaf with crisp vector typography.
   - Fully responsive on mobile, desktop, headers, and footers.

2. **Scientific Carbon Footprint Calculator:**
   - 6 Essential Categories: Electricity Consumption, Transportation, Food Habits, Plastic & Shopping, Waste Management, and Lifestyle & Cooking.
   - Authoritative emission factors sourced from the **Central Electricity Authority (CEA) v19 Baseline (0.716 kg CO2e/kWh)**, **ARAI / CPCB India vehicle standards**, and **IPCC AR6 Working Group III**.
   - Outputs: Daily kg CO2e, Monthly kg CO2e, Annual tonnes CO2e, category breakdowns, and personalized actionable recommendations.
   - Live visual charts with Recharts and historical timeline comparison.
   - Documented Calculation Methodology section explaining scientific sources and formulas.

3. **Daily Green Challenges & Habit Gamification:**
   - 10+ tangible daily and weekly sustainability challenges (e.g. *Banish Phantom Loads*, *Carry Reusable Bottle*, *Source Segregation*, *Campus Energy Audit*).
   - Milestone badges (*Carbon Conscious*, *Plastic Free Pioneer*, *NSS Eco Warrior*, etc.).
   - Gamification transparency: clearly distinguishes habit formation points from verified carbon offsets.

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
   - Discreetly accessible via footer or `/admin`.
   - Real database analytics (registered users, calculations, challenges, district distributions).
   - User directory with search, filters (district, category, institution), and data-removal request handling.
   - **Reports & Data Export Center:**
     - Download CSV (Users, Calculations, Institutions)
     - Download Multi-Sheet Excel Workbook (`.xlsx`)
     - Download Formatted Executive PDF Report (`.pdf`)
     - Download Raw SQLite Database Backup (`.db`)
     - Download Full JSON Database Dump (`.json`)

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons
- **Backend:** Node.js, Express, Better-SQLite3 (WAL mode), JSON Web Tokens (JWT), Bcrypt.js
- **Exports Engine:** XLSX (SheetJS), jsPDF, jsPDF-AutoTable
- **Architecture:** Zero cloud vendor lock-in, zero monthly fees, zero database sleep pauses, 100% portable.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v18 or higher (v22 recommended)
- npm v9 or higher

### 2. Start the Application
From the project root (`carboncalculator/`), simply run:

```bash
npm run dev
```

This concurrently launches:
- **Backend API Server:** `http://localhost:5000`
- **Frontend Web Application:** `http://localhost:3000`

### 3. Default Administrative Access
- **Portal URL:** `http://localhost:3000` (click "Admin Access" in the footer)
- **Admin Email:** `admin@vastenergycell.in`
- **Admin Password:** `vastEnergyCell@2026`

---

## 🛡️ Security & Privacy Notice
- **No OTP Friction:** Authentication uses standard, reliable email/password verification and Google OAuth integration without brittle email OTPs.
- **Privacy First:** Only aggregated institutional metrics are shown publicly.
- **Right to be Forgotten:** Full account and data deletion capabilities are implemented for user privacy compliance.
