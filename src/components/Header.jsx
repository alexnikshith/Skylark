import React from 'react';
import { Bot, BarChart3, FileText, Settings, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, datasetsInfo, dataQuality }) {
  return (
    <header className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 text-white sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3 md:h-16 md:py-0">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('chat')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  Skylark BI Agent
                </span>
                <span className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Monday v2 API
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Founder Business Intelligence Console</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 shadow-inner overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>AI Agent Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>BI Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('leadership')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'leadership'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Leadership Update</span>
            </button>

            <button
              onClick={() => setActiveTab('monday')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'monday'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Monday API</span>
            </button>

            <button
              onClick={() => setActiveTab('decision')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'decision'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Decision Log</span>
            </button>
          </nav>

          {/* Status Badges */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Health Score Pill */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Data Health: {dataQuality.overallHealth}%</span>
            </div>

            {/* Connection Indicator */}
            <div
              onClick={() => setActiveTab('monday')}
              className={`cursor-pointer flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                datasetsInfo.isLive
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${datasetsInfo.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`}></span>
              <span>{datasetsInfo.isLive ? 'Monday Live API' : 'Dynamic Boards Sync'}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
