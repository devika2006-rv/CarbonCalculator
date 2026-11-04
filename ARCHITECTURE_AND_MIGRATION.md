# CarbonCalculator Architecture, Backend Evaluation & Database Migration Guide
**Platform:** CarbonCalculator  
**Prepared For:** VAST Energy Cell (NSS Units 101, 200, 663) | APJAKTU NSS Energy Cell  

---

## 1. Executive Summary & Problem Context
During previous environmental and institutional digital campaigns, platforms encountered disruptive outages and sudden account suspensions due to cloud backend providers reaching arbitrary usage thresholds (e.g. daily read/write limits, concurrent connection caps, or automatic database pausing after short periods of inactivity).

When environmental awareness workshops take place in schools and engineering colleges, hundreds of students, NSS volunteers, and attendees access the calculator simultaneously. A platform relying on low-cap cloud tiers risks returning `HTTP 429 (Too Many Requests)` or `HTTP 500` errors, rendering the awareness program unusable.

To solve this permanently, CarbonCalculator was engineered with a **zero-vendor-lock-in, zero-arbitrary-limit, portable relational architecture**.

---

## 2. Backend Evaluation & Comparative Analysis

| Feature / Metric | **Selected Architecture (Node/Express + SQLite / Embedded SQL)** | **Supabase (Free Tier)** | **Google Firebase (Spark Free Tier)** | **Managed Cloud PostgreSQL (e.g., Render/Neon/Railway)** |
| :--- | :--- | :--- | :--- | :--- |
| **Vendor Lock-in** | **0% (100% Open & Portable)** | High (Proprietary GoTrue auth, PostgREST) | High (Firestore SDK, proprietary rules) | Low (Standard SQL) |
| **Usage / Request Limits** | **Unlimited (Hardware capacity only)** | Max 500 MB DB, 2 concurrent direct pools, 50,000 monthly active users | 50,000 document reads/day, 20,000 writes/day, 1 GB storage | 0.5 GB - 1 GB free, compute hours capped |
| **Inactivity Inconvenience** | **Never pauses** | **Auto-pauses after 7 days of inactivity** (restoration takes minutes and drops live sessions) | Quotas reset at midnight Pacific Time; locks out if exceeded during workshops | May spin down or sleep on free tiers (cold starts) |
| **Unexpected Cost Risk** | **$0 / month forever** (Self-hosted / VPS / Campus intranet / Render) | Jumps to $25/mo Pro tier once limits or unpausing needed | Pay-as-you-go Blaze plan required when daily write bursts spike | $7 - $20/month if sustained connections exceed free tier |
| **Database Portability** | Single binary file (`.db`) + instant SQL dump + live JSON dump | Requires `pg_dump` with cloud access credentials | Proprietary NoSQL export via Google Cloud Storage | Standard `pg_dump` |
| **Offline / Campus Capability** | Can run locally on a college laptop or local intranet server without internet! | Impossible (requires internet to reach Supabase API) | Impossible (requires internet to reach Firebase API) | Impossible (requires internet connection) |

### Why This Architecture Was Selected
1. **Zero Quota Risk During Live Seminars:** The database runs directly with `better-sqlite3` in WAL (Write-Ahead Logging) mode, offering microsecond read/write execution with ACID compliance and zero external API roundtrips.
2. **True Data Ownership:** The VAST Energy Cell retains complete ownership of all participant data. Single-click database backup downloads (`.db` binary and `.json` dump) are built into the Admin Panel.
3. **No Database Sleep:** Unlike Supabase, which automatically pauses free databases after 7 days of inactivity, CarbonCalculator remains 100% functional even if inactive for months between semester campaigns.
4. **Portability to PostgreSQL:** All tables, relationships, and queries are written in ANSI SQL standards. If the college later deploys to a dedicated PostgreSQL cluster, the schema migrates without modifying business logic.

---

## 3. Database Schema & Relational Design

The database contains 8 core relational entities:

1. `users`: Stores registered students, NSS volunteers, teachers, and administrators. Passwords hashed using bcrypt (10 rounds).
2. `carbon_calculations`: Historical footprint calculations containing daily, monthly, and annual kg/tonnes CO2e, category breakdowns, and raw inputs JSON.
3. `challenges`: Curated catalog of daily and weekly green actions, difficulty ratings, environmental benefit descriptions, and gamification points.
4. `user_challenge_completions`: Log of every challenge completed by users with timestamps and earned points.
5. `user_points`: Aggregated green points table per user for O(1) leaderboard queries.
6. `user_badges`: Gamified achievement badges unlocked by users (e.g. *Carbon Conscious*, *Plastic Free Pioneer*, *NSS Eco Warrior*).
7. `emission_factors`: Documented scientific emission factors with government/IPCC sources and assumptions.
8. `enquiries`: Feedback, campus awareness invitations, and general suggestions submitted through the contact module.

---

## 4. Live Database Backup & Disaster Recovery

CarbonCalculator provides three distinct recovery and backup layers built directly into the administrative portal:

### A. Raw Database Download (.db Binary)
- Endpoint: `GET /api/admin/backup/db` (Admin authorized)
- Downloads the exact `carboncalculator.db` file.
- **Recovery:** To restore, simply place `carboncalculator-backup.db` into the `server/` directory and rename it to `carboncalculator.db`. The application resumes immediately with all records intact.

### B. Full JSON Snapshot
- Endpoint: `GET /api/admin/backup/json` (Admin authorized)
- Exports every table as structured JSON with metadata and export timestamps.
- Highly portable for ingestion into MongoDB, Firebase, or external analytics engines.

### C. Multi-Format Tabular Exports
- CSV: `GET /api/admin/export/csv?type=users|calculations|institutions`
- Excel: `GET /api/admin/export/xlsx` (Multi-sheet workbook with Users, Calculations, Institutions, Challenges)
- PDF: `GET /api/admin/export/pdf` (Official formatted summary for campus reporting)

---

## 5. Migration Guide: Moving to PostgreSQL or Firebase (If Required)

### A. Migrating to PostgreSQL
If the institution deploys CarbonCalculator to a cloud PostgreSQL database (e.g., Supabase Pro, Neon, AWS RDS, or an on-campus PostgreSQL server):

1. **Install pg driver:**
   ```bash
   cd server
   npm install pg
   ```
2. **Export current SQLite data to SQL:**
   Using the built-in JSON backup or standard sqlite3 CLI:
   ```bash
   sqlite3 carboncalculator.db .dump > backup.sql
   ```
3. **Database Adapter Switch:**
   Create `server/db_postgres.js` with `new Pool({ connectionString: process.env.DATABASE_URL })`. The schema in `server/db.js` uses standard SQL types (`INTEGER`, `TEXT`, `REAL`, `DATETIME`) which are directly compatible with PostgreSQL (`SERIAL`, `VARCHAR`, `DOUBLE PRECISION`, `TIMESTAMP`).

### B. Migrating to Firebase (Firestore + Firebase Auth)
If moving to Firebase:
1. **Initialize Firebase Admin:**
   ```bash
   cd server
   npm install firebase-admin
   ```
2. **Mapping Relational Entities to Firestore Collections:**
   - `users` table -> `/users/{userId}` documents.
   - `carbon_calculations` table -> `/users/{userId}/calculations/{calcId}` subcollections.
   - `user_challenge_completions` table -> `/completions/{completionId}` collection.
3. **Quotas to Monitor on Firebase Spark Plan:**
   - 50,000 document reads/day
   - 20,000 document writes/day
   - *Note:* Exceeding these during college workshops will lock the database until midnight Pacific Time unless upgraded to the Blaze pay-as-you-go plan.

---

## 6. Security & Credential Protection
1. **Zero Hardcoded Secrets:** JWT secrets, database connection strings, and administrative setup keys reside exclusively in `server/.env` and environment variables.
2. **Password Security:** Passwords are never stored in plain text. Bcrypt with 10 salt rounds is applied before insertion. Passwords are never included in API responses or export files.
3. **Role-Based Access Control (RBAC):** Normal user tokens cannot access `/api/admin/*` endpoints. Authorization is verified at the Express middleware layer (`requireAdmin`), not just hidden in the frontend.
