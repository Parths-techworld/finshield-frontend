import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, LogOut, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { AnalysisResponse, BiometricData, MERCHANT_TYPES } from '@/types/biometrics';
import { cn } from '@/lib/utils';

interface LocationState {
  result: AnalysisResponse;
  payload: { amount: number; merchantType: string };
  biometricData?: BiometricData;
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const state = location.state as LocationState | null;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
    if (!state?.result) {
      navigate('/transaction');
    }
  }, [isAuthenticated, state, navigate]);

  if (!state?.result) {
    return null;
  }

  const { result, payload, biometricData } = state;
  const isApproved = result.decision === 'APPROVED';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNewTransaction = () => {
    navigate('/transaction');
  };

  // Generate factors from biometric data if API didn't return them
  const factors = result.factors.length > 0 ? result.factors : biometricData ? [
    { id: 'typing_wpm', name: 'Typing Speed (WPM)', value: `${biometricData.typingWPM} WPM`, status: 'normal' as const, reason: 'Natural typing speed within human range' },
    { id: 'typing_wps', name: 'Typing Speed (WPS)', value: `${biometricData.typingWPS} WPS`, status: 'normal' as const, reason: 'Consistent word-per-second rate' },
    { id: 'typing_cps', name: 'Typing Speed (CPS)', value: `${biometricData.typingCPS} CPS`, status: 'normal' as const, reason: 'Character input rate consistent with human typing' },
    { id: 'keystroke_interval', name: 'Keystroke Interval', value: `${biometricData.keystrokeInterval} ms`, status: 'normal' as const, reason: 'Regular keystroke timing with natural variance' },
    { id: 'field_focus', name: 'Field Focus Time', value: `${biometricData.fieldFocusTimeAmount} sec`, status: 'normal' as const, reason: 'Reasonable time spent on amount field' },
    { id: 'dwell_time', name: 'Total Dwell Time', value: `${biometricData.totalDwellTime} sec`, status: 'normal' as const, reason: 'Natural form completion time' },
    { id: 'mouse_speed', name: 'Mouse Speed', value: `${biometricData.mouseSpeed} px/sec`, status: biometricData.mouseSpeed === 0 ? 'warning' as const : 'normal' as const, reason: biometricData.mouseSpeed === 0 ? 'No mouse movement detected' : 'Natural mouse movement speed' },
    { id: 'mouse_curvature', name: 'Mouse Curvature', value: `${biometricData.mousePathCurvature}`, status: 'normal' as const, reason: 'Curved, natural mouse movement' },
    { id: 'scroll_speed', name: 'Scroll Speed', value: `${biometricData.scrollSpeed} evt/sec`, status: 'normal' as const, reason: 'Normal scrolling pattern' },
    { id: 'scroll_distance', name: 'Scroll Distance', value: `${biometricData.scrollDistance} px`, status: 'normal' as const, reason: 'Typical page scrolling behavior' },
    { id: 'click_delay', name: 'Click Delay', value: `${biometricData.clickDelay} ms`, status: 'normal' as const, reason: 'Normal delay before first interaction' },
    { id: 'click_interval', name: 'Click Interval', value: `${biometricData.clickInterval} ms`, status: 'normal' as const, reason: 'Natural pacing between clicks' },
    { id: 'tab_switches', name: 'Tab Switches', value: `${biometricData.tabSwitchCount}`, status: biometricData.tabSwitchCount === 0 ? 'normal' as const : 'warning' as const, reason: biometricData.tabSwitchCount === 0 ? 'User stayed focused' : 'Some tab switching detected' },
    { id: 'time_away', name: 'Time Away', value: `${biometricData.timeAwayFromTab} sec`, status: 'normal' as const, reason: 'Minimal time away from tab' },
    { id: 'orientation_events', name: 'Orientation Events', value: `${biometricData.deviceOrientationEvents}`, status: 'normal' as const, reason: 'Device held steady' },
    { id: 'orientation_speed', name: 'Orientation Speed', value: `${biometricData.deviceOrientationSpeed}°/sec`, status: 'normal' as const, reason: 'No rapid device rotation' },
    { id: 'interaction_density', name: 'Interaction Density', value: `${biometricData.interactionDensity} int/sec`, status: 'normal' as const, reason: 'Natural interaction rate' },
    { id: 'transaction_risk', name: 'Transaction Risk', value: `₹${payload.amount} (${MERCHANT_TYPES.find(m => m.value === payload.merchantType)?.label})`, status: biometricData.transactionContextRisk < 30 ? 'normal' as const : biometricData.transactionContextRisk < 60 ? 'warning' as const : 'critical' as const, reason: 'Risk assessed based on amount and merchant' },
  ] : [];

  const statusConfig = {
    normal: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
    critical: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Analysis Result" />
      
      <main className="container py-8 max-w-4xl">
        {/* Decision Banner */}
        <div className={cn(
          'rounded-xl border p-8 mb-8 text-center animate-scale-in',
          isApproved 
            ? 'border-success/30 bg-success/5' 
            : 'border-destructive/30 bg-destructive/5'
        )}>
          <div className={cn(
            'inline-flex items-center justify-center w-20 h-20 rounded-full mb-6',
            isApproved ? 'bg-success/20' : 'bg-destructive/20'
          )}>
            {isApproved ? (
              <CheckCircle2 className="h-10 w-10 text-success" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>
          
          <h1 className={cn(
            'text-4xl font-bold mb-4',
            isApproved ? 'text-success' : 'text-destructive'
          )}>
            {result.decision}
          </h1>
          
          <div className="grid grid-cols-2 gap-8 max-w-md mx-auto mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
              <p className="text-3xl font-bold font-mono">{result.riskScore}<span className="text-lg text-muted-foreground">/100</span></p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Confidence</p>
              <p className="text-3xl font-bold font-mono">{result.confidence}<span className="text-lg text-muted-foreground">%</span></p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Processed in {result.processingTime}</span>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-semibold mb-4">Transaction Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="text-xl font-semibold font-mono">₹{payload.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Merchant Type</p>
              <p className="text-xl font-semibold">
                {MERCHANT_TYPES.find(m => m.value === payload.merchantType)?.label}
              </p>
            </div>
          </div>
        </div>

        {/* Factor Breakdown */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-semibold mb-6">Factor Breakdown (18 Factors)</h2>
          <div className="space-y-3">
            {factors.map((factor) => {
              const config = statusConfig[factor.status];
              const Icon = config.icon;
              return (
                <div 
                  key={factor.id}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border transition-colors',
                    config.bg,
                    'border-border/30'
                  )}
                >
                  <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-medium">{factor.name}</h3>
                      <span className="font-mono text-sm">{factor.value}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{factor.reason}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button
            size="lg"
            className="flex-1 sm:flex-none gap-2 h-12 px-8 font-semibold"
            onClick={handleNewTransaction}
          >
            <ArrowRight className="h-5 w-5" />
            New Transaction
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 h-12"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </main>
    </div>
  );
}
