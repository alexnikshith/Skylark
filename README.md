# 🦅 Skylark Drones - Monday.com Business Intelligence Agent

An executive-grade Business Intelligence AI Agent and Web Application built for founders and leadership teams. Integrates with **Monday.com** boards containing Work Orders and Deal Funnel data, normalizes real-world messy data, processes complex natural language queries, and prepares leadership updates.

---

## 🌟 Key Features

### 1. 🤖 Conversational Founder BI Agent
- **Natural Language Query Engine**: Answers executive questions such as:
  - *"How is our pipeline looking for energy sector this quarter?"*
  - *"What is our total revenue, billed amount, and accounts receivable balance?"*
  - *"Which deals are high value but stuck in proposal or negotiation phase?"*
  - *"Where are work orders completed but unbilled?"*
- **Rich Visual Responses**: Formats responses with KPI metric cards, embedded interactive Recharts graphics, data quality warnings, and follow-up prompts.

### 2. 🛡️ Data Resilience & Normalization Pipeline
- **Sector Taxonomy Normalization**: Standardizes sector taxonomies (`Renewables` + `Powerline` $\rightarrow$ `Energy`).
- **Date Normalization**: Standardizes dates across ISO strings, `YYYY-MM-DD`, `DD/MM/YYYY`, and Excel timestamp serials into unified Quarter tags (`Q1 2025` - `Q1 2026`).
- **Typo & Status Cleanups**: Auto-corrects typos (e.g. `BIlled` $\rightarrow$ `Billed`, `Pause / struck` $\rightarrow$ `Paused / Stuck`).
- **Data Quality Scorecard**: Computes real-time health ratings and flags data caveats.

### 3. 🔌 Monday.com Integration Layer
- **Live GraphQL v2 API Integration**: Connects to `https://api.monday.com/v2` with Personal API Token and Board IDs.
- **Dynamic Ingested Boards Mode**: Out-of-the-box support loaded with pre-cleaned Deal Funnel (344 deals) and Work Order Tracker (175 work orders) datasets so the app works instantly without manual setup.
- **GraphQL Console**: Built-in query editor to execute raw GraphQL queries against Monday.com.

### 4. 📋 Leadership Update Generator
- **Executive Presentation Deck**: 4-slide carousel tailored for founder and C-suite meetings.
- **1-Click PDF & Markdown Export**: Download executive PDF updates or copy clean Markdown for email/Slack briefings.

---

## 🛠️ Architecture Overview

```
 ┌─────────────────────────────────────────────────────────┐
 │                   React UI Application                  │
 │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │
 │   │ Agent Chat  │   │ Dashboard   │   │ Leadership  │   │
 │   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   │
 └──────────┼─────────────────┼─────────────────┼──────────┘
            │                 │                 │
 ┌──────────▼─────────────────▼─────────────────▼──────────┐
 │              BI Query Engine & NL Parser                │
 │       (Intent Classifier & Metric Calculator)           │
 └────────────────────────────┬────────────────────────────┘
                              │
 ┌────────────────────────────▼────────────────────────────┐
 │               Data Processor & Resilience               │
 │ (Date Normalizer, Sector Mapping, Health Scorecard)     │
 └─────────────┬─────────────────────────────┬─────────────┘
               │                             │
 ┌─────────────▼────────────┐   ┌────────────▼─────────────┐
 │ Monday.com GraphQL Client│   │ Local Dynamic Sample Data│
 │ (api.monday.com/v2 POST) │   │ (src/data/sampleData.json│
 └──────────────────────────┘   └──────────────────────────┘
```

---

## 🚀 Setup & Local Execution Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Installation
```bash
# Clone or extract repository
cd skylark

# Install dependencies
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 📑 Monday.com Configuration Guide

### Option A: Testing Out-of-the-Box (Recommended for Evaluation)
No API key required! The app loads pre-parsed, cleaned data from `Deal funnel Data.xlsx` and `Work_Order_Tracker Data.xlsx`.

### Option B: Connecting Live Monday.com Boards
1. Log in to your **Monday.com** account.
2. Click **+ Add** $\rightarrow$ **Import Data** $\rightarrow$ **Excel**.
   - Import `Deal funnel Data.xlsx` as a new board named **Deals Board**.
   - Import `Work_Order_Tracker Data.xlsx` as a new board named **Work Orders Board**.
3. Retrieve your API Token:
   - Click avatar $\rightarrow$ **Developers** $\rightarrow$ **My Access Tokens**.
4. Open the **Monday API** tab in the app and enter:
   - **Personal API Token**
   - **Deals Board ID** (extracted from board URL)
   - **Work Orders Board ID** (extracted from board URL)
5. Click **Save Credentials & Sync**.

---

## 📂 Project Structure

```
skylark/
├── DECISION_LOG.md               # Official 2-page Technical Decision Log
├── README.md                     # Documentation & Setup instructions
├── parse_excel.py                # Python parser for dataset extraction
├── Deal funnel Data.xlsx         # Original Deal Funnel dataset
├── Work_Order_Tracker Data.xlsx  # Original Work Order dataset
├── package.json
├── index.html
├── src/
│   ├── App.jsx                   # Main application router and state
│   ├── main.jsx                  # React DOM entrypoint
│   ├── index.css                 # Global CSS and utility styles
│   ├── data/
│   │   └── sampleData.json       # Parsed datasets JSON
│   ├── services/
│   │   ├── dataProcessor.js      # Data cleaning & normalization engine
│   │   ├── mondayApi.js          # Monday.com GraphQL API client
│   │   └── biQueryEngine.js      # BI Query & Intent Solver engine
│   └── components/
│       ├── Header.jsx            # Top navbar and status badges
│       ├── AgentChat.jsx         # Conversational Agent UI
│       ├── Dashboard.jsx         # Visual BI Dashboard with Recharts
│       ├── LeadershipUpdate.jsx  # Executive report & PDF generator
│       ├── MondayConfig.jsx      # Monday GraphQL API setup console
│       └── DecisionLogView.jsx   # Interactive Decision Log viewer
```

---

## 📜 License & Credits
Built for **Skylark Drones - Business Intelligence Agent Assignment**.
