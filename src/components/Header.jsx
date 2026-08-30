import React from 'react';
import { Bot, BarChart3, FileText, Settings, ShieldCheck, Zap, Layers } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, datasetsInfo, dataQuality }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                  Skylark BI Agent
                </span>
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs px-2 py-0.5 rounded-full font-medium">
                  Monday.com v2
                </span>
              </div>
              <p className="text-xs text-slate-400">Founder Business Intelligence Console</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bot className="h-4 w-4" />
              <span>AI Agent Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>BI Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('leadership')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'leadership'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Leadership Update</span>
            </button>

            <button
              onClick={() => setActiveTab('monday')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'monday'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Monday API</span>
            </button>

            <button
              onClick={() => setActiveTab('decision')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'decision'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Decision Log</span>
            </button>
          </nav>

          {/* Status Badges */}
          <div className="flex items-center space-x-3">
            {/* Health Score Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Data Health: {dataQuality.overallHealth}%</span>
            </div>

            {/* Connection Indicator */}
            <div
              onClick={() => setActiveTab('monday')}
              className={`cursor-pointer flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${
                datasetsInfo.isLive
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${datasetsInfo.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`}></span>
              <span>{datasetsInfo.isLive ? 'Monday Live API' : 'Dynamic Boards Sync'}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
