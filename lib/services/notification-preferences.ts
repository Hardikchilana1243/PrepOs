// ============================================================================
// PREPOS NOTIFICATION PREFERENCE SERVICE (PHASE 6.16)
// Strongly Typed Service Managing Student-Configured Placement Reminders
// Strictly Scoped by Authenticated User & Deterministic Preference Bounds
// ============================================================================

import prisma from '../db';

// ----------------------------------------------------------------------------
// INTERFACES & DOMAIN TYPES
// ----------------------------------------------------------------------------

export interface NotificationPreferences {
  id: string;
  userId: string;
  dailyExecutionEnabled: boolean;
  revisionDueEnabled: boolean;
  revisionOverdueEnabled: boolean;
  incompleteDailyEnabled: boolean;
  preferredTime: string; // HH:mm format (e.g. "09:00")
  timezone: string; // IANA timezone e.g. "UTC" or "Asia/Kolkata"
  preferredWeekdays: number[]; // 1 = Monday ... 7 = Sunday
  maxRemindersPerDay: number; // Positive integer e.g. 1-10
  quietHoursEnabled: boolean;
  quietHoursStart: string | null; // e.g. "22:00"
  quietHoursEnd: string | null; // e.g. "08:00"
  lastReminderState: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePreferencesInput {
  dailyExecutionEnabled?: boolean;
  revisionDueEnabled?: boolean;
  revisionOverdueEnabled?: boolean;
  incompleteDailyEnabled?: boolean;
  preferredTime?: string;
  timezone?: string;
  preferredWeekdays?: number[];
  maxRemindersPerDay?: number;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}

// ----------------------------------------------------------------------------
// SENSIBLE DEFAULT CONFIGURATION
// Used strictly as fallback configuration, never for synthetic content
// ----------------------------------------------------------------------------

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  dailyExecutionEnabled: true,
  revisionDueEnabled: true,
  revisionOverdueEnabled: true,
  incompleteDailyEnabled: true,
  preferredTime: '09:00',
  timezone: 'UTC',
  preferredWeekdays: [1, 2, 3, 4, 5, 6, 7], // Every day by default
  maxRemindersPerDay: 3,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

// ----------------------------------------------------------------------------
// VALIDATION & HELPERS
// ----------------------------------------------------------------------------

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTimeString(time: string): boolean {
  return TIME_REGEX.test(time);
}

export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function parseWeekdays(raw: string): number[] {
  if (!raw) return [1, 2, 3, 4, 5, 6, 7];
  return raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 7);
}

export function serializeWeekdays(days: number[]): string {
  const uniqueValid = Array.from(new Set(days))
    .filter((n) => n >= 1 && n <= 7)
    .sort((a, b) => a - b);
  return uniqueValid.length > 0 ? uniqueValid.join(',') : '1,2,3,4,5,6,7';
}

/**
 * Checks whether a given local time in HH:mm is within configured quiet hours.
 */
export function isWithinQuietHours(
  currentTimeHHMM: string,
  start: string | null,
  end: string | null
): boolean {
  if (!start || !end || !isValidTimeString(start) || !isValidTimeString(end)) {
    return false;
  }

  if (start === end) {
    return false;
  }

  // Crosses midnight: e.g. 22:00 to 08:00
  if (start > end) {
    return currentTimeHHMM >= start || currentTimeHHMM < end;
  }

  // Same day: e.g. 13:00 to 15:00
  return currentTimeHHMM >= start && currentTimeHHMM < end;
}

// ----------------------------------------------------------------------------
// SERVICE IMPLEMENTATIONS
// ----------------------------------------------------------------------------

/**
 * Retrieves the notification preferences for an authenticated user.
 * Guarantees a valid preference object even if the user has not yet configured one.
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid authenticated userId is required to fetch notification preferences.');
  }

  // Query existing database preference
  const record = await (prisma as any).notificationPreference.findUnique({
    where: { userId },
  });

  if (!record) {
    // Return sensible defaults without mutating unless the student saves
    return {
      id: `default-${userId}`,
      userId,
      dailyExecutionEnabled: DEFAULT_NOTIFICATION_PREFERENCES.dailyExecutionEnabled,
      revisionDueEnabled: DEFAULT_NOTIFICATION_PREFERENCES.revisionDueEnabled,
      revisionOverdueEnabled: DEFAULT_NOTIFICATION_PREFERENCES.revisionOverdueEnabled,
      incompleteDailyEnabled: DEFAULT_NOTIFICATION_PREFERENCES.incompleteDailyEnabled,
      preferredTime: DEFAULT_NOTIFICATION_PREFERENCES.preferredTime,
      timezone: DEFAULT_NOTIFICATION_PREFERENCES.timezone,
      preferredWeekdays: [...DEFAULT_NOTIFICATION_PREFERENCES.preferredWeekdays],
      maxRemindersPerDay: DEFAULT_NOTIFICATION_PREFERENCES.maxRemindersPerDay,
      quietHoursEnabled: DEFAULT_NOTIFICATION_PREFERENCES.quietHoursEnabled,
      quietHoursStart: DEFAULT_NOTIFICATION_PREFERENCES.quietHoursStart,
      quietHoursEnd: DEFAULT_NOTIFICATION_PREFERENCES.quietHoursEnd,
      lastReminderState: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const quietHoursEnabled = Boolean(
    record.quietHoursStart && record.quietHoursEnd && record.quietHoursStart !== ''
  );

  return {
    id: record.id,
    userId: record.userId,
    dailyExecutionEnabled: record.dailyExecutionEnabled,
    revisionDueEnabled: record.revisionDueEnabled,
    revisionOverdueEnabled: record.revisionOverdueEnabled,
    incompleteDailyEnabled: record.incompleteDailyEnabled,
    preferredTime: record.preferredTime,
    timezone: record.timezone,
    preferredWeekdays: parseWeekdays(record.preferredWeekdays),
    maxRemindersPerDay: record.maxRemindersPerDay,
    quietHoursEnabled,
    quietHoursStart: record.quietHoursStart,
    quietHoursEnd: record.quietHoursEnd,
    lastReminderState: record.lastReminderState,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

/**
 * Updates or creates notification preferences for an authenticated student.
 * Validates inputs, persists to database, and writes an audit event.
 */
export async function updateNotificationPreferences(
  userId: string,
  input: UpdatePreferencesInput
): Promise<NotificationPreferences> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid authenticated userId is required to update notification preferences.');
  }

  // 1. Validate Preferred Time
  if (input.preferredTime !== undefined) {
    if (!isValidTimeString(input.preferredTime)) {
      throw new Error(`Invalid preferred time format "${input.preferredTime}". Must be HH:mm (24-hour).`);
    }
  }

  // 2. Validate Timezone
  if (input.timezone !== undefined) {
    if (!isValidTimezone(input.timezone)) {
      throw new Error(`Invalid IANA timezone "${input.timezone}".`);
    }
  }

  // 3. Validate Weekdays
  let serializedDays: string | undefined = undefined;
  if (input.preferredWeekdays !== undefined) {
    if (!Array.isArray(input.preferredWeekdays)) {
      throw new Error('preferredWeekdays must be an array of integers 1-7.');
    }
    serializedDays = serializeWeekdays(input.preferredWeekdays);
  }

  // 4. Validate Max Reminders
  if (input.maxRemindersPerDay !== undefined) {
    if (
      !Number.isInteger(input.maxRemindersPerDay) ||
      input.maxRemindersPerDay < 1 ||
      input.maxRemindersPerDay > 10
    ) {
      throw new Error('maxRemindersPerDay must be an integer between 1 and 10.');
    }
  }

  // 5. Validate Quiet Hours
  let qStart = input.quietHoursStart;
  let qEnd = input.quietHoursEnd;

  if (input.quietHoursEnabled === false) {
    qStart = null;
    qEnd = null;
  } else if (input.quietHoursEnabled === true) {
    if (qStart && !isValidTimeString(qStart)) {
      throw new Error(`Invalid quietHoursStart format "${qStart}". Must be HH:mm.`);
    }
    if (qEnd && !isValidTimeString(qEnd)) {
      throw new Error(`Invalid quietHoursEnd format "${qEnd}". Must be HH:mm.`);
    }
    if (!qStart) qStart = DEFAULT_NOTIFICATION_PREFERENCES.quietHoursStart;
    if (!qEnd) qEnd = DEFAULT_NOTIFICATION_PREFERENCES.quietHoursEnd;
  }

  // 6. Upsert in Database
  const upserted = await (prisma as any).notificationPreference.upsert({
    where: { userId },
    update: {
      ...(input.dailyExecutionEnabled !== undefined && {
        dailyExecutionEnabled: input.dailyExecutionEnabled,
      }),
      ...(input.revisionDueEnabled !== undefined && {
        revisionDueEnabled: input.revisionDueEnabled,
      }),
      ...(input.revisionOverdueEnabled !== undefined && {
        revisionOverdueEnabled: input.revisionOverdueEnabled,
      }),
      ...(input.incompleteDailyEnabled !== undefined && {
        incompleteDailyEnabled: input.incompleteDailyEnabled,
      }),
      ...(input.preferredTime !== undefined && { preferredTime: input.preferredTime }),
      ...(input.timezone !== undefined && { timezone: input.timezone }),
      ...(serializedDays !== undefined && { preferredWeekdays: serializedDays }),
      ...(input.maxRemindersPerDay !== undefined && {
        maxRemindersPerDay: input.maxRemindersPerDay,
      }),
      ...(qStart !== undefined && { quietHoursStart: qStart }),
      ...(qEnd !== undefined && { quietHoursEnd: qEnd }),
    },
    create: {
      userId,
      dailyExecutionEnabled:
        input.dailyExecutionEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.dailyExecutionEnabled,
      revisionDueEnabled:
        input.revisionDueEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.revisionDueEnabled,
      revisionOverdueEnabled:
        input.revisionOverdueEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.revisionOverdueEnabled,
      incompleteDailyEnabled:
        input.incompleteDailyEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.incompleteDailyEnabled,
      preferredTime: input.preferredTime ?? DEFAULT_NOTIFICATION_PREFERENCES.preferredTime,
      timezone: input.timezone ?? DEFAULT_NOTIFICATION_PREFERENCES.timezone,
      preferredWeekdays:
        serializedDays ?? serializeWeekdays(DEFAULT_NOTIFICATION_PREFERENCES.preferredWeekdays),
      maxRemindersPerDay:
        input.maxRemindersPerDay ?? DEFAULT_NOTIFICATION_PREFERENCES.maxRemindersPerDay,
      quietHoursStart: qStart ?? null,
      quietHoursEnd: qEnd ?? null,
    },
  });

  // 7. Write Audit Trail Event
  await prisma.progressEvent.create({
    data: {
      userId,
      eventType: 'NOTIFICATION_PREFERENCE_UPDATED',
      metadata: JSON.stringify({
        dailyExecutionEnabled: upserted.dailyExecutionEnabled,
        revisionDueEnabled: upserted.revisionDueEnabled,
        revisionOverdueEnabled: upserted.revisionOverdueEnabled,
        incompleteDailyEnabled: upserted.incompleteDailyEnabled,
        preferredTime: upserted.preferredTime,
        timezone: upserted.timezone,
        preferredWeekdays: upserted.preferredWeekdays,
        maxRemindersPerDay: upserted.maxRemindersPerDay,
        quietHoursStart: upserted.quietHoursStart,
        quietHoursEnd: upserted.quietHoursEnd,
        updatedAt: upserted.updatedAt.toISOString(),
      }),
    },
  });

  const quietHoursEnabled = Boolean(
    upserted.quietHoursStart && upserted.quietHoursEnd && upserted.quietHoursStart !== ''
  );

  return {
    id: upserted.id,
    userId: upserted.userId,
    dailyExecutionEnabled: upserted.dailyExecutionEnabled,
    revisionDueEnabled: upserted.revisionDueEnabled,
    revisionOverdueEnabled: upserted.revisionOverdueEnabled,
    incompleteDailyEnabled: upserted.incompleteDailyEnabled,
    preferredTime: upserted.preferredTime,
    timezone: upserted.timezone,
    preferredWeekdays: parseWeekdays(upserted.preferredWeekdays),
    maxRemindersPerDay: upserted.maxRemindersPerDay,
    quietHoursEnabled,
    quietHoursStart: upserted.quietHoursStart,
    quietHoursEnd: upserted.quietHoursEnd,
    lastReminderState: upserted.lastReminderState,
    createdAt: upserted.createdAt,
    updatedAt: upserted.updatedAt,
  };
}

/**
 * Resets preferences to default settings.
 */
export async function resetNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  return updateNotificationPreferences(userId, {
    dailyExecutionEnabled: DEFAULT_NOTIFICATION_PREFERENCES.dailyExecutionEnabled,
    revisionDueEnabled: DEFAULT_NOTIFICATION_PREFERENCES.revisionDueEnabled,
    revisionOverdueEnabled: DEFAULT_NOTIFICATION_PREFERENCES.revisionOverdueEnabled,
    incompleteDailyEnabled: DEFAULT_NOTIFICATION_PREFERENCES.incompleteDailyEnabled,
    preferredTime: DEFAULT_NOTIFICATION_PREFERENCES.preferredTime,
    timezone: DEFAULT_NOTIFICATION_PREFERENCES.timezone,
    preferredWeekdays: [...DEFAULT_NOTIFICATION_PREFERENCES.preferredWeekdays],
    maxRemindersPerDay: DEFAULT_NOTIFICATION_PREFERENCES.maxRemindersPerDay,
    quietHoursEnabled: false,
    quietHoursStart: null,
    quietHoursEnd: null,
  });
}
