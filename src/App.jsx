import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AgentChat from './components/AgentChat';
import Dashboard from './components/Dashboard';
import LeadershipUpdate from './components/LeadershipUpdate';
import MondayConfig from './components/MondayConfig';
import DecisionLogView from './components/DecisionLogView';
import { mondayService } from './services/mondayApi';
import { computeDataQualityScorecard } from './services/dataProcessor';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [datasets, setDatasets] = useState(null);
  const [dataQuality, setDataQuality] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await mondayService.getDatasets();
      setDatasets(res);
      const scorecard = computeDataQualityScorecard(res.deals, res.workOrders);
      setDataQuality(scorecard);
    } catch (err) {
      console.error("Failed to load datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !datasets) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 animate-spin flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <div className="h-6 w-6 bg-slate-950 rounded-xl"></div>
        </div>
        <p className="text-sm font-medium text-slate-400">Loading Skylark Monday.com BI Datasets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetsInfo={{ isLive: datasets.isLive, dealsCount: datasets.dealsCount, workOrdersCount: datasets.workOrdersCount }}
        dataQuality={dataQuality}
      />

      {/* Main View Area */}
      <main>
        {activeTab === 'chat' && (
          <AgentChat datasets={datasets} />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard datasets={datasets} dataQuality={dataQuality} />
        )}

        {activeTab === 'leadership' && (
          <LeadershipUpdate datasets={datasets} dataQuality={dataQuality} />
        )}

        {activeTab === 'monday' && (
          <MondayConfig
            datasetsInfo={datasets}
            setDatasetsInfo={setDatasets}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'decision' && (
          <DecisionLogView />
        )}
      </main>

    </div>
  );
}
