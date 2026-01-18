import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Brain, ArrowRight, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnalysisResponse } from '../types/fraud'; // Fixed path
import { AuditLog } from '../components/AuditLog';
import { cn } from '@/lib/utils';

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result as AnalysisResponse;
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Fetch audit logs on component mount and when result changes
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/history');
        const logs = await response.json();
        setAuditLogs(logs);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      }
    };

    fetchAuditLogs();
  }, [result]); // Refetch when result changes (new analysis performed)

  if (!result) return null;

  // Override decision to BLOCKED if bot is detected
  const effectiveDecision = result.isBot ? 'BLOCKED' : result.decision;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <main className="container py-10 max-w-5xl px-4 space-y-8">
        
        {/* Banner for Bot Detection */}
        {result.isBot && (
          <div className="bg-rose-600 border-2 border-rose-400 p-6 rounded-2xl flex items-center gap-4 animate-pulse">
            <Zap className="h-10 w-10 fill-white" />
            <div>
              <h2 className="text-2xl font-black uppercase">Automated Script Blocked</h2>
              <p className="text-white/80">Our biometric engine detected non-human input patterns.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Decision Block */}
          <div className={cn(
            "lg:col-span-2 p-10 rounded-3xl border flex flex-col items-center justify-center text-center",
            effectiveDecision === 'APPROVED' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"
          )}>
            {effectiveDecision === 'APPROVED' ? (
              <CheckCircle2 className="h-20 w-20 text-emerald-500 mb-4" />
            ) : (
              <XCircle className="h-20 w-20 text-rose-500 mb-4" />
            )}
            <h1 className="text-7xl font-black uppercase tracking-tighter">{effectiveDecision}</h1>
            <p className="opacity-40 font-mono mt-2">RISK SCORE: {result.riskScore}%</p>
          </div>

          {/* Azure AI Text Analytics Output */}
          <div className="bg-primary/10 border border-primary/20 p-8 rounded-3xl flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4 text-primary font-bold uppercase tracking-widest">
              <Brain className="h-5 w-5" /> Azure AI Verdict
            </div>
            <h3 className={cn(
              "text-2xl font-black mb-2", 
              result.aiVerdict === 'Fraudulent Pattern' ? "text-rose-400" :
              result.aiVerdict === 'Suspicious Activity' ? "text-yellow-400" :
              "text-emerald-400"
            )}>
              {result.aiVerdict}
            </h3>
            <p className="text-sm italic opacity-80 leading-relaxed border-l-2 border-primary/30 pl-4">
              "{result.aiDescription}"
            </p>
          </div>
        </div>

        {/* Behavioral Forensic Factors */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-6 font-bold uppercase tracking-tight">
            <Activity className="text-primary h-5 w-5" /> Forensic Evidence
          </div>
          <div className="grid gap-4">
            {result.factors.map(f => (
              <div key={f.id} className={cn(
                "flex justify-between p-6 rounded-xl border transition-all",
                f.status === 'critical' ? "bg-rose-500/10 border-rose-500/20" : "bg-white/5 border-white/10"
              )}>
                <div>
                  <p className="font-bold">{f.name}</p>
                  <p className="text-xs opacity-50 uppercase">{f.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-bold">{f.value}</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase", 
                    f.status === 'critical' ? "text-rose-500" : "text-emerald-500"
                  )}>{f.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Audit Log */}
        <AuditLog logs={auditLogs} />

        <Button 
          className="w-full h-20 text-2xl font-black rounded-3xl shadow-2xl" 
          onClick={() => navigate('/')}
        >
          NEW TRANSACTION <ArrowRight className="ml-2 h-8 w-8" />
        </Button>
      </main>
    </div>
  );
}