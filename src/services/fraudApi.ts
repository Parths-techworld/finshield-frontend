import { BiometricData, FraudResult } from '@/types/fraud';

const API_BASE_URL = 'http://localhost:3000';

export async function analyzeFraud(data: BiometricData): Promise<FraudResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fraud analysis API error:', error);
    // Return a mock result for demo purposes when API is unavailable
    return generateMockResult(data);
  }
}

function generateMockResult(data: BiometricData): FraudResult {
  const factors = analyzeFactors(data);
  const riskScore = calculateRiskScore(factors);
  const isFraudulent = riskScore > 50;

  return {
    decision: isFraudulent ? 'BLOCKED' : 'APPROVED',
    riskScore,
    confidence: Math.min(99, 75 + Math.abs(riskScore - 50) / 2),
    isFraudulent,
    factors,
    timestamp: new Date().toISOString(),
    processingTime: `${Math.floor(Math.random() * 50 + 10)}ms`,
  };
}

function determineStatus(value: number, min: number, max: number): 'normal' | 'warning' | 'critical' {
  if (value < min * 0.5 || value > max * 2) return 'critical';
  if (value < min || value > max) return 'warning';
  return 'normal';
}

function analyzeFactors(data: BiometricData) {
  const factors = [];

  // 1. Typing Speed (WPM)
  let status = determineStatus(data.typingWPM, 30, 70);
  factors.push({
    id: 'typing_wpm',
    name: 'Typing Speed (WPM)',
    value: `${data.typingWPM.toFixed(0)} WPM`,
    status,
    reason: `Typing speed at ${data.typingWPM.toFixed(0)} WPM - ${status === 'normal' ? 'natural rhythm' : 'suspicious pattern'}`,
    threshold: { min: 30, max: 70 },
  });

  // 2. Typing Speed (WPS)
  status = determineStatus(data.typingWPS, 0.5, 2.0);
  factors.push({
    id: 'typing_wps',
    name: 'Typing Speed (WPS)',
    value: `${data.typingWPS.toFixed(2)} WPS`,
    status,
    reason: `Word input rate ${data.typingWPS.toFixed(2)} words/sec - ${status === 'normal' ? 'consistent typing' : 'irregular pattern'}`,
    threshold: { min: 0.5, max: 2.0 },
  });

  // 3. Characters Per Second
  status = determineStatus(data.typingCPS, 2, 5);
  factors.push({
    id: 'typing_cps',
    name: 'Characters Per Second (CPS)',
    value: `${data.typingCPS.toFixed(1)} CPS`,
    status,
    reason: `Character input rate ${data.typingCPS.toFixed(1)} chars/sec - ${status === 'normal' ? 'human-like speed' : 'robotic pattern'}`,
    threshold: { min: 2, max: 5 },
  });

  // 4. Keystroke Interval
  status = determineStatus(data.keystrokeInterval, 80, 300);
  factors.push({
    id: 'keystroke_interval',
    name: 'Keystroke Interval (ms)',
    value: `${data.keystrokeInterval.toFixed(0)} ms`,
    status,
    reason: `Time between keys: ${data.keystrokeInterval.toFixed(0)}ms - ${status === 'normal' ? 'natural rhythm' : 'irregular intervals'}`,
    threshold: { min: 80, max: 300 },
  });

  // 5. Field Focus Time
  status = determineStatus(data.fieldFocusTimeSec, 2, 10);
  factors.push({
    id: 'field_focus',
    name: 'Field Focus Time (seconds)',
    value: `${data.fieldFocusTimeSec.toFixed(1)} sec`,
    status,
    reason: `Focus duration ${data.fieldFocusTimeSec.toFixed(1)}s on amount field - ${status === 'normal' ? 'normal focus' : 'unusual behavior'}`,
    threshold: { min: 2, max: 10 },
  });

  // 6. Total Dwell Time
  status = determineStatus(data.totalDwellTime, 5, 30);
  factors.push({
    id: 'dwell_time',
    name: 'Total Dwell Time (seconds)',
    value: `${data.totalDwellTime.toFixed(1)} sec`,
    status,
    reason: `Total interaction time ${data.totalDwellTime.toFixed(1)}s - ${status === 'normal' ? 'natural duration' : 'suspicious timing'}`,
    threshold: { min: 5, max: 30 },
  });

  // 7. Mouse Speed
  status = determineStatus(data.mouseSpeed, 200, 1000);
  factors.push({
    id: 'mouse_speed',
    name: 'Mouse Speed (px/sec)',
    value: `${data.mouseSpeed.toFixed(0)} px/sec`,
    status,
    reason: `Cursor movement speed ${data.mouseSpeed.toFixed(0)} px/sec - ${status === 'normal' ? 'natural movement' : 'suspicious pattern'}`,
    threshold: { min: 200, max: 1000 },
  });

  // 8. Touch Path Smoothness
  status = determineStatus(data.touchPathSmoothness, 70, 100);
  factors.push({
    id: 'mouse_curvature',
    name: 'Touch Path Smoothness',
    value: `${data.touchPathSmoothness.toFixed(0)}/100`,
    status,
    reason: `Path smoothness score ${data.touchPathSmoothness.toFixed(0)}/100 - ${status === 'normal' ? 'curved natural path' : 'straight robotic path'}`,
    threshold: { min: 70, max: 100 },
  });

  // 9. Scroll Speed
  status = determineStatus(data.scrollSpeed, 200, 500);
  factors.push({
    id: 'scroll_speed',
    name: 'Scroll Speed (px/sec)',
    value: `${data.scrollSpeed.toFixed(0)} px/sec`,
    status,
    reason: `Scrolling speed ${data.scrollSpeed.toFixed(0)} px/sec - ${status === 'normal' ? 'smooth scrolling' : 'erratic scrolling'}`,
    threshold: { min: 200, max: 500 },
  });

  // 10. Scroll Events
  status = data.scrollEventCount > 0 && data.scrollEventCount <= 5 ? 'normal' : data.scrollEventCount === 0 ? 'critical' : 'warning';
  factors.push({
    id: 'scroll_distance',
    name: 'Scroll Distance (px)',
    value: `${data.scrollDistance.toFixed(0)} px (${data.scrollEventCount} events)`,
    status,
    reason: `${data.scrollEventCount} scroll events - ${status === 'normal' ? 'focused browsing' : 'no scrolling detected (bot)'}`,
    threshold: { min: 1, max: 5 },
  });

  // 11. Click Delay
  status = determineStatus(data.clickDelay, 500, 3000);
  factors.push({
    id: 'click_delay',
    name: 'Click Delay (ms)',
    value: `${data.clickDelay.toFixed(0)} ms`,
    status,
    reason: `Delay to first click ${data.clickDelay.toFixed(0)}ms - ${status === 'normal' ? 'human reaction time' : 'automation detected'}`,
    threshold: { min: 500, max: 3000 },
  });

  // 12. Click Interval
  status = determineStatus(data.clickInterval, 300, 2000);
  factors.push({
    id: 'click_interval',
    name: 'Click Interval (ms)',
    value: `${data.clickInterval.toFixed(0)} ms`,
    status,
    reason: `Time between clicks ${data.clickInterval.toFixed(0)}ms - ${status === 'normal' ? 'natural pacing' : 'suspicious timing'}`,
    threshold: { min: 300, max: 2000 },
  });

  // 13. Tab Switches
  status = data.tabSwitches <= 1 ? 'normal' : data.tabSwitches === 2 ? 'warning' : 'critical';
  factors.push({
    id: 'tab_switches',
    name: 'Tab Switches (count)',
    value: `${data.tabSwitches} switches`,
    status,
    reason: `${data.tabSwitches} tab switches - ${status === 'normal' ? 'focused session' : 'user distraction/bot'}`,
    threshold: { min: 0, max: 1 },
  });

  // 14. Time Away
  status = data.timeAwayFromTab < 5 ? 'normal' : data.timeAwayFromTab < 15 ? 'warning' : 'critical';
  factors.push({
    id: 'time_away',
    name: 'Time Away (seconds)',
    value: `${data.timeAwayFromTab.toFixed(1)} sec`,
    status,
    reason: `Absence from page ${data.timeAwayFromTab.toFixed(1)}s - ${status === 'normal' ? 'continuous attention' : 'user distraction'}`,
    threshold: { min: 0, max: 5 },
  });

  // 15. Orientation Events
  status = data.deviceOrientationEvents === 0 ? 'critical' : data.deviceOrientationEvents <= 3 ? 'normal' : 'warning';
  factors.push({
    id: 'orientation_events',
    name: 'Orientation Changes (count)',
    value: `${data.deviceOrientationEvents} changes`,
    status,
    reason: `${data.deviceOrientationEvents} orientation changes - ${status === 'normal' ? 'natural device movement' : 'stationary device (emulator)'}`,
    threshold: { min: 0, max: 3 },
  });

  // 16. Orientation Speed
  status = data.deviceOrientationSpeed <= 10 ? 'normal' : 'warning';
  factors.push({
    id: 'orientation_speed',
    name: 'Orientation Speed (°/sec)',
    value: `${data.deviceOrientationSpeed.toFixed(1)}°/sec`,
    status,
    reason: `Device tilt speed ${data.deviceOrientationSpeed.toFixed(1)}°/sec - ${status === 'normal' ? 'steady device' : 'erratic movement'}`,
    threshold: { min: 0, max: 10 },
  });

  // 17. Interaction Density
  status = determineStatus(data.interactionDensity, 1, 3);
  factors.push({
    id: 'interaction_density',
    name: 'Interaction Density (int/sec)',
    value: `${data.interactionDensity.toFixed(1)} int/sec`,
    status,
    reason: `${data.interactionDensity.toFixed(1)} interactions/sec - ${status === 'normal' ? 'natural human pace' : 'bot-like automation'}`,
    threshold: { min: 1, max: 3 },
  });

  // 18. Transaction Context Risk
  let amountRisk = 0;
  if (data.amount > 50000) amountRisk = 15;
  else if (data.amount > 20000) amountRisk = 10;
  else if (data.amount > 5000) amountRisk = 5;

  const merchantRisks: Record<string, number> = {
    grocery: 1, restaurant: 1, gas_station: 1.2, entertainment: 1.3,
    online_shopping: 1.5, jewelry: 2, electronics: 1.8, travel: 1.6,
    cryptocurrency: 3, gambling: 2.5,
  };
  const merchantRisk = (merchantRisks[data.merchantType] || 1) * 5;
  const transactionRisk = amountRisk + merchantRisk;

  status = transactionRisk > 15 ? 'critical' : transactionRisk > 5 ? 'warning' : 'normal';
  factors.push({
    id: 'transaction_risk',
    name: 'Transaction Context Risk',
    value: `₹${data.amount.toFixed(0)} (${data.merchantType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())})`,
    status,
    reason: `Amount ₹${data.amount.toFixed(0)} at ${data.merchantType.replace('_', ' ')} merchant - ${status !== 'normal' ? 'high-risk transaction' : 'typical transaction'}`,
    threshold: { min: 0, max: 20 },
  });

  return factors;
}

function calculateRiskScore(factors: { status: string }[]): number {
  let score = 0;
  factors.forEach(f => {
    if (f.status === 'critical') score += 8;
    else if (f.status === 'warning') score += 4;
    else score += 1;
  });
  return Math.min(100, Math.max(0, score));
}
