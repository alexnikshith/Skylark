import React from 'react';
import { Bot, BarChart3, FileText, Settings, ShieldCheck, Zap, Layers } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, datasetsInfo, dataQuality }) {
  return (
    <header className="bg-[#0b0f19]/90 border-b border-slate-800/80 text-white sticky top-0 z-50 backdrop-blur-xl shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-3.5 lg:py-0 lg:h-20 gap-4">
          
          {/* Logo & Branding - Left Column */}
          <div 
            className="flex items-center space-x-3.5 cursor-pointer shrink-0 group" 
            onClick={() => setActiveTab('chat')}
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-all">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  Skylark BI Agent
                </span>
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Monday v2
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Founder Business Intelligence Console</span>
            </div>
          </div>

          {/* Navigation Tabs - Center Column */}
          <nav className="flex items-center space-x-1.5 bg-[#030712]/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Bot className="h-4 w-4" />
              <span>AI Agent Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>BI Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('leadership')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'leadership'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Leadership Update</span>
            </button>

            <button
              onClick={() => setActiveTab('monday')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'monday'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Monday API</span>
            </button>

            <button
              onClick={() => setActiveTab('decision')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'decision'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Decision Log</span>
            </button>
          </nav>

          {/* Status Badges - Right Column */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Health Score Pill */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Data Health: {dataQuality.overallHealth}%</span>
            </div>

            {/* Connection Indicator */}
            <div
              onClick={() => setActiveTab('monday')}
              className={`cursor-pointer flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                datasetsInfo.isLive
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${datasetsInfo.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`}></span>
              <span>{datasetsInfo.isLive ? 'Monday Live API' : 'Dynamic Boards Sync'}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
