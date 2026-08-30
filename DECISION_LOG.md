# 📑 Decision Log - Monday.com Business Intelligence Agent

**Company**: Skylark Drones  
**Project**: Technical Assignment - Monday.com Founder BI Agent  
**Author**: AI Agent / Antigravity Engineering  
**Length**: 2 Pages Max  

---

## 1. Key Assumptions Made

### a) Energy Sector Taxonomy & Scope
- **Interpretation**: In executive queries such as *"How's our pipeline looking for energy sector this quarter?"*, founders expect a unified view across all energy-related sub-sectors.
- **Implementation**: The data processor merges both `Renewables` (111 deals in dataset) and `Powerline` (26 deals in dataset) under the `Energy (Renewables & Power)` umbrella, while maintaining sub-sector drill-down capabilities.

### b) Handling Missing Data & Financial Imputations
- **Problem**: 181 out of 344 deals in the Deal Funnel lack explicit `Masked Deal value`, and 318 deals lack `Close Date (A)`. In Work Orders, `Billed Value Excl GST` is missing in 63 rows.
- **Solution**:
  - Deals without monetary values are retained for volume/stage funnel metrics, but excluded from sum totals unless estimated.
  - Risk-weighted pipeline is calculated via: $\text{Weighted Value} = \text{Masked Deal Value} \times \text{Closure Probability}$.
  - Incomplete dates fall back gracefully: `Actual Close Date` $\rightarrow$ `Tentative Close Date` $\rightarrow$ `Created Date`.

### c) Operational Revenue Leakage Definition
- **Definition**: Revenue leakage is defined as Work Orders where `Execution Status` is `Completed` or `Partially Completed`, but `Billing Status` is not `Billed` and unbilled balance $> 0$.
- **Finding**: Identified 12+ completed projects representing substantial locked revenue pending invoice issuance.

---

## 2. Technical Trade-offs Chosen & Rationale

| Decision | Option Chosen | Alternative Considered | Rationale & Trade-off |
| :--- | :--- | :--- | :--- |
| **Monday.com Integration** | **Hybrid Live API + Ingested Dynamic Boards** | Live API Only | Live API only would block evaluation if API key is not supplied. Hybrid mode supports live GraphQL API (`https://api.monday.com/v2`) and is 100% testable instantly out-of-the-box. |
| **NL & BI Query Architecture** | **Intent Classification + Deterministic Solvers** | Raw Unconstrained LLM Generation | Financial BI requires 100% mathematical precision. Hallucinating financial totals to founders is unacceptable. Intent classification maps queries to audited calculation engines. |
| **State & Storage** | **Client-side Reactive Memory + Dynamic JSON Ingestion** | Full External Database (Postgres) | Reduces latency, guarantees fast sub-second query responses, and enables zero-dependency hosting. |

---

## 3. Leadership Updates - Interpretation & Implementation

### How We Interpreted "Leadership Updates"
Founders and C-suite executives regularly spend hours synthesizing raw operational tables into slide decks, financial metrics, and executive bullet points for weekly board syncs and leadership updates.

### Implementation Features
1. **Executive Slide Carousel**: 4-slide interactive slide deck summarizing revenue, sector performance, unbilled execution risks, and high-value deal targets.
2. **Multi-Format Exports**: 1-click **Export Executive PDF Report**, **Copy Markdown Briefing** (for email/Slack/Monday Docs), and CSV metrics export.
3. **Actionable Risk Highlights**: Automatic highlighting of top unbilled work orders and stalled negotiation deals requiring executive closing support.

---

## 4. What We Would Do Differently With More Time

1. **Monday.com Real-time Webhooks**: Implement webhook listeners (`change_column_value`, `create_item`) to automatically refresh BI analytics without page reloads.
2. **Predictive Revenue Forecasting**: Build Monte Carlo probabilistic revenue models incorporating historical win rates and average deal cycle durations.
3. **Automated Slack/Teams Push Alerts**: Send proactive alerts to founders when unbilled execution balance exceeds ₹50 Lakhs or when a high-value deal is stalled for >30 days.

---
*Report generated for Skylark Drones Technical Assignment.*
