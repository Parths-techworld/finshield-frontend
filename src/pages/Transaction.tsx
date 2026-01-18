import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBiometrics } from '../hooks/useBiometrics';
import { MERCHANT_TYPES } from '../types/fraud'; // Path fixed to types folder
import { BiometricGrid } from '../components/BiometricGrid';

export default function Transaction() {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('restaurant');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveFactors, setLiveFactors] = useState<any[]>([]);
  const navigate = useNavigate();

  // Hook from your src/hooks/use-biometrics.ts
  const { biometricData, handleKeystroke, reset } = useBiometrics();

  // Update live factors whenever biometric data changes
  useEffect(() => {
    const analyzeLive = async () => {
      if (!biometricData.typingWPM && !amount) return; // Don't analyze if no data

      try {
        const response = await fetch('http://localhost:3000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...biometricData,
            amount: Number(amount) || 0,
            merchantType: merchant,
          }),
        });
        const result = await response.json();
        setLiveFactors(result.factors);
      } catch (err) {
        console.error("Live analysis error:", err);
      }
    };

    const timeoutId = setTimeout(analyzeLive, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [biometricData, amount, merchant]);

  const handleAnalyze = async (data = biometricData) => {
    if (isAnalyzing) return; // Prevent double-submissions
    
    setIsAnalyzing(true);
    setIsLoading(true);
    try {
      // Generate unique transaction ID
      const transactionId = crypto.randomUUID();
      
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          ...data,
          amount: Number(amount),
          merchantType: merchant,
        }),
      });
      const result = await response.json();
      
      // Send result to the results page
      navigate('/result', { state: { result } });
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const simulateBotAttack = () => {
    if (isAnalyzing) return; // Prevent double-submissions
    
    reset();
    setAmount("99000");
    setMerchant("cryptocurrency");
    // Simulate bot data with multiple suspicious metrics
    const botData = {
      amount: 99000,
      merchantType: "cryptocurrency",
      typingWPM: 350, // Superhuman speed (>300 threshold)
      typingWPS: 350 / 60, // WPM/60 = 5.83
      typingCPS: 1.17,
      keystrokeInterval: 10, // Very fast intervals
      keystrokeVariance: 1, // Perfect consistency
      backspaceCount: 0,
      clickDelay: 5, // Rapid clicking
      clickInterval: 5,
      doubleTapRate: 80, // Many double taps
      holdDurationMs: 0,
      pressureConsistency: 100, // Perfect consistency
      touchPathSmoothness: 100,
      scrollSpeed: 5000, // Very fast scrolling
      scrollDistance: 30000,
      scrollDirectionChanges: 0, // No direction changes
      scrollEventCount: 300, // Many scroll events
      fieldFocusTimeSec: 0.2, // Minimal focus time
      tabSwitches: 30, // Many tab switches
      deviceType: "desktop",
      screenWidth: 1920,
      screenHeight: 1080,
      deviceOrientation: "landscape",
      timezoneOffset: 0,
      locale: "en-US",
      interactionDensity: 40, // High density
      totalDwellTime: 0.2,
      mouseSpeed: 12000, // Very fast mouse
      timeAwayFromTab: 0,
      deviceOrientationEvents: 50, // Many orientation changes
      deviceOrientationSpeed: 0,
      isWebDriver: false,
      isDebuggerOpen: false,
      pluginsLength: 5
    };
    setTimeout(() => handleAnalyze(botData), 100);
  };

  const simulateTamperingAttack = () => {
    if (isAnalyzing) return; // Prevent double-submissions
    
    reset();
    // Randomize amount between 50000 and 100000
    const randomAmount = Math.floor(Math.random() * (100000 - 50000 + 1)) + 50000;
    setAmount(randomAmount.toString());
    
    // Randomly pick high-risk merchant
    const highRiskMerchants = ['cryptocurrency', 'jewelry', 'electronics'];
    const randomMerchant = highRiskMerchants[Math.floor(Math.random() * highRiskMerchants.length)];
    setMerchant(randomMerchant);
    
    // Simulate direct data injection attack - bypass biometric capture
    const tamperingData = {
      amount: randomAmount,
      merchantType: randomMerchant,
      // Inject suspicious but varied biometric data to simulate different attack patterns
      typingWPM: Math.random() > 0.5 ? 400 + Math.random() * 200 : 20 + Math.random() * 30, // Either superhuman or very slow
      typingWPS: 0, // No typing captured
      typingCPS: 0,
      keystrokeInterval: Math.random() * 200, // Random intervals
      keystrokeVariance: Math.random() * 50, // Random variance
      backspaceCount: Math.floor(Math.random() * 20),
      clickDelay: Math.random() * 100,
      clickInterval: Math.random() * 200,
      doubleTapRate: Math.random() * 50,
      holdDurationMs: Math.random() * 500,
      pressureConsistency: Math.random() * 100,
      touchPathSmoothness: Math.random() * 100,
      scrollSpeed: Math.random() * 3000,
      scrollDistance: Math.random() * 50000,
      scrollDirectionChanges: Math.floor(Math.random() * 20),
      scrollEventCount: Math.floor(Math.random() * 200),
      fieldFocusTimeSec: Math.random() * 10,
      tabSwitches: Math.floor(Math.random() * 40),
      deviceType: "desktop",
      screenWidth: 1920,
      screenHeight: 1080,
      deviceOrientation: "landscape",
      timezoneOffset: Math.floor(Math.random() * 24) - 12, // Random timezone
      locale: ["en-US", "zh-CN", "ru-RU", "es-ES"][Math.floor(Math.random() * 4)],
      interactionDensity: Math.random() * 30,
      totalDwellTime: Math.random() * 5,
      mouseSpeed: Math.random() * 10000,
      timeAwayFromTab: Math.random() * 600,
      deviceOrientationEvents: Math.floor(Math.random() * 30),
      deviceOrientationSpeed: Math.random() * 10,
      // Tampering indicators - simulate different detection methods
      isWebDriver: Math.random() > 0.7, // 30% chance of WebDriver detection
      isDebuggerOpen: Math.random() > 0.8, // 20% chance of debugger detection
      pluginsLength: Math.random() > 0.6 ? 0 : Math.floor(Math.random() * 10) // 40% chance of no plugins
    };
    setTimeout(() => handleAnalyze(tamperingData), 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-10 max-w-2xl px-4">
        <div className="space-y-8 bg-card p-8 rounded-3xl border shadow-2xl">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => { setAmount(e.target.value); handleKeystroke(); }} 
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Merchant</Label>
              <select 
                className="w-full h-10 rounded-md border bg-background px-3"
                value={merchant} 
                onChange={(e) => setMerchant(e.target.value)}
              >
                {MERCHANT_TYPES.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <BiometricGrid data={biometricData} />

          {/* Live Factors Display */}
          {liveFactors.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 text-center">Live Behavioral Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {liveFactors.map(f => (
                  <div key={f.id} className={`p-4 rounded-xl border transition-all overflow-hidden ${
                    f.status === 'critical' ? "bg-rose-500/10 border-rose-500/20" :
                    f.status === 'warning' ? "bg-yellow-500/10 border-yellow-500/20" :
                    "bg-green-500/10 border-green-500/20"
                  }`}>
                    <div className="flex flex-col h-full">
                      <div className="flex-1 min-h-0">
                        <p className="font-bold text-sm truncate" title={f.name}>{f.name}</p>
                        <p className="text-xs opacity-70 line-clamp-2" title={f.reason}>{f.reason}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-lg font-mono font-bold truncate" title={f.value}>{f.value}</p>
                        <p className={`text-xs font-bold uppercase ${
                          f.status === 'critical' ? "text-rose-500" :
                          f.status === 'warning' ? "text-yellow-500" :
                          "text-green-500"
                        }`}>{f.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button className="flex-1 h-14 font-bold text-lg" onClick={() => handleAnalyze()} disabled={isLoading}>
              {isLoading ? "PROSESSING..." : "PAY SECURELY"}
            </Button>
            <Button variant="outline" className="border-rose-500 text-rose-500 h-14" onClick={simulateBotAttack}>
              <Zap className="mr-2 h-5 w-5 fill-rose-500" /> BOT ATTACK
            </Button>
            <Button variant="outline" className="border-orange-500 text-orange-500 h-14" onClick={simulateTamperingAttack}>
              <Zap className="mr-2 h-5 w-5 fill-orange-500" /> TAMPERING ATTACK
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}