export function serverTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}
