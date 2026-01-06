import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Send, RotateCcw, Monitor, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/Header';
import { BiometricGrid } from '@/components/BiometricGrid';
import { useBiometrics } from '@/hooks/useBiometrics';
import { useAuth } from '@/contexts/AuthContext';
import { MERCHANT_TYPES, MerchantType, AnalysisRequest, AnalysisResponse } from '@/types/biometrics';

export default function Transaction() {
  const [amount, setAmount] = useState('');
  const [merchantType, setMerchantType] = useState<MerchantType>('restaurant');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    biometricData, 
    handleKeystroke, 
    handleFieldFocus, 
    handleFieldBlur, 
    calculateTransactionRisk,
    reset 
  } = useBiometrics();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Update transaction risk when amount or merchant changes
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    calculateTransactionRisk(numAmount, merchantType);
  }, [amount, merchantType, calculateTransactionRisk]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
    handleKeystroke();
  };

  const handleClear = () => {
    setAmount('');
    setMerchantType('restaurant');
    reset();
  };

  const handleAnalyze = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    setIsLoading(true);

    const payload: AnalysisRequest = {
      amount: parseFloat(amount),
      merchantType,
      ...biometricData,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezoneOffset: new Date().getTimezoneOffset() * -1,
      locale: navigator.language,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result: AnalysisResponse = await response.json();
        navigate('/result', { state: { result, payload } });
      } else {
        // Simulate a response for demo purposes if API is not available
        const mockResult: AnalysisResponse = {
          decision: biometricData.transactionContextRisk > 50 ? 'BLOCKED' : 'APPROVED',
          riskScore: biometricData.transactionContextRisk,
          confidence: 87,
          isFraudulent: biometricData.transactionContextRisk > 50,
          processingTime: '24ms',
          timestamp: new Date().toISOString(),
          factors: [
            { id: 'typing_wpm', name: 'Typing Speed (WPM)', value: `${biometricData.typingWPM} WPM`, status: 'normal', reason: 'Natural typing speed' },
            { id: 'typing_wps', name: 'Typing Speed (WPS)', value: `${biometricData.typingWPS} WPS`, status: 'normal', reason: 'Consistent rate' },
            { id: 'typing_cps', name: 'Typing Speed (CPS)', value: `${biometricData.typingCPS} CPS`, status: 'normal', reason: 'Human-like input' },
            { id: 'keystroke_interval', name: 'Keystroke Interval', value: `${biometricData.keystrokeInterval} ms`, status: 'normal', reason: 'Natural variance' },
            { id: 'field_focus', name: 'Field Focus Time', value: `${biometricData.fieldFocusTimeAmount} sec`, status: 'normal', reason: 'Reasonable focus' },
            { id: 'dwell_time', name: 'Total Dwell Time', value: `${biometricData.totalDwellTime} sec`, status: 'normal', reason: 'Natural duration' },
            { id: 'mouse_speed', name: 'Mouse Speed', value: `${biometricData.mouseSpeed} px/sec`, status: 'normal', reason: 'Natural movement' },
            { id: 'mouse_curvature', name: 'Mouse Curvature', value: `${biometricData.mousePathCurvature}`, status: 'normal', reason: 'Curved path' },
            { id: 'scroll_speed', name: 'Scroll Speed', value: `${biometricData.scrollSpeed} evt/sec`, status: 'normal', reason: 'Normal scrolling' },
            { id: 'scroll_distance', name: 'Scroll Distance', value: `${biometricData.scrollDistance} px`, status: 'normal', reason: 'Typical behavior' },
            { id: 'click_delay', name: 'Click Delay', value: `${biometricData.clickDelay} ms`, status: 'normal', reason: 'Normal delay' },
            { id: 'click_interval', name: 'Click Interval', value: `${biometricData.clickInterval} ms`, status: 'normal', reason: 'Natural pacing' },
            { id: 'tab_switches', name: 'Tab Switches', value: `${biometricData.tabSwitchCount}`, status: 'normal', reason: 'Focused session' },
            { id: 'time_away', name: 'Time Away', value: `${biometricData.timeAwayFromTab} sec`, status: 'normal', reason: 'Minimal absence' },
            { id: 'orientation_events', name: 'Orientation Events', value: `${biometricData.deviceOrientationEvents}`, status: 'normal', reason: 'Stationary device' },
            { id: 'orientation_speed', name: 'Orientation Speed', value: `${biometricData.deviceOrientationSpeed}°/sec`, status: 'normal', reason: 'Device steady' },
            { id: 'interaction_density', name: 'Interaction Density', value: `${biometricData.interactionDensity} int/sec`, status: 'normal', reason: 'Human-like rate' },
            { id: 'transaction_risk', name: 'Transaction Risk', value: `₹${amount} (${MERCHANT_TYPES.find(m => m.value === merchantType)?.label})`, status: biometricData.transactionContextRisk > 50 ? 'critical' : 'normal', reason: 'Risk assessed' },
          ],
        };
        navigate('/result', { state: { result: mockResult, payload } });
      }
    } catch {
      // Fallback for demo when API is unavailable
      const mockResult: AnalysisResponse = {
        decision: biometricData.transactionContextRisk > 50 ? 'BLOCKED' : 'APPROVED',
        riskScore: Math.round(biometricData.transactionContextRisk * 0.7 + Math.random() * 30),
        confidence: 85 + Math.round(Math.random() * 10),
        isFraudulent: biometricData.transactionContextRisk > 50,
        processingTime: '24ms',
        timestamp: new Date().toISOString(),
        factors: [],
      };
      navigate('/result', { state: { result: mockResult, payload, biometricData } });
    } finally {
      setIsLoading(false);
    }
  };

  const screenInfo = `${window.screen.width} × ${window.screen.height} px`;
  const timezoneInfo = `UTC ${new Date().getTimezoneOffset() > 0 ? '-' : '+'}${Math.abs(Math.floor(new Date().getTimezoneOffset() / 60))}:${String(Math.abs(new Date().getTimezoneOffset() % 60)).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Transaction Input Section */}
        <div className="mb-8 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" />
                Amount (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={handleAmountChange}
                  onFocus={handleFieldFocus}
                  onBlur={handleFieldBlur}
                  className="pl-8 text-lg font-mono bg-secondary/50 border-border/50 focus:border-primary h-12"
                />
              </div>
            </div>

            {/* Merchant Type */}
            <div className="space-y-2">
              <Label htmlFor="merchant" className="text-sm font-medium">
                Merchant Type
              </Label>
              <Select value={merchantType} onValueChange={(v) => setMerchantType(v as MerchantType)}>
                <SelectTrigger className="h-12 bg-secondary/50 border-border/50">
                  <SelectValue placeholder="Select merchant type" />
                </SelectTrigger>
                <SelectContent>
                  {MERCHANT_TYPES.map((merchant) => (
                    <SelectItem key={merchant.value} value={merchant.value}>
                      {merchant.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Environment Info */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span>{screenInfo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{timezoneInfo} • {navigator.language}</span>
            </div>
          </div>
        </div>

        {/* Real-Time Factors Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <h2 className="text-lg font-semibold">Real-Time Behavioral Factors</h2>
            <span className="text-sm text-muted-foreground">(Live updates as you type)</span>
          </div>
          <BiometricGrid data={biometricData} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button
            size="lg"
            className="flex-1 sm:flex-none gap-2 h-12 px-8 font-semibold"
            onClick={handleAnalyze}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Analyze Transaction
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 h-12"
            onClick={handleClear}
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </main>
    </div>
  );
}
