interface SourceTargetSelectorProps {
  source: "clickhouse" | "flatfile";
  target: "clickhouse" | "flatfile";
  onSourceChange: (source: "clickhouse" | "flatfile") => void;
  onTargetChange: (target: "clickhouse" | "flatfile") => void;
}

export function SourceTargetSelector({
  source,
  target,
  onSourceChange,
  onTargetChange,
}: SourceTargetSelectorProps) {
  return (
    <div className="grid h-full grid-cols-1 gap-2 md:grid-cols-2">
      {/* Source Card */}
      <div className="group relative overflow-hidden rounded-lg border border-border/40 bg-card/50 p-3 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10">
        <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/10 blur-xl transition-all duration-500 group-hover:bg-primary/20"></div>
        <div className="relative z-10">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-primary">Data Origin</h3>
            <div className="cyber-icon cyber-pulse h-6 w-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5"></path>
                <path d="M3 16v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"></path>
                <path d="M12 3v18"></path>
              </svg>
            </div>
          </div>
          <select
            value={source}
            onChange={(e) => onSourceChange(e.target.value as "clickhouse" | "flatfile")}
            className="cyber-select h-8 text-xs"
          >
            <option value="clickhouse">ClickHouse Database</option>
            <option value="flatfile">Structured Flat File</option>
          </select>
        </div>
      </div>

      {/* Target Card */}
      <div className="group relative overflow-hidden rounded-lg border border-border/40 bg-card/50 p-3 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10">
        <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/10 blur-xl transition-all duration-500 group-hover:bg-primary/20"></div>
        <div className="relative z-10">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-primary">Data Destination</h3>
            <div className="cyber-icon cyber-pulse h-6 w-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
          </div>
          <select
            value={target}
            onChange={(e) => onTargetChange(e.target.value as "clickhouse" | "flatfile")}
            className="cyber-select h-8 text-xs"
          >
            <option value="clickhouse">ClickHouse Database</option>
            <option value="flatfile">Structured Flat File</option>
          </select>
        </div>
      </div>
    </div>
  );
} 