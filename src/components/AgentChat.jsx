import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertTriangle, Database, HelpCircle, CornerDownRight, Code, Eye, EyeOff, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { biQueryEngine } from '../services/biQueryEngine';
import FormattedMarkdown from './FormattedMarkdown';

const QUICK_PROMPTS = [
  { label: "⚡ Energy Sector Pipeline", query: "How is our pipeline looking for energy sector this quarter?" },
  { label: "⛏️ Mining Sector Execution", query: "Show Mining sector performance and execution" },
  { label: "💰 Financial & Receivables", query: "What is our total revenue, billed value, and accounts receivable balance?" },
  { label: "📊 High-Value Stalled Deals", query: "Which deals are high value but stuck in proposal or negotiation phase?" },
  { label: "🏆 Sales Owner Leaderboard", query: "Show sales owner leaderboard and pipeline distribution" },
  { label: "⚠️ Unbilled Work Orders", query: "Where are work orders completed but not billed?" },
  { label: "📋 Leadership Update Report", query: "Prepare a complete executive leadership update summary" },
  { label: "🛡️ Data Quality Audit", query: "Audit data quality and flag missing fields or caveats" }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function AgentChat({ datasets }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      intent: 'Welcome & Board Initialization',
      answerMarkdown: `### 👋 Welcome, Founder!

I am your **Monday.com Business Intelligence Agent**. I continuously query, clean, and correlate real-time data across your **Deal Funnel** (${datasets.deals.length} deals) and **Work Order Tracker** (${datasets.workOrders.length} work orders) boards.

#### Key Ingestion Highlights:
- **Total Ingested Sales Pipeline**: **344 deals** across 5 major industry sectors.
- **Total Ingested Work Orders**: **175 active projects** with billing & collection tracking.
- **Data Resilience Status**: Inconsistent date formats normalized, sector taxonomies aligned, and status typos auto-corrected.

Select any quick query pill above or ask your custom business question below.`,
      kpis: [
        { label: 'Ingested Deals', value: String(datasets.deals.length), sub: 'Sales Pipeline' },
        { label: 'Ingested Work Orders', value: String(datasets.workOrders.length), sub: 'Operational Execution' },
        { label: 'Data Quality Rating', value: 'High Resilience', sub: 'Date & Sector Normalized' }
      ],
      caveats: [
        "Incomplete dates and missing deal values auto-normalized during ingestion.",
        "Energy sector taxonomy merges Renewables (111 deals) and Powerline (26 deals)."
      ],
      followUps: [
        "How is our pipeline looking for Energy sector this quarter?",
        "Show sales owner leaderboard and top reps",
        "Prepare leadership update report"
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [openGraphQLId, setOpenGraphQLId] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSend = (queryText) => {
    const q = queryText || inputQuery;
    if (!q || !q.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsProcessing(true);

    setTimeout(() => {
      const response = biQueryEngine.processQuery(q, datasets);
      const agentMsg = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        ...response
      };
      setMessages(prev => [...prev, agentMsg]);
      setIsProcessing(false);
    }, 350);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.2rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      
      {/* Top Banner Quick Prompts */}
      <div className="mb-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-lg ring-1 ring-white/5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            Founder Quick Intelligence Prompts
          </span>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Querying api.monday.com/v2 boards
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700/80 hover:border-cyan-500 hover:text-cyan-300 hover:bg-slate-800 transition-all font-medium flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>{p.label}</span>
              <CornerDownRight className="h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.sender === 'agent' && (
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 mt-1">
                <Bot className="h-5 w-5" />
              </div>
            )}

            <div className={`max-w-4xl rounded-2xl p-5 shadow-xl border transition-all ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400/40 rounded-br-none'
                : 'bg-slate-900/95 text-slate-100 border-slate-800/90 rounded-bl-none ring-1 ring-white/5'
            }`}>

              {msg.sender === 'user' ? (
                <p className="text-sm font-semibold leading-relaxed">{msg.text}</p>
              ) : (
                <div className="space-y-4">
                  
                  {/* Source Tags */}
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-cyan-400" />
                      Intent Solver: {msg.queryIntent || 'General Intelligence'}
                    </span>
                    <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
                      Monday.com Deals & Work Orders Boards
                    </span>
                  </div>

                  {/* KPI Summary Grid */}
                  {msg.kpis && msg.kpis.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3">
                      {msg.kpis.map((kpi, kIdx) => (
                        <div key={kIdx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 shadow-inner">
                          <p className="text-[11px] text-slate-400 font-medium">{kpi.label}</p>
                          <p className="text-lg font-extrabold text-white mt-0.5 tracking-tight">{kpi.value}</p>
                          <p className="text-[10px] text-cyan-400/90 mt-0.5 font-medium">{kpi.sub}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rich Formatted Markdown Content */}
                  <FormattedMarkdown content={msg.answerMarkdown} />

                  {/* Embedded Chart Graphic */}
                  {msg.chartData && msg.chartData.length > 0 && (
                    <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 mt-4 shadow-inner">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <BarChart2 className="h-3.5 w-3.5 text-cyan-400" />
                          Visual Breakdown: {msg.queryIntent}
                        </p>
                      </div>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          {msg.chartType === 'pie' ? (
                            <PieChart>
                              <Pie
                                data={msg.chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {msg.chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                            </PieChart>
                          ) : (
                            <BarChart data={msg.chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey={msg.chartData[0].quarter ? 'quarter' : msg.chartData[0].sector ? 'sector' : msg.chartData[0].owner ? 'owner' : 'stage'} stroke="#64748b" fontSize={11} />
                              <YAxis stroke="#64748b" fontSize={11} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                              {msg.chartKeys && msg.chartKeys.map((ck, cIdx) => (
                                <Bar key={cIdx} dataKey={ck.key} name={ck.name} fill={ck.color} radius={[4, 4, 0, 0]} />
                              ))}
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Data Resilience & Quality Caveat Warning */}
                  {msg.caveats && msg.caveats.length > 0 && (
                    <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300/90 flex items-start gap-2.5 mt-3">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-amber-300">Data Resilience & Quality Caveats:</span>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-200/80">
                          {msg.caveats.map((c, cIdx) => (
                            <li key={cIdx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* GraphQL Query Inspector Toggle */}
                  {msg.mondayGraphQLQuery && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => setOpenGraphQLId(openGraphQLId === msg.id ? null : msg.id)}
                        className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
                      >
                        <Code className="h-3.5 w-3.5" />
                        <span>{openGraphQLId === msg.id ? 'Hide GraphQL Query' : 'Inspect Monday.com GraphQL Query'}</span>
                        {openGraphQLId === msg.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>

                      {openGraphQLId === msg.id && (
                        <div className="mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                          <pre className="text-[11px] leading-relaxed">{msg.mondayGraphQLQuery}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggested Follow-ups */}
                  {msg.followUps && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <p className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                        <HelpCircle className="h-3 w-3 text-cyan-400" />
                        Suggested Follow-Up Questions:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.followUps.map((fu, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => handleSend(fu)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 hover:bg-cyan-950 hover:text-cyan-200 border border-slate-700/80 transition shadow-sm font-medium"
                          >
                            {fu}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {msg.sender === 'user' && (
              <div className="h-9 w-9 rounded-xl bg-slate-700 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                <User className="h-5 w-5" />
              </div>
            )}

          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot className="h-5 w-5" />
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-slate-300 text-xs flex items-center space-x-3 shadow-lg">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-semibold text-cyan-300">Querying Monday.com GraphQL API & correlating boards...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Query Input Box */}
      <div className="bg-slate-900/95 border border-slate-800 p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask any founder query e.g. 'How is our energy pipeline looking this quarter?'..."
            className="flex-1 bg-slate-950 text-white placeholder-slate-500 text-xs px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-medium"
          />
          <button
            type="submit"
            disabled={isProcessing || !inputQuery.trim()}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <span>Ask Agent</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
