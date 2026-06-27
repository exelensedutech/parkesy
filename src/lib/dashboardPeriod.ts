import dayjs from "./dayjsConfig";

export type DashboardPeriod = "today" | "week" | "month";

export const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: "Today",
  week: "Last 7 Days",
  month: "This Month",
};

export function getPeriodRange(period: DashboardPeriod): { start: Date; end: Date } {
  const now = dayjs.tz();
  const start =
    period === "today"
      ? now.startOf("day")
      : period === "week"
        ? now.subtract(6, "day").startOf("day")
        : now.startOf("month");
  return { start: start.toDate(), end: now.toDate() };
}
