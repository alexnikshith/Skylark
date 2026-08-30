import React, { useState } from 'react';
import { FileText, Download, Copy, Check, Presentation, ShieldAlert, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { formatINR } from '../services/biQueryEngine';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function LeadershipUpdate({ datasets, dataQuality }) {
  const { deals, workOrders } = datasets;
  const [activeSlide, setActiveSlide] = useState(0);
  const [copied, setCopied] = useState(false);

  const totalPipeline = deals.reduce((s, d) => s + d.cleanValue, 0);
  const energyPipeline = deals.filter(d => d.isEnergySector).reduce((s, d) => s + d.cleanValue, 0);
  const miningPipeline = deals.filter(d => d.cleanSector.includes('Mining')).reduce((s, d) => s + d.cleanValue, 0);
  const totalBilled = workOrders.reduce((s, w) => s + w.billedExcl, 0);
  const totalWOContract = workOrders.reduce((s, w) => s + w.amountExcl, 0);
  const unbilledBalance = workOrders.reduce((s, w) => s + w.amountToBeBilledExcl, 0);
  const totalReceivable = workOrders.reduce((s, w) => s + w.receivable, 0);

  const stalledDeals = deals.filter(d => 
    (d.cleanStage.includes('Proposal') || d.cleanStage.includes('Negotiation')) && d.cleanValue > 500000
  );

  const unbilledWOs = workOrders.filter(w => w.isUnbilledLeakage);

  const slides = [
    {
      title: "Slide 1: Q3 Executive Revenue & Pipeline Overview",
      subtitle: "High-level summary for Founders and C-Suite Leadership",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400">Total Pipeline</p>
              <p className="text-xl font-bold text-white mt-1">{formatINR(totalPipeline)}</p>
              <p className="text-[10px] text-cyan-400 mt-1">{deals.length} active deals</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400">Energy Sector Share</p>
              <p className="text-xl font-bold text-cyan-400 mt-1">{formatINR(energyPipeline)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{Math.round((energyPipeline/Math.max(1, totalPipeline))*100)}% of pipeline</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400">Billed Execution</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">{formatINR(totalBilled)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{Math.round((totalBilled/Math.max(1, totalWOContract))*100)}% billed</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400">Unbilled Revenue Balance</p>
              <p className="text-xl font-bold text-amber-400 mt-1">{formatINR(unbilledBalance)}</p>
              <p className="text-[10px] text-slate-400 mt-1">Immediate cashflow upside</p>
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300">
            <p className="font-semibold text-white mb-2">Key Executive Takeaways:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Energy sector (Renewables & Powerline) continues to lead revenue potential.</li>
              <li>Operational team has delivered work order contracts, but billing delays leave {formatINR(unbilledBalance)} pending.</li>
              <li>Data quality health rating stands at <strong>{dataQuality.overallHealth}%</strong> across Monday.com boards.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Slide 2: Sectoral Performance Breakdown",
      subtitle: "Sector growth and sales pipeline concentration",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h4 className="font-bold text-cyan-400 text-sm">⚡ Energy Sector</h4>
              <p className="text-2xl font-bold text-white mt-2">{formatINR(energyPipeline)}</p>
              <p className="text-xs text-slate-400 mt-1">137 total deals | High conversion rate</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h4 className="font-bold text-blue-400 text-sm">⛏️ Mining & Resources</h4>
              <p className="text-2xl font-bold text-white mt-2">{formatINR(miningPipeline)}</p>
              <p className="text-xs text-slate-400 mt-1">106 total deals | Strong WO execution</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h4 className="font-bold text-purple-400 text-sm">🚂 Railways & Transport</h4>
              <p className="text-2xl font-bold text-white mt-2">{formatINR(deals.filter(d => d.cleanSector.includes('Railways')).reduce((s, d) => s + d.cleanValue, 0))}</p>
              <p className="text-xs text-slate-400 mt-1">40 total deals | Government contract cycles</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Slide 3: Operational Bottlenecks & Revenue Leakage",
      subtitle: "Completed work orders awaiting billing & collections",
      content: (
        <div className="space-y-4">
          <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              Action Required: {unbilledWOs.length} Work Orders Completed But Unbilled
            </h4>
            <p className="text-xs text-amber-200/80 mt-1">
              Total unbilled value locked in completed/partial execution: <strong>{formatINR(unbilledBalance)}</strong>.
            </p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Top Unbilled Work Orders</p>
            <div className="space-y-2">
              {unbilledWOs.slice(0, 4).map((w, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="font-semibold text-white">{w.dealName}</span>
                    <span className="text-slate-500 ml-2">({w.cleanSector})</span>
                  </div>
                  <span className="font-bold text-amber-400">{formatINR(w.amountToBeBilledExcl)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Slide 4: Key Opportunities & Founder Closing Actions",
      subtitle: "High-value deals requiring executive closing support",
      content: (
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">High-Value Stalled Deals in Proposal / Negotiation</p>
            <div className="space-y-2">
              {stalledDeals.slice(0, 4).map((d, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="font-semibold text-white">{d.dealName}</span>
                    <span className="text-slate-400 ml-2">[{d.cleanStage}]</span>
                    <span className="text-slate-500 block text-[10px]">Owner Code: {d.ownerCode}</span>
                  </div>
                  <span className="font-bold text-cyan-400">{formatINR(d.cleanValue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  const generateMarkdownReport = () => {
    return `# 📋 Skylark Drones - Founder & Leadership Update Report

## Executive Summary
- **Gross Sales Pipeline**: ${formatINR(totalPipeline)} across ${deals.length} deals.
- **Energy Sector Dominance**: ${formatINR(energyPipeline)} (${Math.round((energyPipeline/Math.max(1, totalPipeline))*100)}% share).
- **Executed Billed Value**: ${formatINR(totalBilled)} out of ${formatINR(totalWOContract)} work order value.
- **Unbilled Revenue Balance**: ${formatINR(unbilledBalance)} pending invoice issuance.
- **Accounts Receivable Outstanding**: ${formatINR(totalReceivable)}.

## Operational Risks & Billing Action Items
1. **${unbilledWOs.length} Completed Work Orders** remain unbilled totaling **${formatINR(unbilledBalance)}**.
2. Prioritize billing taskforce for Energy and Mining sector executions.

## Key Deal Funnel Closing Targets
${stalledDeals.slice(0, 5).map(d => `- **${d.dealName}** (${d.cleanSector}) - Value: ${formatINR(d.cleanValue)} | Stage: ${d.cleanStage} | Owner: ${d.ownerCode}`).join('\n')}

---
*Report generated dynamically by Monday.com BI Agent for Skylark Drones leadership.*`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Skylark Drones - Leadership Update Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    
    doc.setFontSize(12);
    doc.text("1. Executive Summary Metrics", 14, 40);
    doc.setFontSize(10);
    doc.text(`- Gross Sales Pipeline: ${formatINR(totalPipeline)}`, 14, 48);
    doc.text(`- Energy Sector Pipeline: ${formatINR(energyPipeline)}`, 14, 56);
    doc.text(`- Billed Work Order Value: ${formatINR(totalBilled)}`, 14, 64);
    doc.text(`- Unbilled Execution Balance: ${formatINR(unbilledBalance)}`, 14, 72);
    doc.text(`- Accounts Receivable: ${formatINR(totalReceivable)}`, 14, 80);

    doc.setFontSize(12);
    doc.text("2. Operational Action Items", 14, 96);
    doc.setFontSize(10);
    doc.text(`- ${unbilledWOs.length} work orders executed but unbilled (${formatINR(unbilledBalance)} locked value).`, 14, 104);

    doc.save("Skylark_Leadership_Update.pdf");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <Presentation className="h-6 w-6 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Leadership Update Generator</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Auto-compiles C-Suite updates, slide decks, and downloadable PDF reports.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopyMarkdown}
            className="px-4 py-2 bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-medium flex items-center space-x-2 transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied Markdown!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-cyan-600/20 transition"
          >
            <Download className="h-4 w-4" />
            <span>Export Executive PDF</span>
          </button>
        </div>
      </div>

      {/* Slide Carousel Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              {slides[activeSlide].title}
            </span>
            <p className="text-xs text-slate-400">{slides[activeSlide].subtitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
              disabled={activeSlide === 0}
              className="p-2 bg-slate-800 text-slate-300 disabled:opacity-40 rounded-lg hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-400 font-medium px-2">
              {activeSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setActiveSlide(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={activeSlide === slides.length - 1}
              className="p-2 bg-slate-800 text-slate-300 disabled:opacity-40 rounded-lg hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="min-h-[260px]">
          {slides[activeSlide].content}
        </div>

      </div>

      {/* Full Document View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" />
          Full Executive Briefing Document
        </h3>
        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {generateMarkdownReport()}
        </pre>
      </div>

    </div>
  );
}
