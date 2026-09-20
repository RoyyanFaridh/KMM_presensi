"use client";

import { useEffect, useState } from "react";
import { Mudamudi, SortKey, PerPageOption } from "../../backend/mudamudi/types";
import MobileList from "./MobileList";
import DesktopTable from "./DesktopTable";
import Pagination from "./Pagination";

type Props = {
  data: Mudamudi[];
  totalCount: number;
  sortIndicator: (key: SortKey) => string;
  toggleSort: (key: SortKey) => void;
  onDetail: (s: Mudamudi) => void;
  onEdit: (s: Mudamudi) => void;
  onDelete: (s: Mudamudi) => void;
  filterKey: string;
};

const PER_PAGE_OPTIONS: PerPageOption[] = [10, 50, 100];

export default function MudamudiTableView({
  data,
  totalCount,
  sortIndicator,
  toggleSort,
  onDetail,
  onEdit,
  onDelete,
  filterKey,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<PerPageOption>(10);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const displayStart = data.length === 0 ? 0 : startIndex + 1;

  const displayEnd = Math.min(startIndex + itemsPerPage, data.length);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div>
      <p className="mb-2.5 text-[12px] text-gray-500">
        Menampilkan{" "}
        <span className="font-medium text-gray-600">
          {displayStart}
          {data.length > 0 && displayEnd !== displayStart
            ? `–${displayEnd}`
            : ""}
        </span>{" "}
        dari <span className="font-medium text-gray-600">{totalCount}</span>{" "}
        data
      </p>

      <MobileList
        data={paginatedData}
        onDetail={onDetail}
        onEdit={onEdit}
        onDelete={onDelete}
        startIndex={startIndex}
      />

      <DesktopTable
        data={paginatedData}
        startIndex={startIndex}
        sortIndicator={sortIndicator}
        toggleSort={toggleSort}
        onDetail={onDetail}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        perPageOptions={PER_PAGE_OPTIONS}
        onItemsPerPageChange={setItemsPerPage}
        onGoToPage={goToPage}
      />
    </div>
  );
}
