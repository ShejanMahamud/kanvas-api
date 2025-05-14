import { toZonedTime } from 'date-fns-tz';

interface QuietHours {
  enabled: boolean;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  timezone: string;
}

export function isWithinQuietHours(quietHours: QuietHours): boolean {
  if (!quietHours.enabled) {
    return false;
  }

  const now = new Date();
  const userTime = toZonedTime(now, quietHours.timezone);

  const [startHour, startMinute] = quietHours.startTime.split(':').map(Number);
  const [endHour, endMinute] = quietHours.endTime.split(':').map(Number);

  const startTime = new Date(userTime);
  startTime.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date(userTime);
  endTime.setHours(endHour, endMinute, 0, 0);

  // Handle case where quiet hours span across midnight
  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  return userTime >= startTime && userTime <= endTime;
}

export function formatTimeForTimezone(
  date: Date,
  timezone: string,
  format: 'HH:mm' | 'HH:mm:ss' = 'HH:mm',
): string {
  const zonedDate = toZonedTime(date, timezone);
  const hours = zonedDate.getHours().toString().padStart(2, '0');
  const minutes = zonedDate.getMinutes().toString().padStart(2, '0');

  if (format === 'HH:mm:ss') {
    const seconds = zonedDate.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  return `${hours}:${minutes}`;
}
