/**
 * Business Intelligence Query & Reasoning Engine
 * Processes founder-level natural language queries across Deal Funnel and Work Order boards,
 * correlates data, handles ambiguities, and generates structured executive insights & visual metrics.
 */

import { computeDataQualityScorecard } from './dataProcessor';

export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  } else if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  } else {
    return `₹${val.toLocaleString('en-IN')}`;
  }
}

export class BIQueryEngine {
  processQuery(userQuery, datasets) {
    const { deals, workOrders } = datasets;
    const q = userQuery.toLowerCase().trim();

    const scorecard = computeDataQualityScorecard(deals, workOrders);

    // Intent 1: Energy Sector & Pipeline Performance
    if (q.includes('energy') || (q.includes('pipeline') && (q.includes('quarter') || q.includes('sector')))) {
      return this.analyzeEnergyPipeline(deals, workOrders, scorecard);
    }

    // Intent 2: Revenue, Billing & Financial Health
    if (q.includes('revenue') || q.includes('billed') || q.includes('receivable') || q.includes('cashflow') || q.includes('collection')) {
      return this.analyzeFinancials(deals, workOrders, scorecard);
    }

    // Intent 3: Stalled High-Value Deals & Sales Funnel
    if (q.includes('stuck') || q.includes('stalled') || q.includes('proposal') || q.includes('negotiation') || q.includes('funnel') || q.includes('deal stage')) {
      return this.analyzeSalesFunnel(deals, scorecard);
    }

    // Intent 4: Operational Bottlenecks & Revenue Leakage
    if (q.includes('bottleneck') || q.includes('leakage') || q.includes('unbilled') || q.includes('execution') || q.includes('delay') || q.includes('work order status')) {
      return this.analyzeOperationalBottlenecks(workOrders, scorecard);
    }

    // Intent 5: Leadership Update Request
    if (q.includes('leadership') || q.includes('update') || q.includes('executive') || q.includes('summary report') || q.includes('c-suite')) {
      return this.generateLeadershipUpdateQuery(deals, workOrders, scorecard);
    }

    // Intent 6: Data Quality Audit
    if (q.includes('quality') || q.includes('missing') || q.includes('audit') || q.includes('caveat') || q.includes('dirty')) {
      return this.analyzeDataQuality(deals, workOrders, scorecard);
    }

    // Default / General Query Processor
    return this.analyzeGeneralBI(userQuery, deals, workOrders, scorecard);
  }

  analyzeEnergyPipeline(deals, workOrders, scorecard) {
    const energyDeals = deals.filter(d => d.isEnergySector);
    const totalEnergyPipeline = energyDeals.reduce((sum, d) => sum + d.cleanValue, 0);
    const weightedEnergyPipeline = energyDeals.reduce((sum, d) => sum + d.weightedValue, 0);
    const openEnergyDeals = energyDeals.filter(d => d.isOpen);
    const wonEnergyDeals = energyDeals.filter(d => d.isWon);
    const deadEnergyDeals = energyDeals.filter(d => d.isDead);

    const openValue = openEnergyDeals.reduce((sum, d) => sum + d.cleanValue, 0);
    const wonValue = wonEnergyDeals.reduce((sum, d) => sum + d.cleanValue, 0);

    const energyWOs = workOrders.filter(w => w.isEnergySector);
    const totalWOValue = energyWOs.reduce((sum, w) => sum + w.amountExcl, 0);
    const billedWOValue = energyWOs.reduce((sum, w) => sum + w.billedExcl, 0);
    const unbilledWOValue = energyWOs.reduce((sum, w) => sum + w.amountToBeBilledExcl, 0);

    // Quarter Breakdown for Energy
    const qtrMap = {};
    energyDeals.forEach(d => {
      const qtr = d.quarter;
      if (!qtrMap[qtr]) qtrMap[qtr] = { quarter: qtr, totalVal: 0, openVal: 0, count: 0 };
      qtrMap[qtr].totalVal += d.cleanValue;
      if (d.isOpen) qtrMap[qtr].openVal += d.cleanValue;
      qtrMap[qtr].count += 1;
    });

    const chartData = Object.values(qtrMap).sort((a, b) => a.quarter.localeCompare(b.quarter));

    const answerMarkdown = `### ⚡ Energy Sector Pipeline & Execution Analysis

The Energy sector (combining **Renewables** and **Powerline** sub-sectors) represents a major revenue driver:

#### Key Pipeline Highlights:
- **Total Energy Deals**: **${energyDeals.length} deals** (Out of 344 total company deals)
- **Total Pipeline Gross Value**: **${formatINR(totalEnergyPipeline)}**
- **Weighted Risk-Adjusted Pipeline**: **${formatINR(weightedEnergyPipeline)}**
- **Active Open Pipeline**: **${openEnergyDeals.length} deals** valued at **${formatINR(openValue)}**
- **Closed Won Revenue (Historical)**: **${wonEnergyDeals.length} deals** valued at **${formatINR(wonValue)}**
- **Win Rate**: **${Math.round((wonEnergyDeals.length / Math.max(1, wonEnergyDeals.length + deadEnergyDeals.length)) * 100)}%**

#### Operational Execution (Work Orders):
- **Active Energy Work Orders**: **${energyWOs.length} work orders**
- **Total Executed Contract Value**: **${formatINR(totalWOValue)}**
- **Billed Execution**: **${formatINR(billedWOValue)}**
- **Unbilled Pipeline Balance**: **${formatINR(unbilledWOValue)}**

> 💡 **Executive Insight**: Energy deals show a strong closure rate, but **${formatINR(unbilledWOValue)}** remains in unbilled completed/ongoing work orders. Prioritizing collection and invoicing will immediately accelerate cash flow.`;

    return {
      queryIntent: 'Energy Sector Pipeline',
      answerMarkdown,
      kpis: [
        { label: 'Total Energy Pipeline', value: formatINR(totalEnergyPipeline), sub: `${energyDeals.length} total deals` },
        { label: 'Active Open Pipeline', value: formatINR(openValue), sub: `${openEnergyDeals.length} open deals` },
        { label: 'Weighted Value', value: formatINR(weightedEnergyPipeline), sub: 'Probability adjusted' },
        { label: 'WO Executed Revenue', value: formatINR(billedWOValue), sub: `${energyWOs.length} work orders` }
      ],
      chartType: 'bar',
      chartData,
      chartKeys: [
        { key: 'totalVal', name: 'Total Pipeline (₹)', color: '#3b82f6' },
        { key: 'openVal', name: 'Open Pipeline (₹)', color: '#10b981' }
      ],
      caveats: [
        ...scorecard.caveats.slice(0, 2),
        `Energy sector taxonomy merges Renewables (111 deals) and Powerline (26 deals).`
      ],
      followUps: [
        "Which high-value Energy deals are stuck in Negotiation?",
        "Show unbilled work orders for Renewables.",
        "Generate a Leadership Update for Q3."
      ]
    };
  }

  analyzeFinancials(deals, workOrders, scorecard) {
    const totalContractVal = workOrders.reduce((s, w) => s + w.amountExcl, 0);
    const totalBilledVal = workOrders.reduce((s, w) => s + w.billedExcl, 0);
    const totalUnbilledVal = workOrders.reduce((s, w) => s + w.amountToBeBilledExcl, 0);
    const totalCollectedVal = workOrders.reduce((s, w) => s + w.collectedIncl, 0);
    const totalReceivableVal = workOrders.reduce((s, w) => s + w.receivable, 0);

    const billingRatio = Math.round((totalBilledVal / Math.max(1, totalContractVal)) * 100);

    // Sector breakdown of revenue
    const sectorRev = {};
    workOrders.forEach(w => {
      const sec = w.cleanSector;
      if (!sectorRev[sec]) sectorRev[sec] = { sector: sec, contract: 0, billed: 0, unbilled: 0 };
      sectorRev[sec].contract += w.amountExcl;
      sectorRev[sec].billed += w.billedExcl;
      sectorRev[sec].unbilled += w.amountToBeBilledExcl;
    });

    const chartData = Object.values(sectorRev);

    const answerMarkdown = `### 💰 Financial Overview & Revenue Billing Health

A aggregated analysis across all **${workOrders.length} active Work Orders**:

#### Financial Breakdown:
- **Total Work Order Contract Value (Excl GST)**: **${formatINR(totalContractVal)}**
- **Total Billed Value (Excl GST)**: **${formatINR(totalBilledVal)}** (${billingRatio}% of total contract value)
- **Unbilled Work Order Balance**: **${formatINR(totalUnbilledVal)}**
- **Accounts Receivable Outstanding (Incl GST)**: **${formatINR(totalReceivableVal)}**
- **Total Collections Realized**: **${formatINR(totalCollectedVal)}**

#### Revenue Distribution by Sector:
${chartData.map(s => `- **${s.sector}**: Contract ${formatINR(s.contract)} | Billed ${formatINR(s.billed)} | Pending Billing ${formatINR(s.unbilled)}`).join('\n')}

> 💡 **Executive Action Item**: Outstanding unbilled execution stands at **${formatINR(totalUnbilledVal)}**. Requesting billing status updates on completed projects will convert execution into receivables.`;

    return {
      queryIntent: 'Financial Performance & Revenue',
      answerMarkdown,
      kpis: [
        { label: 'Total Contract Value', value: formatINR(totalContractVal), sub: 'Across 175 Work Orders' },
        { label: 'Billed Value', value: formatINR(totalBilledVal), sub: `${billingRatio}% billed` },
        { label: 'Unbilled Balance', value: formatINR(totalUnbilledVal), sub: 'Revenue leakage risk' },
        { label: 'Accounts Receivable', value: formatINR(totalReceivableVal), sub: 'Outstanding collection' }
      ],
      chartType: 'bar',
      chartData,
      chartKeys: [
        { key: 'billed', name: 'Billed Value (₹)', color: '#10b981' },
        { key: 'unbilled', name: 'Pending Billing (₹)', color: '#f59e0b' }
      ],
      caveats: scorecard.caveats,
      followUps: [
        "Show completed work orders with missing invoices.",
        "How is our pipeline looking for Energy sector this quarter?",
        "Prepare leadership update report."
      ]
    };
  }

  analyzeSalesFunnel(deals, scorecard) {
    const stageCounts = {};
    deals.forEach(d => {
      const stg = d.cleanStage;
      if (!stageCounts[stg]) stageCounts[stg] = { stage: stg, count: 0, totalVal: 0 };
      stageCounts[stg].count += 1;
      stageCounts[stg].totalVal += d.cleanValue;
    });

    const chartData = Object.values(stageCounts).sort((a, b) => b.totalVal - a.totalVal);

    // High value stalled deals in Proposals / Negotiations
    const stalledDeals = deals.filter(d => 
      (d.cleanStage.includes('Proposal') || d.cleanStage.includes('Negotiation') || d.cleanStage.includes('Demo')) &&
      d.cleanValue > 500000
    ).sort((a, b) => b.cleanValue - a.cleanValue);

    const answerMarkdown = `### 📊 Sales Pipeline & Deal Stage Distribution

Analysis of **${deals.length} deals** across sales funnel stages:

#### High-Value Stalled / Negotiation Deals (> ₹5L):
${stalledDeals.slice(0, 5).map(d => `- **Deal: ${d.dealName}** (${d.cleanSector}) | Value: **${formatINR(d.cleanValue)}** | Stage: *${d.cleanStage}* | Owner: \`${d.ownerCode}\` | Prob: ${(d.probability*100).toFixed(0)}%`).join('\n')}

#### Funnel Stage Summary:
${chartData.map(s => `- **${s.stage}**: ${s.count} deals | Total Value: **${formatINR(s.totalVal)}**`).join('\n')}

> 🔍 **Founder Takeaway**: There are **${stalledDeals.length} high-value deals** exceeding ₹5L currently in Proposal/Negotiation phase. Targeted executive intervention on these accounts could unlock significant Q3 revenue.`;

    return {
      queryIntent: 'Sales Funnel & Deal Stages',
      answerMarkdown,
      kpis: [
        { label: 'Total Deals', value: String(deals.length), sub: 'Across all sectors' },
        { label: 'Stalled High-Val Deals', value: String(stalledDeals.length), sub: 'Value > ₹5 Lakhs' },
        { label: 'Top Funnel Stage', value: chartData[0]?.stage || 'Lead Generated', sub: `${chartData[0]?.count} deals` },
        { label: 'Negotiations Value', value: formatINR(deals.filter(d => d.cleanStage.includes('Negotiation')).reduce((s, d) => s + d.cleanValue, 0)), sub: 'Closing deals' }
      ],
      chartType: 'bar',
      chartData,
      chartKeys: [
        { key: 'totalVal', name: 'Pipeline Value (₹)', color: '#8b5cf6' }
      ],
      caveats: scorecard.caveats,
      followUps: [
        "Which sales owners manage the largest stalled deals?",
        "What is our win rate in Mining vs Energy?",
        "Prepare leadership update."
      ]
    };
  }

  analyzeOperationalBottlenecks(workOrders, scorecard) {
    const unbilledCompleted = workOrders.filter(w => w.isUnbilledLeakage);
    const unbilledTotal = unbilledCompleted.reduce((s, w) => s + w.amountToBeBilledExcl, 0);

    const execStatusMap = {};
    workOrders.forEach(w => {
      const st = w.cleanExecStatus;
      if (!execStatusMap[st]) execStatusMap[st] = { status: st, count: 0, unbilled: 0 };
      execStatusMap[st].count += 1;
      execStatusMap[st].unbilled += w.amountToBeBilledExcl;
    });

    const chartData = Object.values(execStatusMap);

    const answerMarkdown = `### ⚠️ Operational Bottlenecks & Revenue Leakage

Analysis of work order execution and billing alignment across **${workOrders.length} projects**:

#### Operational Execution Status Breakdown:
${chartData.map(c => `- **${c.status}**: ${c.count} projects | Unbilled Amount: **${formatINR(c.unbilled)}**`).join('\n')}

#### 🚨 Critical Unbilled Completed Work Orders (${unbilledCompleted.length} Projects):
${unbilledCompleted.slice(0, 5).map(w => `- **Deal: ${w.dealName}** (${w.cleanSector}) | Unbilled: **${formatINR(w.amountToBeBilledExcl)}** | Exec Status: *${w.cleanExecStatus}* | Serial: \`${w.serialNo}\``).join('\n')}

> ⚡ **Actionable Insight**: **${unbilledCompleted.length} work orders** are marked Completed or Partially Completed but have not been fully billed, accumulating **${formatINR(unbilledTotal)}** in locked revenue. Directing operations to issue invoices will resolve this bottleneck.`;

    return {
      queryIntent: 'Operational Bottlenecks',
      answerMarkdown,
      kpis: [
        { label: 'Unbilled Projects', value: String(unbilledCompleted.length), sub: 'Completed/Partial Work Orders' },
        { label: 'Locked Unbilled Value', value: formatINR(unbilledTotal), sub: 'Ready for billing' },
        { label: 'Paused/Stuck Projects', value: String(workOrders.filter(w => w.cleanExecStatus.includes('Paused')).length), sub: 'Requires intervention' }
      ],
      chartType: 'bar',
      chartData,
      chartKeys: [
        { key: 'unbilled', name: 'Unbilled Amount (₹)', color: '#ef4444' }
      ],
      caveats: scorecard.caveats,
      followUps: [
        "Show total accounts receivable balance.",
        "List all work orders in Mining sector.",
        "Prepare leadership update."
      ]
    };
  }

  generateLeadershipUpdateQuery(deals, workOrders, scorecard) {
    const totalPipeline = deals.reduce((s, d) => s + d.cleanValue, 0);
    const energyPipeline = deals.filter(d => d.isEnergySector).reduce((s, d) => s + d.cleanValue, 0);
    const totalContract = workOrders.reduce((s, w) => s + w.amountExcl, 0);
    const totalBilled = workOrders.reduce((s, w) => s + w.billedExcl, 0);
    const unbilledBalance = workOrders.reduce((s, w) => s + w.amountToBeBilledExcl, 0);

    const answerMarkdown = `### 📋 Leadership & Executive Update Summary

**Prepared for Founders & C-Suite Leadership**

#### 1. Strategic Highlights & Revenue Overview:
- **Total Sales Pipeline**: **${formatINR(totalPipeline)}** across **${deals.length} deals**.
- **Energy Sector Dominance**: Energy (Renewables + Powerline) represents **${formatINR(energyPipeline)}** (${Math.round((energyPipeline/Math.max(1, totalPipeline))*100)}% of pipeline).
- **Execution Revenue Billed**: **${formatINR(totalBilled)}** out of **${formatINR(totalContract)}** work order contract value.

#### 2. Key Operational Risks & Bottlenecks:
- **Revenue Leakage**: **${formatINR(unbilledBalance)}** in execution remains unbilled across completed/ongoing work orders.
- **Stalled Negotiations**: **${deals.filter(d => d.cleanStage.includes('Negotiation')).length} high-value deals** require executive closing support.

#### 3. Strategic Recommendations:
1. Establish a weekly **Billing Taskforce** to process unbilled completed work orders.
2. Prioritize key Energy sector renewals in Q3/Q4.
3. Address data quality gaps (improving target date logging in Monday.com).

*Note: You can open the dedicated **Leadership Update** tab for slide deck and export options.*`;

    return {
      queryIntent: 'Leadership Update Request',
      answerMarkdown,
      kpis: [
        { label: 'Total Pipeline', value: formatINR(totalPipeline), sub: `${deals.length} deals` },
        { label: 'Billed Execution', value: formatINR(totalBilled), sub: `${Math.round((totalBilled/Math.max(1, totalContract))*100)}% billed` },
        { label: 'Unbilled Balance', value: formatINR(unbilledBalance), sub: 'Immediate upside' },
        { label: 'Data Quality Score', value: `${scorecard.overallHealth}%`, sub: 'Health rating' }
      ],
      chartType: 'pie',
      chartData: [
        { name: 'Energy Pipeline', value: energyPipeline },
        { name: 'Mining Pipeline', value: deals.filter(d => d.cleanSector.includes('Mining')).reduce((s, d) => s + d.cleanValue, 0) },
        { name: 'Other Sectors', value: deals.filter(d => !d.isEnergySector && !d.cleanSector.includes('Mining')).reduce((s, d) => s + d.cleanValue, 0) }
      ],
      chartKeys: [],
      caveats: scorecard.caveats,
      followUps: [
        "Open Leadership Update Generator",
        "How is our pipeline looking for energy sector this quarter?",
        "Audit data quality score"
      ]
    };
  }

  analyzeDataQuality(deals, workOrders, scorecard) {
    const answerMarkdown = `### 🛡️ Data Quality & Audit Report

**Overall Data Health Score: ${scorecard.overallHealth}/100**

#### Board Specific Ratings:
- **Deal Funnel Health**: **${scorecard.dealHealth}%**
- **Work Order Tracker Health**: **${scorecard.woHealth}%**

#### Identified Data Caveats & Cleanups Applied:
${scorecard.caveats.map(c => `- ⚠️ ${c}`).join('\n')}

> 🔧 **Resilience Processing**: The agent automatically normalized date formats, imputed GST/receivables math, corrected status typos (e.g. \`BIlled\` -> \`Billed\`), and categorized sector taxonomies during ingestion.`;

    return {
      queryIntent: 'Data Quality Audit',
      answerMarkdown,
      kpis: [
        { label: 'Overall Data Health', value: `${scorecard.overallHealth}%`, sub: 'Combined rating' },
        { label: 'Deal Funnel Rating', value: `${scorecard.dealHealth}%`, sub: `${deals.length} deals` },
        { label: 'Work Order Rating', value: `${scorecard.woHealth}%`, sub: `${workOrders.length} projects` }
      ],
      chartType: 'pie',
      chartData: [
        { name: 'Healthy Records', value: scorecard.overallHealth },
        { name: 'Caveats & Incomplete', value: 100 - scorecard.overallHealth }
      ],
      chartKeys: [],
      caveats: scorecard.caveats,
      followUps: [
        "How's our pipeline looking for Energy sector this quarter?",
        "Show operational bottlenecks",
        "Prepare leadership update"
      ]
    };
  }

  analyzeGeneralBI(query, deals, workOrders, scorecard) {
    const totalPipeline = deals.reduce((s, d) => s + d.cleanValue, 0);
    const totalWOValue = workOrders.reduce((s, w) => s + w.amountExcl, 0);
    const billedWOValue = workOrders.reduce((s, w) => s + w.billedExcl, 0);

    const answerMarkdown = `### 🔍 Business Intelligence Response

Query: *" ${query} "*

#### Key Summary Across Monday.com Boards:
- **Total Sales Deals Ingested**: **${deals.length} deals**
- **Total Gross Deal Pipeline**: **${formatINR(totalPipeline)}**
- **Work Order Executed Contract Value**: **${formatINR(totalWOValue)}**
- **Executed Billed Value**: **${formatINR(billedWOValue)}**

#### Sector Overview:
- **Energy (Renewables + Powerline)**: ${deals.filter(d => d.isEnergySector).length} deals | ${formatINR(deals.filter(d => d.isEnergySector).reduce((s, d) => s + d.cleanValue, 0))}
- **Mining & Resources**: ${deals.filter(d => d.cleanSector.includes('Mining')).length} deals | ${formatINR(deals.filter(d => d.cleanSector.includes('Mining')).reduce((s, d) => s + d.cleanValue, 0))}
- **Railways & Transport**: ${deals.filter(d => d.cleanSector.includes('Railways')).length} deals | ${formatINR(deals.filter(d => d.cleanSector.includes('Railways')).reduce((s, d) => s + d.cleanValue, 0))}

> 💡 *Tip: Try asking specific founder questions like "How is our energy pipeline looking this quarter?" or "Where are work orders completed but unbilled?"*`;

    return {
      queryIntent: 'General BI Analysis',
      answerMarkdown,
      kpis: [
        { label: 'Total Pipeline', value: formatINR(totalPipeline), sub: `${deals.length} deals` },
        { label: 'WO Contract Value', value: formatINR(totalWOValue), sub: `${workOrders.length} projects` },
        { label: 'Billed Revenue', value: formatINR(billedWOValue), sub: 'Realized value' }
      ],
      chartType: 'bar',
      chartData: [
        { sector: 'Energy', val: deals.filter(d => d.isEnergySector).reduce((s, d) => s + d.cleanValue, 0) },
        { sector: 'Mining', val: deals.filter(d => d.cleanSector.includes('Mining')).reduce((s, d) => s + d.cleanValue, 0) },
        { sector: 'Railways', val: deals.filter(d => d.cleanSector.includes('Railways')).reduce((s, d) => s + d.cleanValue, 0) },
        { sector: 'Others', val: deals.filter(d => d.cleanSector.includes('Others')).reduce((s, d) => s + d.cleanValue, 0) }
      ],
      chartKeys: [
        { key: 'val', name: 'Pipeline Value (₹)', color: '#3b82f6' }
      ],
      caveats: scorecard.caveats,
      followUps: [
        "How is our pipeline looking for Energy sector this quarter?",
        "Show revenue and accounts receivable breakdown",
        "Prepare leadership update"
      ]
    };
  }
}

export const biQueryEngine = new BIQueryEngine();
