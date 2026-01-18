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
  isWebDriver: boolean;
  isDebuggerOpen: boolean;
  pluginsLength: number;
}

export interface Factor {
  id: string;
  name: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
  reason: string;
}

export interface AnalysisResponse {
  decision: 'APPROVED' | 'BLOCKED';
  riskScore: number;
  factors: Factor[];
  isBot: boolean;
  aiVerdict: string;
  aiDescription: string;
  timestamp: string;
}

export interface FraudResult {
  decision: 'APPROVED' | 'BLOCKED' | 'ERROR';
  riskScore: number;
  confidence: number;
  isFraudulent: boolean;
  factors: Factor[];
  timestamp: string;
  processingTime: string;
}

export interface MerchantType {
  id: string;
  name: string;
  icon: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export const MERCHANT_TYPES: MerchantType[] = [
  { id: 'grocery', name: 'Grocery Store', icon: '🛒', riskLevel: 'low' },
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️', riskLevel: 'low' },
  { id: 'gas_station', name: 'Gas Station', icon: '⛽', riskLevel: 'low' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', riskLevel: 'medium' },
  { id: 'online_shopping', name: 'Online Shopping', icon: '🛍️', riskLevel: 'medium' },
  { id: 'electronics', name: 'Electronics', icon: '📱', riskLevel: 'medium' },
  { id: 'travel', name: 'Travel & Hotels', icon: '✈️', riskLevel: 'medium' },
  { id: 'jewelry', name: 'Jewelry & Luxury', icon: '💎', riskLevel: 'high' },
  { id: 'cryptocurrency', name: 'Cryptocurrency', icon: '₿', riskLevel: 'high' },
  { id: 'gambling', name: 'Gambling', icon: '🎰', riskLevel: 'high' },
];
