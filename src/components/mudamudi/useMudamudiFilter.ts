import { useMemo, useState } from "react";
import { Mudamudi, SortKey, SortConfig } from "../../backend/mudamudi/types";
import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
} from "../../backend/mudamudi/constants";

const DEFAULT_SORT: SortConfig = {
  key: "created_at",
  direction: "desc",
};

export function useMudamudiFilter(initialData: Mudamudi[]) {
  const [search, setSearch] = useState("");
  const [filterDesa, setFilterDesa] = useState("");
  const [filterJenisKelamin, setFilterJenisKelamin] = useState("");
  const [filterkelas, setFilterkelas] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(DEFAULT_SORT);

  const kelompokFilterOptions = useMemo(() => {
    if (!filterDesa) {
      return Object.values(KELOMPOK_BY_DESA).flat();
    }

    return KELOMPOK_BY_DESA[filterDesa as keyof typeof KELOMPOK_BY_DESA] ?? [];
  }, [filterDesa]);

  const displayedData = useMemo(() => {
    let result = [...initialData];

    // Search
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();

      result = result.filter((s) => s.nama.toLowerCase().includes(keyword));
    }

    // Filter Desa
    if (filterDesa) {
      result = result.filter((s) => s.desa === filterDesa);
    }

    // Filter Jenis Kelamin
    if (filterJenisKelamin) {
      result = result.filter((s) => s.jenis_kelamin === filterJenisKelamin);
    }

    // Filter kelas
    if (filterkelas) {
      result = result.filter((s) => s.kelas === filterkelas);
    }

    // Filter Kelompok
    if (filterKelompok) {
      result = result.filter((s) => s.kelompok === filterKelompok);
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        if (sortConfig.key === "created_at") {
          const dateA = new Date(a.created_at).getTime();

          const dateB = new Date(b.created_at).getTime();

          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        if (sortConfig.key === "nama") {
          const comparison = a.nama.localeCompare(b.nama, "id", {
            sensitivity: "base",
          });

          return sortConfig.direction === "asc" ? comparison : -comparison;
        }

        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];

        const comparison = String(valueA ?? "").localeCompare(
          String(valueB ?? ""),
          "id",
          {
            sensitivity: "base",
          },
        );

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [
    initialData,
    search,
    filterDesa,
    filterJenisKelamin,
    filterkelas,
    filterKelompok,
    sortConfig,
  ]);

  // Sort
  function toggleSort(key: SortKey) {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return {
          key,
          direction: "asc",
        };
      }

      if (prev.direction === "asc") {
        return {
          key,
          direction: "desc",
        };
      }

      return DEFAULT_SORT;
    });
  }

  // Sort Indikator
  function sortIndicator(key: SortKey) {
    if (!sortConfig || sortConfig.key !== key) {
      return "";
    }

    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  }

  // Reset
  function resetAll() {
    setSearch("");
    setFilterDesa("");
    setFilterJenisKelamin("");
    setFilterkelas("");
    setFilterKelompok("");
    setSortConfig(DEFAULT_SORT);
  }

  // Active Filter
  const hasActiveFilters = !!(
    search ||
    filterDesa ||
    filterJenisKelamin ||
    filterkelas ||
    filterKelompok
  );

  // Filter Key
  const filterKey = [
    search,
    filterDesa,
    filterJenisKelamin,
    filterkelas,
    filterKelompok,
    sortConfig?.key ?? "",
    sortConfig?.direction ?? "",
  ].join("|");

  return {
    search,
    setSearch,

    filterDesa,
    setFilterDesa,

    filterJenisKelamin,
    setFilterJenisKelamin,

    filterkelas,
    setFilterkelas,

    filterKelompok,
    setFilterKelompok,

    kelompokFilterOptions,
    desaOptions: DESA_OPTIONS,

    sortConfig,
    setSortConfig,

    displayedData,

    toggleSort,
    sortIndicator,

    resetAll,
    hasActiveFilters,
    filterKey,
  };
}
