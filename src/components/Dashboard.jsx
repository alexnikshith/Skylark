import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Briefcase, AlertTriangle, Search, Filter, Layers, CheckCircle2, X, Eye, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { formatINR } from '../services/biQueryEngine';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function Dashboard({ datasets, dataQuality }) {
  const { deals, workOrders } = datasets;
  const [activeBoardTab, setActiveBoardTab] = useState('deals');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState('ALL');
  const [selectedItemModal, setSelectedItemModal] = useState(null);

  // Filtered Deals
  const filteredDeals = deals.filter(d => {
    const matchesSearch = d.dealName.toLowerCase().includes(searchTerm.toLowerCase()) || d.ownerCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || d.cleanSector.includes(selectedSector);
    const matchesQuarter = selectedQuarter === 'ALL' || d.quarter === selectedQuarter;
    return matchesSearch && matchesSector && matchesQuarter;
  });

  // Filtered Work Orders
  const filteredWOs = workOrders.filter(w => {
    const matchesSearch = w.dealName.toLowerCase().includes(searchTerm.toLowerCase()) || w.customerCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || w.cleanSector.includes(selectedSector);
    const matchesQuarter = selectedQuarter === 'ALL' || w.quarter === selectedQuarter;
    return matchesSearch && matchesSector && matchesQuarter;
  });

  // Aggregation Math on Filtered Sets
  const totalPipeline = filteredDeals.reduce((s, d) => s + d.cleanValue, 0);
  const energyPipeline = filteredDeals.filter(d => d.isEnergySector).reduce((s, d) => s + d.cleanValue, 0);
  
  const totalWOContract = filteredWOs.reduce((s, w) => s + w.amountExcl, 0);
  const totalBilled = filteredWOs.reduce((s, w) => s + w.billedExcl, 0);
  const unbilledBalance = filteredWOs.reduce((s, w) => s + w.amountToBeBilledExcl, 0);

  const wonCount = filteredDeals.filter(d => d.isWon).length;
  const deadCount = filteredDeals.filter(d => d.isDead).length;
  const winRate = Math.round((wonCount / Math.max(1, wonCount + deadCount)) * 100);

  // Sector Breakdown Chart
  const sectorDataMap = {};
  filteredDeals.forEach(d => {
    const sec = d.cleanSector;
    if (!sectorDataMap[sec]) sectorDataMap[sec] = { sector: sec, pipeline: 0, count: 0 };
    sectorDataMap[sec].pipeline += d.cleanValue;
    sectorDataMap[sec].count += 1;
  });
  const sectorChartData = Object.values(sectorDataMap).sort((a, b) => b.pipeline - a.pipeline);

  // Stage Breakdown Chart
  const stageMap = {};
  filteredDeals.forEach(d => {
    const stg = d.cleanStage;
    if (!stageMap[stg]) stageMap[stg] = { stage: stg, count: 0, val: 0 };
    stageMap[stg].count += 1;
    stageMap[stg].val += d.cleanValue;
  });
  const stageChartData = Object.values(stageMap).sort((a, b) => b.val - a.val);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Quarter Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl ring-1 ring-white/5 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive BI Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Cross-board correlated metrics across Deals & Work Order Execution.</p>
        </div>

        {/* Global Filters */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400 font-medium">Quarter Filter:</span>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">All Quarters</option>
              <option value="Q1 2025" className="bg-slate-900">Q1 2025</option>
              <option value="Q2 2025" className="bg-slate-900">Q2 2025</option>
              <option value="Q3 2025" className="bg-slate-900">Q3 2025</option>
              <option value="Q4 2025" className="bg-slate-900">Q4 2025</option>
              <option value="Q1 2026" className="bg-slate-900">Q1 2026</option>
            </select>
          </div>

          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Health Score: {dataQuality.overallHealth}%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Pipeline</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-3 tracking-tight">{formatINR(totalPipeline)}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">{filteredDeals.length} deals in selection</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Energy Sector Share</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-cyan-400 mt-3 tracking-tight">{formatINR(energyPipeline)}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">{Math.round((energyPipeline/Math.max(1, totalPipeline))*100)}% of pipeline</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billed Execution</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-3 tracking-tight">{formatINR(totalBilled)}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Win Rate: <strong className="text-white">{winRate}%</strong></p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unbilled Revenue</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-3 tracking-tight">{formatINR(unbilledBalance)}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Pending invoice issuance</p>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Sector Pipeline */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pipeline Value by Sector</h3>
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
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Deal Funnel Stage Distribution</h3>
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveBoardTab('deals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeBoardTab === 'deals' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Deal Funnel Board ({filteredDeals.length})
            </button>
            <button
              onClick={() => setActiveBoardTab('workOrders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeBoardTab === 'workOrders' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Work Orders Board ({filteredWOs.length})
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
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
                  <th className="px-4 py-3">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDeals.slice(0, 20).map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/50 cursor-pointer transition" onClick={() => setSelectedItemModal({ type: 'deal', item: d })}>
                    <td className="px-4 py-3 font-semibold text-white flex items-center gap-1.5">
                      <span>{d.dealName}</span>
                    </td>
                    <td className="px-4 py-3">{d.cleanSector}</td>
                    <td className="px-4 py-3 text-slate-400">{d.ownerCode}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {d.cleanStage}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {d.hasValue ? formatINR(d.cleanValue) : <span className="text-amber-400 text-[10px]">Unspecified</span>}
                    </td>
                    <td className="px-4 py-3">{(d.probability * 100).toFixed(0)}%</td>
                    <td className="px-4 py-3 text-slate-400">{d.quarter}</td>
                    <td className="px-4 py-3 text-cyan-400">
                      <Eye className="h-4 w-4 hover:text-white" />
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
                  <th className="px-4 py-3">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredWOs.slice(0, 20).map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/50 cursor-pointer transition" onClick={() => setSelectedItemModal({ type: 'wo', item: w })}>
                    <td className="px-4 py-3 font-semibold text-white">{w.dealName}</td>
                    <td className="px-4 py-3 text-slate-400">{w.customerCode}</td>
                    <td className="px-4 py-3">{w.cleanSector}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        w.cleanExecStatus === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {w.cleanExecStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">{formatINR(w.amountExcl)}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">{formatINR(w.billedExcl)}</td>
                    <td className="px-4 py-3 text-amber-400 font-bold">{formatINR(w.amountToBeBilledExcl)}</td>
                    <td className="px-4 py-3 text-cyan-400">
                      <Eye className="h-4 w-4 hover:text-white" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Item Detail Drawer Modal */}
      {selectedItemModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  {selectedItemModal.type === 'deal' ? 'Deal Board Item Details' : 'Work Order Details'}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedItemModal.item.dealName}</h3>
              </div>
              <button onClick={() => setSelectedItemModal(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              {selectedItemModal.type === 'deal' ? (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Sector Taxonomy:</span>
                    <strong className="text-white">{selectedItemModal.item.cleanSector}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Owner Code:</span>
                    <strong className="text-white">{selectedItemModal.item.ownerCode}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Deal Stage:</span>
                    <strong className="text-cyan-400">{selectedItemModal.item.cleanStage}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Gross Value:</span>
                    <strong className="text-white">{formatINR(selectedItemModal.item.cleanValue)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Closure Probability:</span>
                    <strong className="text-emerald-400">{(selectedItemModal.item.probability * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Target Quarter:</span>
                    <strong className="text-white">{selectedItemModal.item.quarter}</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Customer Code:</span>
                    <strong className="text-white">{selectedItemModal.item.customerCode}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Execution Status:</span>
                    <strong className="text-cyan-400">{selectedItemModal.item.cleanExecStatus}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Contract Value (Excl GST):</span>
                    <strong className="text-white">{formatINR(selectedItemModal.item.amountExcl)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Billed Value:</span>
                    <strong className="text-emerald-400">{formatINR(selectedItemModal.item.billedExcl)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Unbilled Balance:</span>
                    <strong className="text-amber-400">{formatINR(selectedItemModal.item.amountToBeBilledExcl)}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Serial Number:</span>
                    <strong className="text-white">{selectedItemModal.item.serialNo}</strong>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedItemModal(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2 rounded-xl transition"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
