type Props = {
  search: string;
  onSearchChange: (value: string) => void;
};

export default function MonitoringFilters({ search, onSearchChange }: Props) {
  return (
    <div className="w-full sm:w-60">
      <label htmlFor="monitoring-search" className="sr-only">
        Cari peserta
      </label>

      <div className="relative">
        <svg
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />

          <path d="m20 20-3.5-3.5" />
        </svg>

        <input
          id="monitoring-search"
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari peserta..."
          className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 text-xs text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/10"
        />
      </div>
    </div>
  );
}
