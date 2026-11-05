"use client";

import type { Mudamudi } from "../../backend/mudamudi/types";
import SearchFilterBar from "./SearchFilterBar";
import MudamudiTableView from "./MudamudiTableView";

type Props = {
  data: Mudamudi[];
  totalCount: number;
  search: string;
  setSearch: (v: string) => void;

  filterDesa: string[];
  setFilterDesa: (v: string[]) => void;

  filterJenjang: string[];
  setFilterJenjang: (v: string[]) => void;

  filterKelas: string[];
  setFilterKelas: (v: string[]) => void;

  filterKelompok: string[];
  setFilterKelompok: (v: string[]) => void;

  filterJenisKelamin: string[];
  setFilterJenisKelamin: (v: string[]) => void;

  kelompokFilterOptions: string[];
  hasActiveFilters: boolean;

  sortConfig: Parameters<typeof SearchFilterBar>[0]["sortConfig"];
  setSortConfig: Parameters<typeof SearchFilterBar>[0]["setSortConfig"];

  onReset: () => void;
  adminDesa: string | null;

  sortIndicator: Parameters<typeof MudamudiTableView>[0]["sortIndicator"];
  toggleSort: Parameters<typeof MudamudiTableView>[0]["toggleSort"];

  filterKey: string;

  onDetail: (data: Mudamudi) => void;
  onEdit: (data: Mudamudi) => void;
  onDelete: (data: Mudamudi) => void;
  onShowQR: (data: Mudamudi) => void;
};

export default function MudamudiTable({
  data,
  totalCount,
  search,
  setSearch,
  filterDesa,
  setFilterDesa,
  filterJenjang,
  setFilterJenjang,
  filterKelas,
  setFilterKelas,
  filterKelompok,
  setFilterKelompok,
  filterJenisKelamin,
  setFilterJenisKelamin,
  hasActiveFilters,
  sortConfig,
  setSortConfig,
  onReset,
  adminDesa,
  sortIndicator,
  toggleSort,
  filterKey,
  onDetail,
  onEdit,
  onDelete,
  onShowQR,
}: Props) {
  return (
    <div>
      <SearchFilterBar
        search={search}
        setSearch={setSearch}
        filterDesa={filterDesa}
        setFilterDesa={setFilterDesa}
        filterKelompok={filterKelompok}
        setFilterKelompok={setFilterKelompok}
        filterJenisKelamin={filterJenisKelamin}
        setFilterJenisKelamin={setFilterJenisKelamin}
        filterJenjang={filterJenjang}
        setFilterJenjang={setFilterJenjang}
        filterKelas={filterKelas}
        setFilterKelas={setFilterKelas}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        hasActiveFilters={hasActiveFilters}
        onReset={onReset}
        adminDesa={adminDesa}
      />

      <MudamudiTableView
        data={data}
        totalCount={totalCount}
        sortIndicator={sortIndicator}
        toggleSort={toggleSort}
        filterKey={filterKey}
        onDetail={onDetail}
        onEdit={onEdit}
        onDelete={onDelete}
        onShowQR={onShowQR}
      />
    </div>
  );
}