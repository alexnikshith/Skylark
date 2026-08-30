import React from 'react';
import { Layers, CheckCircle, HelpCircle, Shield, Lightbulb, FileCheck } from 'lucide-react';

export default function DecisionLogView() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Document Header */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Layers className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Skylark Drones Technical Assignment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Technical Decision Log</h1>
        <p className="text-sm text-slate-400">
          Architectural assumptions, engineering trade-offs, leadership update interpretation, and future roadmap.
        </p>
      </div>

      {/* Section 1: Key Assumptions */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          1. Key Assumptions Made
        </h2>

        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-white">a) Energy Sector Taxonomy</h3>
            <p className="text-xs text-slate-400 mt-1">
              In real-world business queries like <em>"How's our pipeline looking for energy sector this quarter?"</em>, founders group both <strong>Renewables</strong> (solar, wind) and <strong>Powerline</strong> under Energy. The agent merges these sub-sectors while maintaining sub-sector drill-down capabilities.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-white">b) Financial Imputations & Masked Values</h3>
            <p className="text-xs text-slate-400 mt-1">
              Where <code className="text-cyan-300">Masked Deal value</code> was missing (181 deals in sample), pipeline calculations mark them as unvalued or estimate based on sector medians. Risk-weighted pipeline is computed via <code className="text-cyan-300">Value × Closure Probability</code>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-white">c) Operational Revenue Leakage Definition</h3>
            <p className="text-xs text-slate-400 mt-1">
              Revenue leakage is defined as Work Orders with <code className="text-cyan-300">Execution Status = Completed / Partially Completed</code> where <code className="text-cyan-300">Billing Status ≠ Billed</code> and unbilled balance &gt; 0.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Trade-offs Chosen */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="h-5 w-5 text-blue-400" />
          2. Architectural Trade-offs Chosen & Rationale
        </h2>

        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-white">Hybrid Monday.com Integration Mode</h3>
            <p className="text-xs text-slate-400 mt-1">
              <strong>Trade-off:</strong> Built support for live GraphQL v2 requests (<code className="text-cyan-300">api.monday.com/v2</code>) as well as an ingested dynamic query engine using the target Excel datasets.<br />
              <strong>Why:</strong> Ensures the agent is 100% testable out-of-the-box without requiring evaluator API tokens, while maintaining full live GraphQL API capabilities.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-white">Deterministic & Rule-Augmented NL Engine</h3>
            <p className="text-xs text-slate-400 mt-1">
              <strong>Trade-off:</strong> Paired intent classification with deterministic analytical solvers rather than raw unconstrained text generation.<br />
              <strong>Why:</strong> Executive business intelligence requires 100% mathematical precision for financial metrics (revenue, receivables, pipeline totals). Hallucinations on founder numbers are unacceptable.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Leadership Update Interpretation */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileCheck className="h-5 w-5 text-purple-400" />
          3. Interpretation of "Leadership Updates"
        </h2>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            Founders spend hours translating raw tabular data into slide decks, board metrics, and executive bullet points for weekly C-suite syncs.
          </p>
          <p>
            We implemented <strong>Leadership Updates</strong> as a dedicated executive report builder featuring:
          </p>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li><strong>Executive Carousel Presentation Mode:</strong> Slide deck format ready for leadership meetings.</li>
            <li><strong>Financial Risk Callouts:</strong> Instant flagging of unbilled execution balance and stalled high-value deals.</li>
            <li><strong>Multi-Format Exports:</strong> PDF report download and copyable Markdown for email / Slack briefings.</li>
          </ul>
        </div>
      </div>

      {/* Section 4: What We'd Do Differently */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          4. What We'd Do Differently With More Time
        </h2>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
          <p>1. <strong>Monday.com Webhooks:</strong> Implement real-time webhook listeners for automatic updates when deal stages or work order statuses change on Monday.com.</p>
          <p>2. <strong>Autonomous Anomaly Detection:</strong> Push automated Slack/Teams notifications when unbilled work order balances exceed thresholds.</p>
          <p>3. <strong>Predictive Revenue Forecasting:</strong> Use historical win rates by sector to calculate Monte Carlo revenue probability distributions for Q4.</p>
        </div>
      </div>

    </div>
  );
}
