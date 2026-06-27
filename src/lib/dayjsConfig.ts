// The business operates in India only — every date boundary ("today",
// "this week", "this month") must mean the IST calendar date, not whatever
// timezone the browser or server happens to be running in. dayjs()'s bare
// constructor always uses ambient local time even after setDefault(), so
// every call site that means "right now" must use dayjs.tz() explicitly.
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

export default dayjs;
