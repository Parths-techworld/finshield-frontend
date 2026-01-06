import { BiometricData } from '@/types/biometrics';
import { FactorCard } from './FactorCard';

interface BiometricGridProps {
  data: BiometricData;
}

type Status = 'normal' | 'warning' | 'critical';

function getStatus(value: number, min: number, max: number, warningMin?: number, warningMax?: number): Status {
  if (value >= min && value <= max) return 'normal';
  if (warningMin !== undefined && warningMax !== undefined) {
    if ((value >= warningMin && value < min) || (value > max && value <= warningMax)) {
      return 'warning';
    }
  }
  return 'critical';
}

function getScrollDistanceStatus(value: number): Status {
  return value > 2000 ? 'warning' : 'normal';
}

export function BiometricGrid({ data }: BiometricGridProps) {
  const getMouseSpeedStatus = (): Status => {
    if (data.mouseSpeed === 0) return 'critical';
    return getStatus(data.mouseSpeed, 100, 500, 50, 800);
  };

  const getMouseCurvatureStatus = (): Status => {
    if (data.mousePathCurvature < 1.1) return 'critical';
    if (data.mousePathCurvature < 1.2) return 'warning';
    return 'normal';
  };

  const getScrollSpeedStatus = (): Status => {
    if (data.scrollSpeed > 5) return 'critical';
    return getStatus(data.scrollSpeed, 0, 2, 0, 4);
  };

  const getClickDelayStatus = (): Status => {
    if (data.clickDelay < 200) return 'critical';
    return getStatus(data.clickDelay, 500, 5000, 200, 8000);
  };

  const getClickIntervalStatus = (): Status => {
    if (data.clickInterval < 500) return 'critical';
    return getStatus(data.clickInterval, 1000, 5000, 500, 8000);
  };

  const getTabSwitchStatus = (): Status => {
    if (data.tabSwitchCount === 0) return 'normal';
    if (data.tabSwitchCount <= 2) return 'warning';
    return 'critical';
  };

  const getTimeAwayStatus = (): Status => {
    if (data.timeAwayFromTab < 2) return 'normal';
    if (data.timeAwayFromTab < 10) return 'warning';
    return 'critical';
  };

  const getOrientationEventsStatus = (): Status => {
    if (data.deviceOrientationEvents === 0) return 'normal';
    if (data.deviceOrientationEvents <= 2) return 'warning';
    return 'critical';
  };

  const getOrientationSpeedStatus = (): Status => {
    if (data.deviceOrientationSpeed < 45) return 'normal';
    if (data.deviceOrientationSpeed < 90) return 'warning';
    return 'critical';
  };

  const getInteractionDensityStatus = (): Status => {
    if (data.interactionDensity > 5) return 'critical';
    return getStatus(data.interactionDensity, 0.1, 1, 0, 2);
  };

  const getTransactionRiskStatus = (): Status => {
    if (data.transactionContextRisk < 30) return 'normal';
    if (data.transactionContextRisk < 60) return 'warning';
    return 'critical';
  };

  const factors: Array<{
    name: string;
    value: number;
    unit: string;
    status: Status;
    description: string;
  }> = [
    // Typing Behavior
    {
      name: 'Typing Speed (WPM)',
      value: data.typingWPM,
      unit: 'WPM',
      status: getStatus(data.typingWPM, 40, 80, 20, 100),
      description: 'Words per minute. Normal human typing ranges from 40-80 WPM. Extremely fast or slow typing may indicate automation or struggle.',
    },
    {
      name: 'Typing Speed (WPS)',
      value: data.typingWPS,
      unit: 'WPS',
      status: getStatus(data.typingWPS, 0.67, 1.33, 0.33, 1.67),
      description: 'Words per second. Derived from WPM. Consistent rate indicates natural typing behavior.',
    },
    {
      name: 'Typing Speed (CPS)',
      value: data.typingCPS,
      unit: 'CPS',
      status: getStatus(data.typingCPS, 3.3, 6.6, 1.5, 10),
      description: 'Characters per second. Measures raw input speed. Bot-like input often shows unnaturally consistent CPS.',
    },
    {
      name: 'Keystroke Interval',
      value: data.keystrokeInterval,
      unit: 'ms',
      status: getStatus(data.keystrokeInterval, 75, 150, 50, 300),
      description: 'Average time between keystrokes. Humans show natural variance; bots tend to be perfectly regular.',
    },
    // Focus & Dwell
    {
      name: 'Field Focus Time',
      value: data.fieldFocusTimeAmount,
      unit: 'sec',
      status: getStatus(data.fieldFocusTimeAmount, 3, 15, 1, 30),
      description: 'Time spent focused on the amount field. Too quick suggests copy-paste or automation.',
    },
    {
      name: 'Total Dwell Time',
      value: data.totalDwellTime,
      unit: 'sec',
      status: getStatus(data.totalDwellTime, 5, 30, 2, 60),
      description: 'Total time on page before submission. Rushed or excessively long sessions are suspicious.',
    },
    // Mouse Interaction
    {
      name: 'Mouse Speed',
      value: data.mouseSpeed,
      unit: 'px/sec',
      status: getMouseSpeedStatus(),
      description: 'Average cursor velocity. Zero movement suggests touch device or script automation.',
    },
    {
      name: 'Mouse Curvature',
      value: data.mousePathCurvature,
      unit: '',
      status: getMouseCurvatureStatus(),
      description: 'Ratio of actual path to straight line. Humans move in curves (>1.2); bots move in straight lines (≈1.0).',
    },
    // Scroll Behavior
    {
      name: 'Scroll Speed',
      value: data.scrollSpeed,
      unit: 'evt/sec',
      status: getScrollSpeedStatus(),
      description: 'Scroll events per second. Rapid scrolling (>5/sec) indicates automated behavior.',
    },
    {
      name: 'Scroll Distance',
      value: data.scrollDistance,
      unit: 'px',
      status: getScrollDistanceStatus(data.scrollDistance),
      description: 'Total pixels scrolled. Excessive scrolling may indicate confusion or automation.',
    },
    // Click Behavior
    {
      name: 'Click Delay',
      value: data.clickDelay,
      unit: 'ms',
      status: getClickDelayStatus(),
      description: 'Time from page load to first click. Instant clicks (<200ms) indicate bots.',
    },
    {
      name: 'Click Interval',
      value: data.clickInterval,
      unit: 'ms',
      status: getClickIntervalStatus(),
      description: 'Average time between clicks. Rapid clicking (<500ms) suggests automation.',
    },
    // Session & Device
    {
      name: 'Tab Switches',
      value: data.tabSwitchCount,
      unit: '',
      status: getTabSwitchStatus(),
      description: 'Number of times user left this tab. Frequent switching may indicate multi-tasking or fraud scripts.',
    },
    {
      name: 'Time Away',
      value: data.timeAwayFromTab,
      unit: 'sec',
      status: getTimeAwayStatus(),
      description: 'Total time spent away from tab. Extended absence during transaction is suspicious.',
    },
    {
      name: 'Orientation Events',
      value: data.deviceOrientationEvents,
      unit: '',
      status: getOrientationEventsStatus(),
      description: 'Device rotation count. Frequent rotations during transaction entry is unusual.',
    },
    {
      name: 'Orientation Speed',
      value: data.deviceOrientationSpeed,
      unit: '°/sec',
      status: getOrientationSpeedStatus(),
      description: 'Rate of device rotation. Rapid rotation suggests device is being manipulated.',
    },
    // Interaction Density
    {
      name: 'Interaction Density',
      value: data.interactionDensity,
      unit: 'int/sec',
      status: getInteractionDensityStatus(),
      description: 'Combined rate of all interactions. Bot-like behavior shows >5 interactions/second.',
    },
    {
      name: 'Transaction Risk',
      value: data.transactionContextRisk,
      unit: '/100',
      status: getTransactionRiskStatus(),
      description: 'Risk score based on amount and merchant type combination. High-value crypto/gambling is riskier.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {factors.map((factor) => (
        <FactorCard
          key={factor.name}
          name={factor.name}
          value={factor.value}
          unit={factor.unit}
          status={factor.status}
          description={factor.description}
        />
      ))}
    </div>
  );
}
