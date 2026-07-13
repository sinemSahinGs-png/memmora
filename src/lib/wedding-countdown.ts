export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isWeddingDay: boolean;
}

export function parseWeddingDateTime(
  weddingDate: string,
  weddingTime?: string
): Date | null {
  const trimmed = weddingDate.trim();
  if (!trimmed) return null;

  const dateParts = trimmed.split("-").map(Number);
  if (dateParts.length !== 3 || dateParts.some((n) => Number.isNaN(n))) {
    return null;
  }

  const [year, month, day] = dateParts;
  let hours = 12;
  let minutes = 0;

  const time = weddingTime?.trim();
  if (time) {
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      hours = Number(match[1]);
      minutes = Number(match[2]);
    }
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getCountdownParts(
  target: Date,
  now = new Date()
): CountdownParts {
  const diffMs = target.getTime() - now.getTime();
  const isWeddingDay = isSameCalendarDay(target, now);

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      isWeddingDay,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    isWeddingDay,
  };
}

export function padCountdownUnit(value: number): string {
  return String(value).padStart(2, "0");
}
