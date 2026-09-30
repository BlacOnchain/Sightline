# Sightline

> **Know where your brand shows up.**  
> Track whether and how your brand appears in search answers with live grounding.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)

Sightline gives marketing, product, and brand leaders continuous visibility into search answer engines. By executing tracked customer queries against search-grounded models, Sightline determines whether your brand was cited, its rank order among competitors, which sources were referenced, and your overall Share of Voice (SoV).

---

## Screenshots & Interface

```
+-----------------------------------------------------------------------------------------+
| SIGHTLINE   [ Workspace: Northwind Kids v ]   [ + Run All ]   [ Theme ]  [ User Profile ]|
+-----------------------------------------------------------------------------------------+
| // 01. OVERVIEW                                                            Period: [ 30d v ] |
|                                                                                         |
|  [ VISIBILITY SCORE ]    [ AVERAGE POSITION ]   [ SHARE OF VOICE ]    [ RUNS THIS PERIOD ]  |
|         78%                     1.8                    42%                     124          |
|      +6% vs prev            -0.4 vs prev           +8% vs prev             +18 vs prev      |
+-----------------------------------------------------------------------------------------+
|  VISIBILITY TREND OVER TIME                  |  SHARE OF VOICE: OWN VS COMPETITORS      |
|  100% |     .---.        .--.                |  Northwind Kids  [======== 42% ========] |
|   50% | .--'     '--.---'                    |  BrightSteps     [===== 24% =====]       |
|    0% +-----------------------------         |  PlayStudy       [=== 16% ===]           |
+-----------------------------------------------------------------------------------------+
|  RECENT RUNS                                 |  TOP CITED SOURCES                       |
|  Query: "screen time reward apps" | Pos: 1   |  1. nytimes.com/wirecutter (28 citations)|
|  Query: "math games for 8 year olds" | Pos: 2|  2. commonsensemedia.org   (19 citations)|
+-----------------------------------------------------------------------------------------+
```

---

## Key Features

- **Search-Grounded Tracking**: Leverages real search grounding to synthesize factual answers with live web citations.
- **Deterministic Mention Detection**: Employs boundary-aware, case-insensitive whole-word matching against your brand name and configured aliases. Does not rely on unpredictable models to self-evaluate mentions.
- **Automated Scheduling & Cron**: Background automation executes due queries on daily or weekly schedules using an authenticated `/api/cron/run-due` endpoint.
- **Share of Voice & Position Ranking**: Computes 1-indexed order of appearance, visibility percentages, and competitor benchmark comparisons.
- **Domain Citation Analytics**: Identifies which authoritative publications, review sites, and domains are cited most often in your category.
- **Multi-Role Workspaces (RBAC)**: Supports `Owner`, `Analyst`, and `Viewer` roles backed by Firebase Security Rules and backend token verification.
- **Interactive Sample Demo**: Pre-loaded fictional workspace ("Paystack") with 8 weeks of realistic runs and single-click cleanup.
- **Reports & Exporting**: Generate periodic summaries with CSV export and browser print stylesheets optimized for Save as PDF.
- **Keyboard Navigation**: Power-user hotkeys (`g o` for Overview, `g q` for Queries, `/` to focus search, `?` for shortcuts modal).

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, Motion |
| **Backend** | Node.js, Express, TypeScript (`tsx`) |
| **AI & Grounding** | Grounded search evaluation |
| **Database & Auth** | Google Cloud Firestore, Firebase Authentication (Google Sign-In), Firebase Admin SDK |
| **Design System** | Custom calm palette, Hanken Grotesk and Newsreader typography, tabular numerals |

---

## Architecture Summary

```
[ Browser Client ]
        │  ▲
        │  │ Firebase Client SDK (Real-time Firestore listeners & Auth)
        ▼  │
[ Express Backend Server (/api/*) ]
   ├── Authentication & RBAC Middleware (ID Token check)
   ├── Rate Limiting Middleware (Sliding Window token bucket)
   ├── Query Runner Service (Concurrency pool limit: 3)
   ├── Deterministic Brand Mention Detector
   └── Firebase Admin SDK
        │  ▲
        ▼  │ Server-side API Calls (No client keys)
[ Grounded Search Evaluation Model ]
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details, sequence diagrams, and mathematical metric formulas.

---

## Setup & Local Development

### 1. Prerequisites
- Node.js 20+ installed
- A Google Cloud / Firebase project with Firestore and Authentication (Google Provider) enabled
- A search evaluation API key

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/BlacOnchain/sightline.git
cd sightline
npm install
```

### 3. Environment Variables
Create a local `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Configure the following variables in `.env`:
```env
# API Key (Server-side only - never exposed to client)
GEMINI_API_KEY="your_actual_api_key"

# Secret token for authenticating background cron runs
CRON_SECRET="your_long_random_cron_secret_string"

# Application URL
APP_URL="http://localhost:3000"

# Optional: Port configuration (default is 3000)
PORT=3000
```

### 4. Running the Development Server
```bash
npm run dev
```
The app will start on `http://localhost:3000`.

### 5. Running Tests
Execute the unit test suite covering mention detection, position ranking, visibility score, share of voice, and scheduling:
```bash
npm test
```

### 6. Production Build & Deployment
Build client assets and start the production server:
```bash
npm run build
npm start
```

---

## Scheduling Automated Runs with Google Cloud Scheduler

Sightline provides a dedicated endpoint (`POST /api/cron/run-due`) to execute scheduled queries whose `nextRunAt` timestamp has elapsed.

You can set up a recurring cron job in seconds using Google Cloud Scheduler:

```bash
# Create a daily Cloud Scheduler job triggering at 04:00 UTC
gcloud scheduler jobs create http sightline-daily-runner \
    --schedule="0 4 * * *" \
    --time-zone="UTC" \
    --uri="https://your-sightline-app.run.app/api/cron/run-due" \
    --http-method=POST \
    --headers="x-cron-secret=your_long_random_cron_secret_string" \
    --description="Executes due daily and weekly brand queries in Sightline"
```

The endpoint uses constant-time token comparison (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.

---

## Known Limitations

- **Search Grounding Dependency**: Results originate from the evaluation engine with search grounding. Grounded search synthesis reflects live web search indexing and may differ from other answer engines or general conversational outputs.
- **Rate Limits**: Free-tier API quotas may limit massive bulk queries. Sightline includes an internal concurrency pool limit of 3 concurrent requests and sliding-window rate limiters to avoid quota exhaustion.
- **Language**: Current brand mention detection is optimized for Latin-script brand names and aliases.

---

## Product Roadmap

- [ ] **LinkedIn Analytics Import**: Correlate answer visibility surges with social executive engagement and profile impressions.
- [ ] **Content Calendar & Assisted Publishing**: Generate targeted content briefs addressing the authoritative sources citing competitors.
- [ ] **Automated Weekly Email Reports**: Scheduled digest emails delivering visibility score deltas and newly cited domains directly to inbox.
- [ ] **Multi-Model Grounding Comparison**: Compare citations across different search engines and conversational models.

---

## Contributing

Contributions, bug reports, and suggestions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on code style, testing requirements, and submission processes.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
