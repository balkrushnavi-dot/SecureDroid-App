import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Smartphone, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Search,
  X,
  Filter
} from 'lucide-react';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type { NativeAppRiskReport } from '../types/native';

interface AppAuditScreenProps {
  onBack?: () => void;
}

export function AppAuditScreen({ onBack }: AppAuditScreenProps) {
  const [reports, setReports] = useState<NativeAppRiskReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await SecureDroidNative.scanForRisks();
      if (res.success && Array.isArray(res.data)) {
        setReports(res.data);
      }
    } catch (e) {
      console.error('Failed to scan app risks', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getRiskBadge = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'MEDIUM':
      case 'MODERATE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((app) => {
      // Risk filter
      if (selectedRiskFilter !== 'ALL') {
        const r = (app.overallRisk || '').toUpperCase();
        if (selectedRiskFilter === 'HIGH' && r !== 'HIGH' && r !== 'CRITICAL') return false;
        if (selectedRiskFilter === 'MEDIUM' && r !== 'MEDIUM' && r !== 'MODERATE') return false;
        if (selectedRiskFilter === 'LOW' && r !== 'LOW' && r !== 'INFO') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const labelMatch = (app.label || '').toLowerCase().includes(q);
        const pkgMatch = (app.packageName || '').toLowerCase().includes(q);
        const findingMatch = app.findings?.some(f => 
          (f.summary || '').toLowerCase().includes(q) || 
          (f.id || '').toLowerCase().includes(q)
        );
        return labelMatch || pkgMatch || findingMatch;
      }

      return true;
    });
  }, [reports, searchQuery, selectedRiskFilter]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white">App Security Auditor</h1>
            <p className="text-[11px] text-slate-400">
              {searchQuery || selectedRiskFilter !== 'ALL'
                ? `Showing ${filteredReports.length} of ${reports.length} applications`
                : `${reports.length} applications flagged with security findings`}
            </p>
          </div>
        </div>
        <button 
          onClick={fetchReports} 
          disabled={loading}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Refresh scan"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Search Bar & Quick Filter Chips */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search installed applications by name or package..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Risk Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedRiskFilter('ALL')}
            className={`px-3 py-1 rounded-xl font-medium transition-all ${
              selectedRiskFilter === 'ALL'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            All ({reports.length})
          </button>
          <button
            onClick={() => setSelectedRiskFilter('HIGH')}
            className={`px-3 py-1 rounded-xl font-medium transition-all ${
              selectedRiskFilter === 'HIGH'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-slate-900/50 text-slate-400 hover:text-red-300 border border-transparent'
            }`}
          >
            High Risk
          </button>
          <button
            onClick={() => setSelectedRiskFilter('MEDIUM')}
            className={`px-3 py-1 rounded-xl font-medium transition-all ${
              selectedRiskFilter === 'MEDIUM'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-900/50 text-slate-400 hover:text-amber-300 border border-transparent'
            }`}
          >
            Medium Risk
          </button>
          <button
            onClick={() => setSelectedRiskFilter('LOW')}
            className={`px-3 py-1 rounded-xl font-medium transition-all ${
              selectedRiskFilter === 'LOW'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-900/50 text-slate-400 hover:text-emerald-300 border border-transparent'
            }`}
          >
            Low Risk
          </button>
        </div>
      </div>

      {/* App List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-cyan-400 space-y-3">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-cyan-400 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Analyzing installed application manifests...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-300 font-medium">All installed applications passed security checks.</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-6">
          <div className="p-3 rounded-2xl bg-slate-800/80 text-slate-400 border border-slate-700/50">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">No applications match your search</p>
            <p className="text-xs text-slate-400 mt-1">Try checking for typos or clear the active filter.</p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRiskFilter('ALL');
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredReports.map((app) => {
            const isExpanded = expandedPackage === app.packageName;
            return (
              <div 
                key={app.packageName}
                onClick={() => setExpandedPackage(isExpanded ? null : app.packageName)}
                className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/50">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-white tracking-tight">{app.label || app.packageName}</h3>
                      <p className="text-[10px] font-mono text-slate-400">{app.packageName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium uppercase ${getRiskBadge(app.overallRisk)}`}>
                      {app.overallRisk} Risk
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {/* Findings Accordion */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-800/60 space-y-2 animate-fadeIn">
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Security Findings ({app.findings.length})</p>
                    <div className="space-y-1.5">
                      {app.findings.map((finding, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-900 flex items-start space-x-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="text-slate-200 font-medium">{finding.summary}</p>
                            <span className="text-[10px] font-mono text-slate-500">{finding.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AppAuditScreen;
