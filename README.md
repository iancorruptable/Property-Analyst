# Property Analyst — Real Estate Command Center

Interactive React dashboard for tracking, analyzing, and managing a rental property.

**Property:** 9577 Naples Lane, Navarre, FL 32566

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Features

- **Executive Dashboard** — KPIs, alerts, traffic-light status indicators
- **Data Intake Form** — 7-section wizard to enter all property data
- **Cash Flow Analysis** — NOI calculator, break-even rent, vacancy stress tests, rent sensitivity
- **VA Entitlement Tracker** — Remaining entitlement, future buying power scenarios
- **Mortgage & Equity** — Loan tracking, equity visualization, LTV monitoring
- **Property Profile** — Editable property details and HOA information
- **Rent-Readiness Checklist** — 35-item interactive checklist
- **Alerts & Deadlines** — Consolidated alert center with FL-specific deadlines

## Tech Stack

- React 19 + Vite
- Tailwind CSS 4
- React Router 7
- Recharts (charts/visualizations)
- Lucide React (icons)
- localStorage for data persistence

## Data Storage

All data is stored in your browser's localStorage. No server or database required.
Data persists between sessions automatically.

## Architecture

```
src/
├── components/     # Reusable UI components (Card, FormField, Layout, StatusBadge)
├── pages/          # Page components for each module
├── store/          # PropertyContext (React Context + useReducer + localStorage)
└── utils/          # Calculation functions (cash flow, VA entitlement, depreciation)
```
