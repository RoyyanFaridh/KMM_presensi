import { PerPageOption } from "../../backend/mudamudi/types";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type Props = {
  currentPage: number;
  totalPages: number;
  itemsPerPage: PerPageOption;
  perPageOptions: PerPageOption[];
  onItemsPerPageChange: (value: PerPageOption) => void;
  onGoToPage: (page: number) => void;
};

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: (number | "ellipsis")[] = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  if (currentPage > 3) pages.push("ellipsis");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (currentPage < totalPages - 2) pages.push("ellipsis");
  pages.push(totalPages);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  perPageOptions,
  onItemsPerPageChange,
  onGoToPage,
}: Props) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
        <label htmlFor="per-page-select">Tampilkan</label>
        <select
          id="per-page-select"
          value={itemsPerPage}
          onChange={(e) =>
            onItemsPerPageChange(Number(e.target.value) as PerPageOption)
          }
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600 transition hover:border-gray-300"
        >
          {perPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span>per halaman</span>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <p className="text-[10px] text-gray-400 sm:mr-1">
            Halaman{" "}
            <span className="font-medium text-gray-600">{currentPage}</span>{" "}
            dari <span className="font-medium text-gray-600">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onGoToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex h-7.5 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-[10px] font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) =>
                page === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-7.5 w-7.5 items-center justify-center text-[10px] text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => onGoToPage(page)}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`flex h-7.5 w-7.5 items-center justify-center rounded-lg border text-[10px] font-medium transition ${
                      page === currentPage
                        ? "border-[#0d7f78] bg-[#0d7f78] text-white"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() => onGoToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex h-7.5 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-[10px] font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
