import React from 'react';
import { Shield, Activity, Clock } from 'lucide-react';

interface LogEntry {
  id: number;
  timestamp: string;
  amount: number;
  merchant: string;
  risk_score: number;
  decision: string;
  reason: string;
}

interface AuditLogProps {
  logs: LogEntry[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ logs }) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Security Audit Log</h2>
        <Activity className="h-5 w-5 text-slate-400 ml-auto" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                <Clock className="h-4 w-4 inline mr-2" />
                Timestamp
              </th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">Amount</th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">Merchant</th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">Risk Score</th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">Decision</th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 text-slate-300">
                  {formatTimestamp(log.timestamp)}
                </td>
                <td className="py-3 px-4 text-slate-300 font-mono">
                  {formatAmount(log.amount)}
                </td>
                <td className="py-3 px-4 text-slate-300 capitalize">
                  {log.merchant.replace('_', ' ')}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    log.risk_score >= 80 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    log.risk_score >= 40 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {log.risk_score}%
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    log.decision === 'BLOCKED' ?
                      'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {log.decision}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 text-xs max-w-xs truncate" title={log.reason}>
                  {log.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No security audit logs available</p>
        </div>
      )}
    </div>
  );
};