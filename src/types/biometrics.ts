export interface BiometricFactor {
  id: string;
  name: string;
  category: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  description: string;
  threshold?: { min?: number; max?: number };
}

export interface BiometricData {
  typingWPM: number;
  typingWPS: number;
  typingCPS: number;
  keystrokeInterval: number;
  keystrokeVariance: number;
  fieldFocusTimeAmount: number;
  totalDwellTime: number;
  mouseSpeed: number;
  mousePathCurvature: number;
  scrollSpeed: number;
  scrollDistance: number;
  clickDelay: number;
  clickInterval: number;
  tabSwitchCount: number;
  timeAwayFromTab: number;
  deviceOrientationEvents: number;
  deviceOrientationSpeed: number;
  interactionDensity: number;
  transactionContextRisk: number;
}

export interface AnalysisRequest extends BiometricData {
  amount: number;
  merchantType: string;
  screenWidth: number;
  screenHeight: number;
  timezoneOffset: number;
  locale: string;
  timestamp: string;
}

export interface AnalysisResponse {
  decision: 'APPROVED' | 'BLOCKED';
  riskScore: number;
  confidence: number;
  isFraudulent: boolean;
  processingTime: string;
  timestamp: string;
  factors: Array<{
    id: string;
    name: string;
    value: string;
    status: 'normal' | 'warning' | 'critical';
    reason: string;
    threshold?: { min?: number; max?: number };
  }>;
}

export type MerchantType = 
  | 'grocery'
  | 'restaurant'
  | 'gas_station'
  | 'entertainment'
  | 'online_shopping'
  | 'jewelry'
  | 'electronics'
  | 'travel'
  | 'cryptocurrency'
  | 'gambling';

export const MERCHANT_TYPES: { value: MerchantType; label: string; riskWeight: number }[] = [
  { value: 'grocery', label: 'Grocery Store', riskWeight: 1 },
  { value: 'restaurant', label: 'Restaurant', riskWeight: 1 },
  { value: 'gas_station', label: 'Gas Station', riskWeight: 1.2 },
  { value: 'entertainment', label: 'Entertainment', riskWeight: 1.3 },
  { value: 'online_shopping', label: 'Online Shopping', riskWeight: 1.5 },
  { value: 'jewelry', label: 'Jewelry', riskWeight: 2 },
  { value: 'electronics', label: 'Electronics', riskWeight: 1.8 },
  { value: 'travel', label: 'Travel', riskWeight: 1.6 },
  { value: 'cryptocurrency', label: 'Cryptocurrency', riskWeight: 3 },
  { value: 'gambling', label: 'Gambling', riskWeight: 2.5 },
];
