type PrimitiveRecord = Record<string, unknown>;

export function assertRecord(value: unknown, message: string): PrimitiveRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(message);
  }

  return value as PrimitiveRecord;
}

export function optionalRecord(value: unknown): PrimitiveRecord | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  return value as PrimitiveRecord;
}

export function assertArray(value: unknown, message: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(message);
  }

  return value;
}

export function optionalArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function assertString(value: unknown, message: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(message);
  }

  return value;
}

export function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

export function optionalBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

export function optionalNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function optionalStringArray(value: unknown): string[] {
  return optionalArray(value).filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

export function assertStringArray(value: unknown, message: string): string[] {
  return assertArray(value, message).map((entry, index) => assertString(entry, `${message} (index ${index})`));
}
