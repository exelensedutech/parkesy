// `dvh` (dynamic viewport height) — unlike `vh` — accounts for the address bar/nav bar
// that Android Chrome shows/hides, so the sheet reliably leaves a gap at the top to dismiss it.
export const BOTTOM_SHEET_PAPER_SX = {
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: "85dvh",
  overflowY: "auto" as const,
};
