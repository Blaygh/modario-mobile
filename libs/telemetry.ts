export type TelemetryLevel = 'info' | 'warn' | 'error';

export type TelemetryEvent = {
  event: string;
  level?: TelemetryLevel;
  endpoint?: string;
  operation?: string;
  screen?: string;
  step?: string;
  status?: number | string | null;
  fallbackUsed?: boolean;
  retrySucceeded?: boolean;
  userId?: string | null;
  message?: string;
  context?: Record<string, unknown>;
};

export function logTelemetry(payload: TelemetryEvent) {
  const level = payload.level ?? 'info';
  const method = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;

  method('[telemetry]', {
    timestamp: new Date().toISOString(),
    ...payload,
  });
}
