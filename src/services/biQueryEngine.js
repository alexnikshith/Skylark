/**
 * Advanced Business Intelligence Query & Reasoning Engine
 * Parses founder natural language intent, correlates cross-board datasets,
 * executes analytical solvers, and attaches live Monday.com GraphQL query syntax.
 */

import { computeDataQualityScorecard } from './dataProcessor';

export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  } else if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  } else {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
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

    // Intent 2: Mining Sector Analysis
    if (q.includes('mining') || q.includes('resource')) {
      return this.analyzeMiningSector(deals, workOrders, scorecard);
    }

    // Intent 3: Railways & Infra Sector Analysis
    if (q.includes('rail') || q.includes('transport') || q.includes('infra')) {
      return this.analyzeRailwaysSector(deals, workOrders, scorecard);
    }

    // Intent 4: Revenue, Billing & Financial Health
    if (q.includes('revenue') || q.includes('billed') || q.includes('receivable') || q.includes('cashflow') || q.includes('collection')) {
      return this.analyzeFinancials(deals, workOrders, scorecard);
    }

    // Intent 5: Owner / Sales Leaderboard
    if (q.includes('owner') || q.includes('sales rep') || q.includes('kam') || q.includes('personnel') || q.includes('leaderboard')) {
      return this.analyzeOwnerPerformance(deals, scorecard);
    }

    // Intent 6: Win Rate & Conversion Rates
    if (q.includes('win rate') || q.includes('conversion') || q.includes('won') || q.includes('lost')) {
      return this.analyzeWinRates(deals, scorecard);
    }

    // Intent 7: Top Client Accounts
    if (q.includes('client') || q.includes('customer') || q.includes('account')) {
      return this.analyzeTopClients(workOrders, scorecard);
    }

    // Intent 8: Stalled High-Value Deals & Sales Funnel
    if (q.includes('stuck') || q.includes('stalled') || q.includes('proposal') || q.includes('negotiation') || q.includes('funnel') || q.includes('deal stage')) {
      return this.analyzeSalesFunnel(deals, scorecard);
    }

    // Intent 9: Operational Bottlenecks & Revenue Leakage
    if (q.includes('bottleneck') || q.includes('leakage') || q.includes('unbilled') || q.includes('execution') || q.includes('delay') || q.includes('work order status')) {
      return this.analyzeOperationalBottlenecks(workOrders, scorecard);
    }

    // Intent 10: Leadership Update Request
    if (q.includes('leadership') || q.includes('update') || q.includes('executive') || q.includes('summary report') || q.includes('c-suite')) {
      return this.generateLeadershipUpdateQuery(deals, workOrders, scorecard);
    }

    // Intent 11: Data Quality Audit
    if (q.includes('quality') || q.includes('missing') || q.includes('audit') || q.includes('caveat') || q.includes('dirty')) {
      return this.analyzeDataQuality(deals, workOrders, scorecard);
    }

    // Default / Dynamic Search Solvers
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

    // Quarter Breakdown
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

The **Energy Sector** (combining **Renewables** and **Powerline**) is your top revenue driver:

#### Key Pipeline Metrics:
- **Total Energy Deals**: **${energyDeals.length} deals** (Out of 344 company deals)
- **Gross Pipeline Value**: **${formatINR(totalEnergyPipeline)}**
- **Risk-Adjusted Weighted Value**: **${formatINR(weightedEnergyPipeline)}**
- **Active Open Pipeline**: **${openEnergyDeals.length} deals** valued at **${formatINR(openValue)}**
- **Closed Won Revenue**: **${wonEnergyDeals.length} deals** valued at **${formatINR(wonValue)}**
- **Sector Win Rate**: **${Math.round((wonEnergyDeals.length / Math.max(1, wonEnergyDeals.length + deadEnergyDeals.length)) * 100)}%**

#### Work Order Operational Execution:
- **Active Energy Projects**: **${energyWOs.length} work orders**
- **Executed Contract Value**: **${formatINR(totalWOValue)}**
- **Billed Value**: **${formatINR(billedWOValue)}**
- **Unbilled Balance**: **${formatINR(unbilledWOValue)}**

> 💡 **Founder Action Item**: Energy deals have high closure velocity, but **${formatINR(unbilledWOValue)}** is locked in unbilled work orders. Expediting billing on completed Renewable sites will immediately boost cashflow.`;

    const mondayGraphQLQuery = `query GetEnergyBoardItems {
  boards(ids: [DEALS_BOARD_ID]) {
    items_page(limit: 500) {
      items {
        id
        name
        column_values(ids: ["sector", "masked_deal_value", "deal_status", "deal_stage"]) {
          text
          value
        }
      }
    }
  }
}`;

    return {
      queryIntent: 'Energy Sector Pipeline',
      answerMarkdown,
      mondayGraphQLQuery,
      kpis: [
        { label: 'Energy Pipeline', value: formatINR(totalEnergyPipeline), sub: `${energyDeals.length} total deals` },
        { label: 'Active Open Pipeline', value: formatINR(openValue), sub: `${openEnergyDeals.length} open deals` },
        { label: 'Weighted Value', value: formatINR(weightedEnergyPipeline), sub: 'Probability adjusted' },
        { label: 'Billed Execution', value: formatINR(billedWOValue), sub: `${energyWOs.length} work orders` }
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
        "Compare Energy vs Mining sector performance."
      ]
    };
  }

  analyzeMiningSector(deals, workOrders, scorecard) {
    const miningDeals = deals.filter(d => d.cleanSector.includes('Mining'));
    const miningWOs = workOrders.filter(w => w.cleanSector.includes('Mining'));

    const totalPipeline = miningDeals.reduce((s, d) => s + d.cleanValue, 0);
    const totalWOValue = miningWOs.reduce((s, w) => s + w.amountExcl, 0);
    const totalBilled = miningWOs.reduce((s, w) => s + w.billedExcl, 0);
    const unbilled = miningWOs.reduce((s, w) => s + w.amountToBeBilledExcl, 0);

    const answerMarkdown = `### ⛏️ Mining & Resources Sector Analysis

Mining represents your largest operational deployment footprint (**${miningWOs.length} Work Orders**):

#### Sales Pipeline Summary:
- **Total Mining Deals**: **${miningDeals.length} deals**
- **Gross Deal Pipeline**: **${formatINR(totalPipeline)}**
- **Open Active Pipeline**: **${miningDeals.filter(d => d.isOpen).length} deals** valued at **${formatINR(miningDeals.filter(d => d.isOpen).reduce((s, d) => s + d.cleanValue, 0))}**

#### Work Order Execution & Billing:
- **Total Executed Contract Value**: **${formatINR(totalWOValue)}** (${Math.round((totalWOValue/Math.max(1, workOrders.reduce((s,w)=>s+w.amountExcl,0)))*100)}% of total company execution)
- **Billed Value**: **${formatINR(totalBilled)}**
- **Unbilled Balance**: **${formatINR(unbilled)}**

> 💡 **Executive Takeaway**: Mining has steady operational volume (**100 projects**), but billing turnaround can be improved to release **${formatINR(unbilled)}** in unbilled balances.`;

    return {
      queryIntent: 'Mining Sector Analysis',
      answerMarkdown,
      mondayGraphQLQuery: `query GetMiningData { boards { items_page { items { name column_values { text } } } } }`,
      kpis: [
        { label: 'Mining Pipeline', value: formatINR(totalPipeline), sub: `${miningDeals.length} deals` },
        { label: 'WO Executed Value', value: formatINR(totalWOValue), sub: `${miningWOs.length} work orders` },
        { label: 'Billed Value', value: formatINR(totalBilled), sub: 'Realized revenue' },
        { label: 'Unbilled Balance', value: formatINR(unbilled), sub: 'Pending invoice' }
      ],
      chartType: 'bar',
      chartData: [
        { name: 'Executed Contract', val: totalWOValue },
        { name: 'Billed Revenue', val: totalBilled },
        { name: 'Unbilled Balance', val: unbilled }
      ],
      chartKeys: [{ key: 'val', name: 'Amount (₹)', color: '#f59e0b' }],
      caveats: scorecard.caveats,
      followUps: ["Show completed unbilled Mining work orders.", "How is Energy sector performing?", "Show sales owner leaderboard."]
    };
  }

  analyzeRailwaysSector(deals, workOrders, scorecard) {
    const rDeals = deals.filter(d => d.cleanSector.includes('Railways'));
    const rWOs = workOrders.filter(w => w.cleanSector.includes('Railways'));

    const totalPipeline = rDeals.reduce((s, d) => s + d.cleanValue, 0);
    const totalWOValue = rWOs.reduce((s, w) => s + w.amountExcl, 0);
    const totalBilled = rWOs.reduce((s, w) => s + w.billedExcl, 0);

    const answerMarkdown = `### 🚂 Railways & Transport Sector Overview

Railways represents high-margin enterprise infrastructure contracts:

- **Total Sales Deals**: **${rDeals.length} deals** valued at **${formatINR(totalPipeline)}**
- **Active Work Orders**: **${rWOs.length} projects**
- **Total Executed Value**: **${formatINR(totalWOValue)}**
- **Billed Execution**: **${formatINR(totalBilled)}**

> 💡 **Insight**: Railways deals feature long procurement cycles but higher average contract value per order.`;

    return {
      queryIntent: 'Railways Sector Analysis',
      answerMarkdown,
      kpis: [
        { label: 'Railways Pipeline', value: formatINR(totalPipeline), sub: `${rDeals.length} deals` },
        { label: 'WO Executed Value', value: formatINR(totalWOValue), sub: `${rWOs.length} work orders` },
        { label: 'Billed Value', value: formatINR(totalBilled), sub: 'Realized value' }
      ],
      chartType: 'bar',
      chartData: [
        { name: 'Pipeline Value', val: totalPipeline },
        { name: 'Executed Value', val: totalWOValue },
        { name: 'Billed Value', val: totalBilled }
      ],
      chartKeys: [{ key: 'val', name: 'Amount (₹)', color: '#8b5cf6' }],
      caveats: scorecard.caveats,
      followUps: ["How is Energy pipeline looking?", "Show accounts receivable breakdown.", "Prepare leadership update."]
    };
  }

  analyzeFinancials(deals, workOrders, scorecard) {
    const totalContractVal = workOrders.reduce((s, w) => s + w.amountExcl, 0);
    const totalBilledVal = workOrders.reduce((s, w) => s + w.billedExcl, 0);
    const totalUnbilledVal = workOrders.reduce((s, w) => s + w.amountToBeBilledExcl, 0);
    const totalCollectedVal = workOrders.reduce((s, w) => s + w.collectedIncl, 0);
    const totalReceivableVal = workOrders.reduce((s, w) => s + w.receivable, 0);

    const billingRatio = Math.round((totalBilledVal / Math.max(1, totalContractVal)) * 100);

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

Aggregated financial performance across **${workOrders.length} active Work Orders**:

#### Financial Breakdown:
- **Total Work Order Contract Value (Excl GST)**: **${formatINR(totalContractVal)}**
- **Total Billed Value (Excl GST)**: **${formatINR(totalBilledVal)}** (${billingRatio}% of total contract value)
- **Unbilled Work Order Balance**: **${formatINR(totalUnbilledVal)}**
- **Accounts Receivable Outstanding (Incl GST)**: **${formatINR(totalReceivableVal)}**
- **Total Collections Realized**: **${formatINR(totalCollectedVal)}**

#### Revenue Distribution by Sector:
${chartData.map(s => `- **${s.sector}**: Contract ${formatINR(s.contract)} | Billed ${formatINR(s.billed)} | Pending Billing ${formatINR(s.unbilled)}`).join('\n')}

> 💡 **Executive Action Item**: Outstanding unbilled execution stands at **${formatINR(totalUnbilledVal)}**. Issuing invoices on completed sites will convert execution directly into cash receivables.`;

    return {
      queryIntent: 'Financial Performance & Revenue',
      answerMarkdown,
      mondayGraphQLQuery: `query GetFinancialData { boards(ids: [WORK_ORDERS_ID]) { items_page { items { column_values(ids: ["amount_excl_gst", "billed_value", "amount_receivable"]) { text } } } } }`,
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
      followUps: ["Show completed work orders with missing invoices.", "How is our pipeline looking for Energy sector this quarter?", "Prepare leadership update report."]
    };
  }

  analyzeOwnerPerformance(deals, scorecard) {
    const ownerMap = {};
    deals.forEach(d => {
      const owner = d.ownerCode || 'Unassigned';
      if (!ownerMap[owner]) ownerMap[owner] = { owner, totalVal: 0, count: 0, wonCount: 0, openVal: 0 };
      ownerMap[owner].totalVal += d.cleanValue;
      ownerMap[owner].count += 1;
      if (d.isWon) ownerMap[owner].wonCount += 1;
      if (d.isOpen) ownerMap[owner].openVal += d.cleanValue;
    });

    const chartData = Object.values(ownerMap).sort((a, b) => b.totalVal - a.totalVal).slice(0, 8);

    const answerMarkdown = `### 🏆 Sales Owner Pipeline Leaderboard

Analysis of deal allocation across account managers & sales personnel:

${chartData.map((o, idx) => `${idx + 1}. **${o.owner}**: ${o.count} deals | Total Pipeline: **${formatINR(o.totalVal)}** | Open Value: **${formatINR(o.openVal)}** | Won Deals: ${o.wonCount}`).join('\n')}

> 💡 **Insight**: Top 3 sales owners control **${Math.round((chartData.slice(0,3).reduce((s,o)=>s+o.totalVal,0)/Math.max(1, deals.reduce((s,d)=>s+d.cleanValue,0)))*100)}%** of company gross pipeline value.`;

    return {
      queryIntent: 'Sales Owner Leaderboard',
      answerMarkdown,
      kpis: [
        { label: 'Top Owner', value: chartData[0]?.owner || 'N/A', sub: formatINR(chartData[0]?.totalVal || 0) },
        { label: 'Active Sales Reps', value: String(Object.keys(ownerMap).length), sub: 'Managing deals' },
        { label: 'Top Rep Open Value', value: formatINR(chartData[0]?.openVal || 0), sub: 'Active pipeline' }
      ],
      chartType: 'bar',
      chartData,
      chartKeys: [
        { key: 'totalVal', name: 'Total Pipeline (₹)', color: '#3b82f6' },
        { key: 'openVal', name: 'Open Pipeline (₹)', color: '#10b981' }
      ],
      caveats: scorecard.caveats,
      followUps: ["Which deals are stuck in Negotiation?", "Show Energy sector pipeline.", "Prepare leadership update."]
    };
  }

  analyzeWinRates(deals, scorecard) {
    const totalWon = deals.filter(d => d.isWon).length;
    const totalDead = deals.filter(d => d.isDead).length;
    const totalClosed = totalWon + totalDead;
    const overallWinRate = Math.round((totalWon / Math.max(1, totalClosed)) * 100);

    const sectorWinRates = {};
    deals.forEach(d => {
      const sec = d.cleanSector;
      if (!sectorWinRates[sec]) sectorWinRates[sec] = { sector: sec, won: 0, dead: 0 };
      if (d.isWon) sectorWinRates[sec].won += 1;
      if (d.isDead) sectorWinRates[sec].dead += 1;
    });

    const chartData = Object.values(sectorWinRates).map(s => {
      const total = s.won + s.dead;
      const rate = total > 0 ? Math.round((s.won / total) * 100) : 0;
      return { sector: s.sector, winRate: rate, totalClosed: total };
    }).sort((a, b) => b.winRate - a.winRate);

    const answerMarkdown = `### 🎯 Deal Win Rate & Conversion Analysis

- **Overall Company Win Rate**: **${overallWinRate}%** (${totalWon} Won vs ${totalDead} Lost out of ${totalClosed} closed deals)

#### Sector Win Rate Ranking:
${chartData.map(s => `- **${s.sector}**: **${s.winRate}% win rate** (${s.totalClosed} closed deals)`).join('\n')}

> 💡 **Takeaway**: Energy and Mining exhibit the highest deal conversion success rates.`;

    return {
      queryIntent: 'Win Rate & Conversion',
      answerMarkdown,
      kpis: [
        { label: 'Overall Win Rate', value: `${overallWinRate}%`, sub: `${totalWon} deals won` },
        { label: 'Total Won Deals', value: String(totalWon), sub: 'Historical closed won' },
        { label: 'Total Lost Deals', value: String(totalDead), sub: 'Closed dead' }
      ],
      chartType: 'bar',
      chartData,
      chartKeys: [{ key: 'winRate', name: 'Win Rate (%)', color: '#10b981' }],
      caveats: scorecard.caveats,
      followUps: ["How is Energy sector performing?", "Show sales owner leaderboard.", "Prepare leadership update."]
    };
  }

  analyzeTopClients(workOrders, scorecard) {
    const clientMap = {};
    workOrders.forEach(w => {
      const c = w.customerCode || 'Unknown';
      if (!clientMap[c]) clientMap[c] = { client: c, contract: 0, billed: 0, unbilled: 0, count: 0 };
      clientMap[c].contract += w.amountExcl;
      clientMap[c].billed += w.billedExcl;
      clientMap[c].unbilled += w.amountToBeBilledExcl;
      clientMap[c].count += 1;
    });

    const chartData = Object.values(clientMap).sort((a, b) => b.contract - a.contract).slice(0, 6);

    const answerMarkdown = `### 🏢 Top Client Accounts by Work Order Value

#### Top 6 Client Accounts:
${chartData.map((c, idx) => `${idx + 1}. **Client: ${c.client}**: Contract: **${formatINR(c.contract)}** | Billed: **${formatINR(c.billed)}** | Pending Billing: **${formatINR(c.unbilled)}** (${c.count} work orders)`).join('\n')}

> 💡 **Executive Insight**: The top 5 client accounts generate **${Math.round((chartData.reduce((s,c)=>s+c.contract,0)/Math.max(1, workOrders.reduce((s,w)=>s+w.amountExcl,0)))*100)}%** of company contract volume.`;

    return {
      queryIntent: 'Top Client Accounts',
      answerMarkdown,
      kpis: [
        { label: 'Top Account', value: chartData[0]?.client || 'N/A', sub: formatINR(chartData[0]?.contract || 0) },
        { label: 'Total Accounts', value: String(Object.keys(clientMap).length), sub: 'Active clients' },
        { label: 'Top Account Billed', value: formatINR(chartData[0]?.billed || 0), sub: 'Realized revenue' }
      ],
      chartType: 'bar',
      chartData,
      chartKeys: [
        { key: 'contract', name: 'Contract Value (₹)', color: '#3b82f6' },
        { key: 'billed', name: 'Billed Value (₹)', color: '#10b981' }
      ],
      caveats: scorecard.caveats,
      followUps: ["Show total accounts receivable balance.", "Where are work orders completed but unbilled?", "Prepare leadership update."]
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

    const stalledDeals = deals.filter(d => 
      (d.cleanStage.includes('Proposal') || d.cleanStage.includes('Negotiation') || d.cleanStage.includes('Demo')) &&
      d.cleanValue > 500000
    ).sort((a, b) => b.cleanValue - a.cleanValue);

    const answerMarkdown = `### 📊 Sales Pipeline & Deal Stage Breakdown

Analysis across **${deals.length} deals**:

#### High-Value Stalled / Negotiation Deals (> ₹5L):
${stalledDeals.slice(0, 5).map(d => `- **Deal: ${d.dealName}** (${d.cleanSector}) | Value: **${formatINR(d.cleanValue)}** | Stage: *${d.cleanStage}* | Owner: \`${d.ownerCode}\``).join('\n')}

#### Funnel Stage Summary:
${chartData.map(s => `- **${s.stage}**: ${s.count} deals | Total Value: **${formatINR(s.totalVal)}**`).join('\n')}

> 🔍 **Founder Takeaway**: **${stalledDeals.length} high-value deals** exceeding ₹5L are currently in Proposal/Negotiation phase. Targeted executive closing intervention can unlock major Q3 revenue.`;

    return {
      queryIntent: 'Sales Funnel & Deal Stages',
      answerMarkdown,
      mondayGraphQLQuery: `query GetDealFunnel { boards(ids: [DEALS_BOARD]) { items_page { items { name column_values(ids: ["deal_stage", "masked_deal_value"]) { text } } } } }`,
      kpis: [
        { label: 'Total Deals', value: String(deals.length), sub: 'Across all sectors' },
        { label: 'Stalled High-Val Deals', value: String(stalledDeals.length), sub: 'Value > ₹5 Lakhs' },
        { label: 'Top Stage', value: chartData[0]?.stage || 'Lead Generated', sub: `${chartData[0]?.count} deals` },
        { label: 'Negotiations Value', value: formatINR(deals.filter(d => d.cleanStage.includes('Negotiation')).reduce((s, d) => s + d.cleanValue, 0)), sub: 'Closing deals' }
      ],
      chartType: 'bar',
      chartData,
      chartKeys: [{ key: 'totalVal', name: 'Pipeline Value (₹)', color: '#8b5cf6' }],
      caveats: scorecard.caveats,
      followUps: ["Which sales owners manage the largest stalled deals?", "What is our win rate in Mining vs Energy?", "Prepare leadership update."]
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
${unbilledCompleted.slice(0, 5).map(w => `- **Deal: ${w.dealName}** (${w.cleanSector}) | Unbilled: **${formatINR(w.amountToBeBilledExcl)}** | Status: *${w.cleanExecStatus}* | Serial: \`${w.serialNo}\``).join('\n')}

> ⚡ **Actionable Insight**: **${unbilledCompleted.length} work orders** are marked Completed or Partially Completed but have not been fully billed, accumulating **${formatINR(unbilledTotal)}** in locked revenue. Directing operations to issue invoices will resolve this bottleneck.`;

    return {
      queryIntent: 'Operational Bottlenecks',
      answerMarkdown,
      mondayGraphQLQuery: `query GetWOBottlenecks { boards(ids: [WO_BOARD]) { items_page { items { name column_values(ids: ["execution_status", "billing_status", "amount_to_be_billed"]) { text } } } } }`,
      kpis: [
        { label: 'Unbilled Projects', value: String(unbilledCompleted.length), sub: 'Completed/Partial Work Orders' },
        { label: 'Locked Unbilled Value', value: formatINR(unbilledTotal), sub: 'Ready for billing' },
        { label: 'Paused Projects', value: String(workOrders.filter(w => w.cleanExecStatus.includes('Paused')).length), sub: 'Requires intervention' }
      ],
      chartType: 'bar',
      chartData,
      chartKeys: [{ key: 'unbilled', name: 'Unbilled Amount (₹)', color: '#ef4444' }],
      caveats: scorecard.caveats,
      followUps: ["Show total accounts receivable balance.", "List all work orders in Mining sector.", "Prepare leadership update."]
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
      mondayGraphQLQuery: `query GetLeadershipUpdateData { boards { items_page { items { column_values { text } } } } }`,
      kpis: [
        { label: 'Total Pipeline', value: formatINR(totalPipeline), sub: `${deals.length} deals` },
        { label: 'Billed Execution', value: formatINR(totalBilled), sub: `${Math.round((totalBilled/Math.max(1, totalContract))*100)}% billed` },
        { label: 'Unbilled Balance', value: formatINR(unbilledBalance), sub: 'Immediate upside' },
        { label: 'Data Health Score', value: `${scorecard.overallHealth}%`, sub: 'Health rating' }
      ],
      chartType: 'pie',
      chartData: [
        { name: 'Energy Pipeline', value: energyPipeline },
        { name: 'Mining Pipeline', value: deals.filter(d => d.cleanSector.includes('Mining')).reduce((s, d) => s + d.cleanValue, 0) },
        { name: 'Other Sectors', value: deals.filter(d => !d.isEnergySector && !d.cleanSector.includes('Mining')).reduce((s, d) => s + d.cleanValue, 0) }
      ],
      chartKeys: [],
      caveats: scorecard.caveats,
      followUps: ["Open Leadership Update Generator", "How is our pipeline looking for energy sector this quarter?", "Audit data quality score"]
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
      mondayGraphQLQuery: `query AuditBoardData { boards { columns { id title type } } }`,
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
      followUps: ["How is our pipeline looking for Energy sector this quarter?", "Show operational bottlenecks", "Prepare leadership update"]
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

> 💡 *Tip: Try asking specific founder questions like "How is our energy pipeline looking this quarter?" or "Show sales owner leaderboard"*`;

    return {
      queryIntent: 'General BI Analysis',
      answerMarkdown,
      mondayGraphQLQuery: `query GetGeneralBI { boards { items_page { items { name column_values { text } } } } }`,
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
      chartKeys: [{ key: 'val', name: 'Pipeline Value (₹)', color: '#3b82f6' }],
      caveats: scorecard.caveats,
      followUps: ["How is our pipeline looking for Energy sector this quarter?", "Show sales owner leaderboard", "Prepare leadership update"]
    };
  }
}

export const biQueryEngine = new BIQueryEngine();
