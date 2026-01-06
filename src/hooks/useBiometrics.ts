import { useState, useRef, useCallback, useEffect } from 'react';
import { BiometricData, MerchantType, MERCHANT_TYPES } from '@/types/biometrics';

export function useBiometrics() {
  const pageLoadTime = useRef(Date.now());
  const fieldFocusStart = useRef<number | null>(null);
  const keystrokeTimes = useRef<number[]>([]);
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);
  const mouseStartPosition = useRef<{ x: number; y: number } | null>(null);
  const totalMouseDistance = useRef(0);
  const straightLineDistance = useRef(0);
  const scrollEvents = useRef<number[]>([]);
  const totalScrollDistance = useRef(0);
  const clickTimes = useRef<number[]>([]);
  const tabSwitchCount = useRef(0);
  const timeAwayStart = useRef<number | null>(null);
  const totalTimeAway = useRef(0);
  const orientationEvents = useRef(0);
  const lastOrientationTime = useRef<number | null>(null);
  const orientationSpeeds = useRef<number[]>([]);
  const totalInteractions = useRef(0);

  const [biometricData, setBiometricData] = useState<BiometricData>({
    typingWPM: 0,
    typingWPS: 0,
    typingCPS: 0,
    keystrokeInterval: 0,
    keystrokeVariance: 0,
    fieldFocusTimeAmount: 0,
    totalDwellTime: 0,
    mouseSpeed: 0,
    mousePathCurvature: 1,
    scrollSpeed: 0,
    scrollDistance: 0,
    clickDelay: 0,
    clickInterval: 0,
    tabSwitchCount: 0,
    timeAwayFromTab: 0,
    deviceOrientationEvents: 0,
    deviceOrientationSpeed: 0,
    interactionDensity: 0,
    transactionContextRisk: 0,
  });

  // Calculate keystroke metrics
  const handleKeystroke = useCallback(() => {
    const now = Date.now();
    keystrokeTimes.current.push(now);
    totalInteractions.current++;

    if (keystrokeTimes.current.length > 3) {
      const times = keystrokeTimes.current;
      const timeSpan = times[times.length - 1] - times[0];
      const chars = times.length;
      const minutes = timeSpan / 60000;
      const wpm = minutes > 0 ? (chars / 5) / minutes : 0;
      const wps = wpm / 60;
      const cps = timeSpan > 0 ? (chars / (timeSpan / 1000)) : 0;

      // Calculate intervals and variance
      const intervals: number[] = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }
      const avgInterval = intervals.length > 0 
        ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
        : 0;
      
      const variance = intervals.length > 1
        ? Math.sqrt(
            intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length
          )
        : 0;

      setBiometricData(prev => ({
        ...prev,
        typingWPM: Math.round(wpm),
        typingWPS: parseFloat(wps.toFixed(2)),
        typingCPS: parseFloat(cps.toFixed(2)),
        keystrokeInterval: Math.round(avgInterval),
        keystrokeVariance: parseFloat((variance / avgInterval || 0).toFixed(2)),
      }));
    }
  }, []);

  // Focus tracking
  const handleFieldFocus = useCallback(() => {
    fieldFocusStart.current = Date.now();
  }, []);

  const handleFieldBlur = useCallback(() => {
    if (fieldFocusStart.current) {
      const focusTime = (Date.now() - fieldFocusStart.current) / 1000;
      setBiometricData(prev => ({
        ...prev,
        fieldFocusTimeAmount: parseFloat(focusTime.toFixed(1)),
      }));
    }
  }, []);

  // Mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    const elapsedSeconds = (now - pageLoadTime.current) / 1000;
    
    if (!mouseStartPosition.current) {
      mouseStartPosition.current = { x: e.clientX, y: e.clientY };
    }
    
    if (lastMousePosition.current) {
      const distance = Math.hypot(
        e.clientX - lastMousePosition.current.x,
        e.clientY - lastMousePosition.current.y
      );
      totalMouseDistance.current += distance;
    }
    
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
    
    // Calculate straight line distance from start
    if (mouseStartPosition.current) {
      straightLineDistance.current = Math.hypot(
        e.clientX - mouseStartPosition.current.x,
        e.clientY - mouseStartPosition.current.y
      );
    }
    
    const speed = elapsedSeconds > 0 ? totalMouseDistance.current / elapsedSeconds : 0;
    const curvature = straightLineDistance.current > 10 
      ? totalMouseDistance.current / straightLineDistance.current 
      : 1;
    
    setBiometricData(prev => ({
      ...prev,
      mouseSpeed: Math.round(speed),
      mousePathCurvature: parseFloat(curvature.toFixed(2)),
    }));
  }, []);

  // Scroll tracking
  const handleScroll = useCallback((e: Event) => {
    const now = Date.now();
    scrollEvents.current.push(now);
    totalInteractions.current++;
    
    const target = e.target as HTMLElement;
    if (target) {
      totalScrollDistance.current += Math.abs(target.scrollTop || 0);
    }
    
    // Calculate scroll speed (events in last second)
    const oneSecondAgo = now - 1000;
    const recentScrolls = scrollEvents.current.filter(t => t > oneSecondAgo);
    
    setBiometricData(prev => ({
      ...prev,
      scrollSpeed: parseFloat(recentScrolls.length.toFixed(1)),
      scrollDistance: Math.round(totalScrollDistance.current),
    }));
  }, []);

  // Click tracking
  const handleClick = useCallback(() => {
    const now = Date.now();
    clickTimes.current.push(now);
    totalInteractions.current++;
    
    if (clickTimes.current.length === 1) {
      const delay = now - pageLoadTime.current;
      setBiometricData(prev => ({
        ...prev,
        clickDelay: delay,
      }));
    }
    
    if (clickTimes.current.length > 1) {
      const intervals: number[] = [];
      for (let i = 1; i < clickTimes.current.length; i++) {
        intervals.push(clickTimes.current[i] - clickTimes.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setBiometricData(prev => ({
        ...prev,
        clickInterval: Math.round(avgInterval),
      }));
    }
  }, []);

  // Tab visibility tracking
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      tabSwitchCount.current++;
      timeAwayStart.current = Date.now();
    } else if (timeAwayStart.current) {
      totalTimeAway.current += (Date.now() - timeAwayStart.current) / 1000;
      timeAwayStart.current = null;
    }
    
    setBiometricData(prev => ({
      ...prev,
      tabSwitchCount: tabSwitchCount.current,
      timeAwayFromTab: parseFloat(totalTimeAway.current.toFixed(1)),
    }));
  }, []);

  // Device orientation
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const now = Date.now();
    orientationEvents.current++;
    
    if (lastOrientationTime.current && e.gamma !== null) {
      const timeDiff = (now - lastOrientationTime.current) / 1000;
      if (timeDiff > 0) {
        const speed = Math.abs(e.gamma) / timeDiff;
        orientationSpeeds.current.push(speed);
      }
    }
    lastOrientationTime.current = now;
    
    const avgSpeed = orientationSpeeds.current.length > 0
      ? orientationSpeeds.current.reduce((a, b) => a + b, 0) / orientationSpeeds.current.length
      : 0;
    
    setBiometricData(prev => ({
      ...prev,
      deviceOrientationEvents: orientationEvents.current,
      deviceOrientationSpeed: parseFloat(avgSpeed.toFixed(1)),
    }));
  }, []);

  // Transaction context risk calculation
  const calculateTransactionRisk = useCallback((amount: number, merchantType: MerchantType) => {
    const merchant = MERCHANT_TYPES.find(m => m.value === merchantType);
    const riskWeight = merchant?.riskWeight || 1;
    
    let amountRisk = 0;
    if (amount > 100000) amountRisk = 50;
    else if (amount > 50000) amountRisk = 30;
    else if (amount > 10000) amountRisk = 15;
    else if (amount > 5000) amountRisk = 5;
    
    const risk = Math.min(100, amountRisk * riskWeight);
    
    setBiometricData(prev => ({
      ...prev,
      transactionContextRisk: Math.round(risk),
    }));
    
    return risk;
  }, []);

  // Update dwell time and interaction density
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - pageLoadTime.current) / 1000;
      const density = elapsed > 0 ? totalInteractions.current / elapsed : 0;
      
      setBiometricData(prev => ({
        ...prev,
        totalDwellTime: parseFloat(elapsed.toFixed(1)),
        interactionDensity: parseFloat(density.toFixed(2)),
      }));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('click', handleClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    if (typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleMouseMove, handleScroll, handleClick, handleVisibilityChange, handleOrientation]);

  const reset = useCallback(() => {
    pageLoadTime.current = Date.now();
    fieldFocusStart.current = null;
    keystrokeTimes.current = [];
    lastMousePosition.current = null;
    mouseStartPosition.current = null;
    totalMouseDistance.current = 0;
    straightLineDistance.current = 0;
    scrollEvents.current = [];
    totalScrollDistance.current = 0;
    clickTimes.current = [];
    tabSwitchCount.current = 0;
    timeAwayStart.current = null;
    totalTimeAway.current = 0;
    orientationEvents.current = 0;
    lastOrientationTime.current = null;
    orientationSpeeds.current = [];
    totalInteractions.current = 0;
    
    setBiometricData({
      typingWPM: 0,
      typingWPS: 0,
      typingCPS: 0,
      keystrokeInterval: 0,
      keystrokeVariance: 0,
      fieldFocusTimeAmount: 0,
      totalDwellTime: 0,
      mouseSpeed: 0,
      mousePathCurvature: 1,
      scrollSpeed: 0,
      scrollDistance: 0,
      clickDelay: 0,
      clickInterval: 0,
      tabSwitchCount: 0,
      timeAwayFromTab: 0,
      deviceOrientationEvents: 0,
      deviceOrientationSpeed: 0,
      interactionDensity: 0,
      transactionContextRisk: 0,
    });
  }, []);

  return {
    biometricData,
    handleKeystroke,
    handleFieldFocus,
    handleFieldBlur,
    calculateTransactionRisk,
    reset,
  };
}
