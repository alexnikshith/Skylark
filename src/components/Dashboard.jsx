import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Briefcase, AlertTriangle, Search, Filter, Layers, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../services/biQueryEngine';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function Dashboard({ datasets, dataQuality }) {
  const { deals, workOrders } = datasets;
  const [activeBoardTab, setActiveBoardTab] = useState('deals');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');

  // Aggregation Math
  const totalPipeline = deals.reduce((s, d) => s + d.cleanValue, 0);
  const energyDeals = deals.filter(d => d.isEnergySector);
  const energyPipeline = energyDeals.reduce((s, d) => s + d.cleanValue, 0);
  
  const totalWOContract = workOrders.reduce((s, w) => s + w.amountExcl, 0);
  const totalBilled = workOrders.reduce((s, w) => s + w.billedExcl, 0);
  const totalReceivable = workOrders.reduce((s, w) => s + w.receivable, 0);
  const unbilledBalance = workOrders.reduce((s, w) => s + w.amountToBeBilledExcl, 0);

  // Chart 1: Sector Pipeline Distribution
  const sectorDataMap = {};
  deals.forEach(d => {
    const sec = d.cleanSector;
    if (!sectorDataMap[sec]) sectorDataMap[sec] = { sector: sec, pipeline: 0, count: 0 };
    sectorDataMap[sec].pipeline += d.cleanValue;
    sectorDataMap[sec].count += 1;
  });
  const sectorChartData = Object.values(sectorDataMap).sort((a, b) => b.pipeline - a.pipeline);

  // Chart 2: Funnel Stage Distribution
  const stageMap = {};
  deals.forEach(d => {
    const stg = d.cleanStage;
    if (!stageMap[stg]) stageMap[stg] = { stage: stg, count: 0, val: 0 };
    stageMap[stg].count += 1;
    stageMap[stg].val += d.cleanValue;
  });
  const stageChartData = Object.values(stageMap).sort((a, b) => b.val - a.val);

  // Filtered Tables
  const filteredDeals = deals.filter(d => {
    const matchesSearch = d.dealName.toLowerCase().includes(searchTerm.toLowerCase()) || d.ownerCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || d.cleanSector.includes(selectedSector);
    return matchesSearch && matchesSector;
  });

  const filteredWOs = workOrders.filter(w => {
    const matchesSearch = w.dealName.toLowerCase().includes(searchTerm.toLowerCase()) || w.customerCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || w.cleanSector.includes(selectedSector);
    return matchesSearch && matchesSector;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive BI Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Cross-board unified intelligence across Deal Funnel & Work Order execution.</p>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <span className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-cyan-400" />
            Deals Ingested: <strong className="text-white">{deals.length}</strong>
          </span>
          <span className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-blue-400" />
            Work Orders: <strong className="text-white">{workOrders.length}</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Pipeline Value</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{formatINR(totalPipeline)}</p>
          <p className="text-xs text-slate-400 mt-1">{deals.length} deals total</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Energy Sector Pipeline</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-cyan-400 mt-3">{formatINR(energyPipeline)}</p>
          <p className="text-xs text-slate-400 mt-1">{Math.round((energyPipeline/Math.max(1, totalPipeline))*100)}% of total company pipeline</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billed Execution Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-3">{formatINR(totalBilled)}</p>
          <p className="text-xs text-slate-400 mt-1">Out of {formatINR(totalWOContract)} total contract</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unbilled Execution Balance</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-3">{formatINR(unbilledBalance)}</p>
          <p className="text-xs text-slate-400 mt-1">Pending invoice issuance</p>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Sector Pipeline */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pipeline Value by Sector</h3>
            <span className="text-xs text-slate-400 font-medium">Deals Board</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sector" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="pipeline" name="Pipeline Value (₹)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Funnel Stages */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Deal Funnel Stage Distribution</h3>
            <span className="text-xs text-slate-400 font-medium">Sales Conversion</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageChartData.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="val" name="Stage Value (₹)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Board Data Tables Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveBoardTab('deals')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeBoardTab === 'deals' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Deal Funnel Board ({filteredDeals.length})
            </button>
            <button
              onClick={() => setActiveBoardTab('workOrders')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeBoardTab === 'workOrders' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Work Orders Board ({filteredWOs.length})
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search deal or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-950 text-white text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
            >
              <option value="ALL">All Sectors</option>
              <option value="Energy">Energy Sector</option>
              <option value="Mining">Mining Sector</option>
              <option value="Railways">Railways</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        {/* Deals Table */}
        {activeBoardTab === 'deals' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Deal Name</th>
                  <th className="px-4 py-3">Sector</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Probability</th>
                  <th className="px-4 py-3">Quarter</th>
                  <th className="px-4 py-3">Quality Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDeals.slice(0, 25).map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-white">{d.dealName}</td>
                    <td className="px-4 py-3">{d.cleanSector}</td>
                    <td className="px-4 py-3 text-slate-400">{d.ownerCode}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-200 border border-slate-700">
                        {d.cleanStage}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {d.hasValue ? formatINR(d.cleanValue) : <span className="text-amber-400 text-[10px]">Unspecified</span>}
                    </td>
                    <td className="px-4 py-3">{(d.probability * 100).toFixed(0)}%</td>
                    <td className="px-4 py-3 text-slate-400">{d.quarter}</td>
                    <td className="px-4 py-3">
                      {!d.hasValue ? (
                        <span className="text-amber-400 bg-amber-950/40 border border-amber-800/50 text-[10px] px-1.5 py-0.5 rounded">
                          Missing Value
                        </span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 text-[10px] px-1.5 py-0.5 rounded">
                          Clean
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Work Orders Table */}
        {activeBoardTab === 'workOrders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Deal Name</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Sector</th>
                  <th className="px-4 py-3">Execution Status</th>
                  <th className="px-4 py-3">Contract Value</th>
                  <th className="px-4 py-3">Billed Value</th>
                  <th className="px-4 py-3">Unbilled Balance</th>
                  <th className="px-4 py-3">Billing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredWOs.slice(0, 25).map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-white">{w.dealName}</td>
                    <td className="px-4 py-3 text-slate-400">{w.customerCode}</td>
                    <td className="px-4 py-3">{w.cleanSector}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        w.cleanExecStatus === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {w.cleanExecStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{formatINR(w.amountExcl)}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">{formatINR(w.billedExcl)}</td>
                    <td className="px-4 py-3 text-amber-400 font-medium">{formatINR(w.amountToBeBilledExcl)}</td>
                    <td className="px-4 py-3">
                      {w.isUnbilledLeakage ? (
                        <span className="text-rose-400 bg-rose-950/40 border border-rose-800/50 text-[10px] px-1.5 py-0.5 rounded">
                          Unbilled Leakage
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">{w.cleanBillingStatus}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
