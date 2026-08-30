import React, { useState } from 'react';
import { Settings, Key, Database, RefreshCw, CheckCircle2, AlertCircle, Play, Code, UploadCloud } from 'lucide-react';
import { mondayService } from '../services/mondayApi';

export default function MondayConfig({ datasetsInfo, setDatasetsInfo, onRefreshData }) {
  const [apiKey, setApiKey] = useState(mondayService.apiKey || '');
  const [dealsBoardId, setDealsBoardId] = useState(mondayService.dealsBoardId || '');
  const [workOrdersBoardId, setWorkOrdersBoardId] = useState(mondayService.workOrdersBoardId || '');

  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const [graphQLQuery, setGraphQLQuery] = useState(`query {
  boards(limit: 5) {
    id
    name
    columns {
      id
      title
      type
    }
  }
}`);
  const [graphQLResponse, setGraphQLResponse] = useState('');
  const [isExecutingGraphQL, setIsExecutingGraphQL] = useState(false);

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    mondayService.setCredentials(apiKey.trim(), dealsBoardId.trim(), workOrdersBoardId.trim());
    onRefreshData();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    mondayService.setCredentials(apiKey.trim(), dealsBoardId.trim(), workOrdersBoardId.trim());
    const res = await mondayService.testConnection();
    setTestResult(res);
    setIsTesting(false);
  };

  const handleRunGraphQL = async () => {
    if (!apiKey) {
      setGraphQLResponse('Error: Please input a valid Monday.com API key first.');
      return;
    }
    setIsExecutingGraphQL(true);
    try {
      const res = await mondayService.executeGraphQL(graphQLQuery);
      setGraphQLResponse(JSON.stringify(res, null, 2));
    } catch (err) {
      setGraphQLResponse(`Error: ${err.message}`);
    }
    setIsExecutingGraphQL(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Monday.com GraphQL Integration Hub</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Configure live GraphQL v2 API credentials, test queries, or manage dataset sync.</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            datasetsInfo.isLive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}>
            <span className={`h-2 w-2 rounded-full ${datasetsInfo.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`}></span>
            {datasetsInfo.isLive ? 'Live API Connection Active' : 'Dynamic Boards Mode (Offline Sample Ingested)'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Connection Setup Form */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="h-4 w-4 text-cyan-400" />
            Monday.com API v2 Credentials
          </h3>

          <form onSubmit={handleSaveCredentials} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Monday.com Personal API Token
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiJ9..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Generate in Monday.com -&gt; Developer -&gt; My Access Tokens</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Deals Board ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12345678"
                  value={dealsBoardId}
                  onChange={(e) => setDealsBoardId(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Work Orders Board ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 87654321"
                  value={workOrdersBoardId}
                  onChange={(e) => setWorkOrdersBoardId(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Save Credentials & Sync</span>
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !apiKey.trim()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2.5 px-4 rounded-xl border border-slate-700 transition"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </form>

          {/* Test Connection Output */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
              testResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> : <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />}
              <div>
                <p className="font-semibold">{testResult.success ? 'Connection Successful' : 'Connection Failed'}</p>
                <p className="mt-0.5 opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Setup Guide Callout */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <UploadCloud className="h-4 w-4 text-cyan-400" />
              Importing Excel files to Monday.com:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>In Monday.com, click <strong>+ Add</strong> -&gt; <strong>Import Data</strong> -&gt; <strong>Excel</strong>.</li>
              <li>Upload <code className="text-cyan-300">Deal funnel Data.xlsx</code> as <strong>Deals Board</strong>.</li>
              <li>Upload <code className="text-cyan-300">Work_Order_Tracker Data.xlsx</code> as <strong>Work Orders Board</strong>.</li>
              <li>Copy the Board IDs from the URL and paste them above.</li>
            </ol>
          </div>

        </div>

        {/* Live GraphQL Query Console */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Code className="h-4 w-4 text-cyan-400" />
              Live GraphQL Query Tester
            </h3>
            <button
              onClick={handleRunGraphQL}
              disabled={isExecutingGraphQL || !apiKey}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center space-x-1.5 transition"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isExecutingGraphQL ? 'Executing...' : 'Run Query'}</span>
            </button>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">GraphQL Query Syntax (POST to api.monday.com/v2):</label>
              <textarea
                rows={7}
                value={graphQLQuery}
                onChange={(e) => setGraphQLQuery(e.target.value)}
                className="w-full bg-slate-950 text-cyan-300 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">GraphQL Response Payload:</label>
              <textarea
                readOnly
                rows={7}
                value={graphQLResponse || '// Execute query to view response json...'}
                className="w-full bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
