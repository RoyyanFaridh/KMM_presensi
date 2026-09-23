"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Kegiatan,
  PerPageOption,
  SortConfig,
  SortKey,
} from "../../backend/kegiatan/types";

import DesktopTable from "./DesktopTable";
import MobileList from "./MobileList";
import Pagination from "./Pagination";

type Props = {
  data: Kegiatan[];
  sort: SortConfig;
  onSort: (key: SortKey) => void;
  onEdit: (kegiatan: Kegiatan) => void;
  onDelete: (kegiatan: Kegiatan) => void;
  onShowQR: (kegiatan: Kegiatan) => void;
  onScanQR: (kegiatan: Kegiatan) => void;
};

const perPageOptions: PerPageOption[] = [10, 50, 100];

export default function KegiatanTableView({
  data,
  sort,
  onSort,
  onEdit,
  onDelete,
  onShowQR,
  onScanQR,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState<PerPageOption>(10);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [data, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const page = Math.min(currentPage, totalPages);

  function handleGoToPage(nextPage: number) {
    const safePage = Math.max(1, Math.min(nextPage, totalPages));

    setCurrentPage(safePage);
  }

  function handleItemsPerPageChange(value: PerPageOption) {
    setItemsPerPage(value);
    setCurrentPage(1);
  }

  return (
    <>
      <DesktopTable
        data={paginatedData}
        sort={sort}
        onSort={onSort}
        onEdit={onEdit}
        onDelete={onDelete}
        onShowQR={onShowQR}
        onScanQR={onScanQR}
      />

      <MobileList
        data={paginatedData}
        onEdit={onEdit}
        onDelete={onDelete}
        onShowQR={onShowQR}
        onScanQR={onScanQR}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        perPageOptions={perPageOptions}
        onItemsPerPageChange={handleItemsPerPageChange}
        onGoToPage={handleGoToPage}
      />
    </>
  );
}
