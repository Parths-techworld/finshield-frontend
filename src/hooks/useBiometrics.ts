import { useCallback, useState, useRef, useEffect } from 'react';

export interface BiometricData {
  amount: number;
  merchantType: string;
  typingWPM: number;
  typingWPS: number;
  typingCPS: number;
  keystrokeInterval: number;
  keystrokeVariance: number;
  clickDelay: number;
  clickInterval: number;
  doubleTapRate: number;
  holdDurationMs: number;
  pressureConsistency: number;
  touchPathSmoothness: number;
  scrollSpeed: number;
  scrollDistance: number;
  scrollDirectionChanges: number;
  scrollEventCount: number;
  fieldFocusTimeSec: number;
  tabSwitches: number;
  deviceType: string;
  screenWidth: number;
  screenHeight: number;
  deviceOrientation: string;
  timezoneOffset: number;
  locale: string;
  interactionDensity: number;
  totalDwellTime: number;
  mouseSpeed: number;
  timeAwayFromTab: number;
  deviceOrientationEvents: number;
  deviceOrientationSpeed: number;
}

export const useBiometrics = () => {
  const [keystrokes, setKeystrokes] = useState<number[]>([]);
  const [backspaces, setBackspaces] = useState(0);
  const [clicks, setClicks] = useState<number[]>([]);
  const [scrollEvents, setScrollEvents] = useState<{time: number, deltaY: number}[]>([]);
  const [mouseMoves, setMouseMoves] = useState<{time: number, x: number, y: number}[]>([]);
  const [fieldFocusStart, setFieldFocusStart] = useState<number | null>(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [deviceOrientationEvents, setDeviceOrientationEvents] = useState(0);
  const [timeAwayFromTab, setTimeAwayFromTab] = useState(0);
  const [totalDwellTime, setTotalDwellTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const startTime = useRef<number | null>(null);
  const lastTabTime = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRecording) setIsRecording(true);
      if (!startTime.current) startTime.current = Date.now();
      setKeystrokes(prev => [...prev, Date.now()]);
      if (e.key === 'Backspace') {
        setBackspaces(v => v + 1);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (isRecording) {
        setClicks(prev => [...prev, Date.now()]);
      }
    };

    const handleScroll = (e: WheelEvent) => {
      if (isRecording) {
        setScrollEvents(prev => [...prev, {time: Date.now(), deltaY: e.deltaY}]);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isRecording) {
        setMouseMoves(prev => [...prev.slice(-10), {time: Date.now(), x: e.clientX, y: e.clientY}]); // Keep last 10
      }
    };

    const handleFocus = () => {
      if (isRecording) {
        setFieldFocusStart(Date.now());
      }
    };

    const handleBlur = () => {
      if (isRecording && fieldFocusStart) {
        setTotalDwellTime(prev => prev + (Date.now() - fieldFocusStart));
        setFieldFocusStart(null);
      }
    };

    const handleVisibilityChange = () => {
      if (isRecording) {
        if (document.hidden) {
          lastTabTime.current = Date.now();
        } else {
          setTimeAwayFromTab(prev => prev + (Date.now() - lastTabTime.current));
          setTabSwitches(prev => prev + 1);
        }
      }
    };

    const handleDeviceOrientation = () => {
      if (isRecording) {
        setDeviceOrientationEvents(prev => prev + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);
    document.addEventListener('wheel', handleScroll);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('wheel', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [isRecording, fieldFocusStart]);

  const handleKeystroke = useCallback((e?: React.KeyboardEvent | any) => {
    // This is for manual triggering, but events are handled above
  }, []);

  const reset = useCallback(() => {
    setKeystrokes([]);
    setBackspaces(0);
    setClicks([]);
    setScrollEvents([]);
    setMouseMoves([]);
    setFieldFocusStart(null);
    setTabSwitches(0);
    setDeviceOrientationEvents(0);
    setTimeAwayFromTab(0);
    setTotalDwellTime(0);
    setIsRecording(false);
    startTime.current = null;
    lastTabTime.current = Date.now();
  }, []);

  const calculateMetrics = (): BiometricData => {
    const now = Date.now();
    const sessionTime = startTime.current ? (now - startTime.current) / 1000 : 0; // in seconds

    // Typing metrics
    const intervals = keystrokes.slice(1).map((t, i) => t - keystrokes[i]);
    const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    const variance = intervals.length > 1 ? Math.max(...intervals) - Math.min(...intervals) : 0;
    const wpm = avgInterval > 0 ? Math.round(60000 / avgInterval) : 0;
    const wps = wpm / 60;
    const cps = wps / 5; // approx

    // Click metrics
    const clickIntervals = clicks.slice(1).map((t, i) => t - clicks[i]);
    const avgClickInterval = clickIntervals.length > 0 ? clickIntervals.reduce((a, b) => a + b, 0) / clickIntervals.length : 0;
    const doubleTaps = clickIntervals.filter(i => i < 300).length; // <300ms for double tap

    // Scroll metrics
    const scrollSpeed = scrollEvents.length > 1 ? scrollEvents.reduce((sum, e, i) => {
      if (i === 0) return 0;
      const dt = e.time - scrollEvents[i-1].time;
      return sum + (dt > 0 ? Math.abs(e.deltaY) / dt : 0);
    }, 0) / (scrollEvents.length - 1) : 0;
    const scrollDistance = scrollEvents.reduce((sum, e) => sum + Math.abs(e.deltaY), 0);
    const directionChanges = scrollEvents.slice(1).reduce((changes, e, i) => {
      const prev = scrollEvents[i].deltaY;
      return changes + (Math.sign(e.deltaY) !== Math.sign(prev) ? 1 : 0);
    }, 0);

    // Mouse metrics
    const mouseSpeeds = mouseMoves.slice(1).map((m, i) => {
      const prev = mouseMoves[i];
      const dt = m.time - prev.time;
      const dx = m.x - prev.x;
      const dy = m.y - prev.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      return dt > 0 ? dist / dt : 0;
    });
    const avgMouseSpeed = mouseSpeeds.length > 0 ? mouseSpeeds.reduce((a, b) => a + b, 0) / mouseSpeeds.length : 0;

    // Device info
    const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const deviceOrientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
    const timezoneOffset = new Date().getTimezoneOffset();
    const locale = navigator.language;

    // Interaction density
    const totalInteractions = keystrokes.length + clicks.length + scrollEvents.length;
    const interactionDensity = sessionTime > 0 ? totalInteractions / sessionTime : 0;

    return {
      amount: 0, // Will be set from form
      merchantType: '', // Will be set from form
      typingWPM: wpm,
      typingWPS: Math.round(wps * 100) / 100,
      typingCPS: Math.round(cps * 100) / 100,
      keystrokeInterval: Math.round(avgInterval),
      keystrokeVariance: Math.round(variance),
      clickDelay: Math.round(avgClickInterval), // Assuming clickDelay is avg interval
      clickInterval: Math.round(avgClickInterval),
      doubleTapRate: doubleTaps,
      holdDurationMs: 0, // Not captured
      pressureConsistency: 0, // Not captured
      touchPathSmoothness: 0, // Not captured
      scrollSpeed: Math.round(scrollSpeed),
      scrollDistance: Math.round(scrollDistance),
      scrollDirectionChanges: directionChanges,
      scrollEventCount: scrollEvents.length,
      fieldFocusTimeSec: Math.round(totalDwellTime / 1000),
      tabSwitches: tabSwitches,
      deviceType: deviceType,
      screenWidth: screenWidth,
      screenHeight: screenHeight,
      deviceOrientation: deviceOrientation,
      timezoneOffset: timezoneOffset,
      locale: locale,
      interactionDensity: Math.round(interactionDensity * 100) / 100,
      totalDwellTime: Math.round(totalDwellTime / 1000),
      mouseSpeed: Math.round(avgMouseSpeed),
      timeAwayFromTab: Math.round(timeAwayFromTab / 1000),
      deviceOrientationEvents: deviceOrientationEvents,
      deviceOrientationSpeed: 0, // Not calculated
      isWebDriver: navigator.webdriver || false,
      isDebuggerOpen: window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200,
      pluginsLength: navigator.plugins ? navigator.plugins.length : 0,
    };
  };

  return { biometricData: calculateMetrics(), handleKeystroke, reset };
};