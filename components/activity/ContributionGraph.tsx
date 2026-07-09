// Decorative GitHub-style heatmap showing "agent build activity" over the
// last year. Values are a deterministic function of cell index (not
// Math.random/Date.now()) so server and client render identically.
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const LEVEL_COLORS = [
  "bg-ctrl-line",
  "bg-risk-low/25",
  "bg-risk-low/50",
  "bg-risk-low/75",
  "bg-risk-low",
];

function levelFor(index: number, progress: number): number {
  // Sparse early, busier as the build push ramps up — matches the story.
  const bias = Math.max(0, progress - 0.55) * 3;
  const h = Math.sin(index * 12.9898) * 43758.5453;
  const frac = h - Math.floor(h);
  const score = bias * 0.8 + frac * 0.6;
  if (score < 0.35) return 0;
  if (score < 0.7) return 1;
  if (score < 1.05) return 2;
  if (score < 1.4) return 3;
  return 4;
}

interface Cell {
  date: Date;
  level: number;
  future: boolean;
}

export default function ContributionGraph() {
  const totalWeeks = 53;
  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
  const startDate = new Date(endOfWeek);
  startDate.setDate(endOfWeek.getDate() - totalWeeks * 7 + 1);

  const totalCells = totalWeeks * 7;
  const weeks: Cell[][] = [];
  let cellIndex = 0;
  for (let w = 0; w < totalWeeks; w++) {
    const days: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const future = date > today;
      const level = future ? 0 : levelFor(cellIndex, cellIndex / totalCells);
      days.push({ date, level, future });
      cellIndex++;
    }
    weeks.push(days);
  }

  let lastMonth = -1;
  const monthLabels: { week: number; label: string }[] = [];
  weeks.forEach((days, w) => {
    const month = days[0].date.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ week: w, label: MONTHS[month] });
      lastMonth = month;
    }
  });

  const total = weeks
    .flat()
    .reduce((sum, c) => (c.future ? sum : sum + c.level * 8 + (c.level > 0 ? 3 : 0)), 0);

  return (
    <div className="rounded-xl border border-ctrl-line bg-ctrl-panel p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">
          {total.toLocaleString()} autonomous actions in the last year
        </h3>
        <span className="text-xs text-ctrl-dim">agent build activity</span>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        <div
          className="mt-[18px] flex flex-shrink-0 flex-col justify-between text-[10px] text-ctrl-dim"
          style={{ height: 7 * 11 + 6 * 3 }}
        >
          <span> </span>
          <span>Mon</span>
          <span> </span>
          <span>Wed</span>
          <span> </span>
          <span>Fri</span>
          <span> </span>
        </div>
        <div className="inline-block">
          <div
            className="mb-1 grid text-[10px] text-ctrl-dim"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, 11px)`, gap: 3 }}
          >
            {weeks.map((_, w) => {
              const m = monthLabels.find((entry) => entry.week === w);
              return (
                <span key={w} className="whitespace-nowrap">
                  {m ? m.label : ""}
                </span>
              );
            })}
          </div>
          <div className="grid grid-flow-col gap-[3px]" style={{ gridTemplateRows: "repeat(7, 11px)" }}>
            {weeks.map((days, w) =>
              days.map((cell, d) => (
                <div
                  key={`${w}-${d}`}
                  title={`${cell.date.toDateString()}`}
                  className={`h-[11px] w-[11px] rounded-sm ${
                    cell.future ? "bg-transparent" : LEVEL_COLORS[cell.level]
                  }`}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-ctrl-dim">
        <span>Less</span>
        {LEVEL_COLORS.map((c) => (
          <span key={c} className={`h-[10px] w-[10px] rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
