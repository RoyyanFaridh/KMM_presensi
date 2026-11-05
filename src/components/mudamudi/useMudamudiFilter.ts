import { useMemo, useState } from "react";
import type { Mudamudi, SortKey, SortConfig } from "../../backend/mudamudi/types";
import {
  DESA_OPTIONS,
  KELOMPOK_BY_DESA,
} from "../../backend/mudamudi/constants";

const DEFAULT_SORT: SortConfig = {
  key: "created_at",
  direction: "desc",
};

export function useMudamudiFilter(
  initialData: Mudamudi[],
  adminDesa: string | null,
) {
  const [search, setSearch] = useState("");

  const [filterDesa, setFilterDesa] = useState<string[]>([]);
  const [filterJenisKelamin, setFilterJenisKelamin] = useState<string[]>([]);
  const [filterJenjang, setFilterJenjang] = useState<string[]>([]);
  const [filterKelas, setFilterKelas] = useState<string[]>([]);
  const [filterKelompok, setFilterKelompok] = useState<string[]>([]);

  const [sortConfig, setSortConfig] = useState<SortConfig>(DEFAULT_SORT);

  const isSuperAdmin = adminDesa === null;

  const kelompokFilterOptions = useMemo(() => {
    if (adminDesa) {
      return (
        KELOMPOK_BY_DESA[
        adminDesa as keyof typeof KELOMPOK_BY_DESA
        ] ?? []
      );
    }

    if (filterDesa.length === 0) {
      return Object.values(KELOMPOK_BY_DESA).flat();
    }

    return filterDesa.flatMap(
      (desa) =>
        KELOMPOK_BY_DESA[
        desa as keyof typeof KELOMPOK_BY_DESA
        ] ?? [],
    );
  }, [adminDesa, filterDesa]);

  const displayedData = useMemo(() => {
    let result = [...initialData];

    if (adminDesa) {
      result = result.filter((s) => s.desa === adminDesa);
    }

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();

      result = result.filter((s) =>
        s.nama.toLowerCase().includes(keyword),
      );
    }

    if (isSuperAdmin && filterDesa.length > 0) {
      result = result.filter((s) =>
        filterDesa.includes(s.desa),
      );
    }

    if (filterJenisKelamin.length > 0) {
      result = result.filter((s) =>
        filterJenisKelamin.includes(s.jenis_kelamin ?? ""),
      );
    }

    if (filterJenjang.length > 0) {
      result = result.filter((s) =>
        filterJenjang.includes(s.jenjang ?? ""),
      );
    }

    if (filterKelas.length > 0) {
      result = result.filter((s) =>
        filterKelas.includes(s.kelas ?? ""),
      );
    }

    if (filterKelompok.length > 0) {
      result = result.filter((s) =>
        filterKelompok.includes(s.kelompok),
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        if (sortConfig.key === "created_at") {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();

          return sortConfig.direction === "asc"
            ? dateA - dateB
            : dateB - dateA;
        }

        if (sortConfig.key === "nama") {
          const comparison = a.nama.localeCompare(b.nama, "id", {
            sensitivity: "base",
          });

          return sortConfig.direction === "asc"
            ? comparison
            : -comparison;
        }

        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];

        const comparison = String(valueA ?? "").localeCompare(
          String(valueB ?? ""),
          "id",
          { sensitivity: "base" },
        );

        return sortConfig.direction === "asc"
          ? comparison
          : -comparison;
      });
    }

    return result;
  }, [
    initialData,
    adminDesa,
    isSuperAdmin,
    search,
    filterDesa,
    filterJenisKelamin,
    filterJenjang,
    filterKelas,
    filterKelompok,
    sortConfig,
  ]);

  function toggleSort(key: SortKey) {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }

      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }

      return DEFAULT_SORT;
    });
  }

  function sortIndicator(key: SortKey) {
    if (!sortConfig || sortConfig.key !== key) {
      return "";
    }

    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  }

  function resetAll() {
    setSearch("");
    setFilterJenisKelamin([]);
    setFilterJenjang([]);
    setFilterKelas([]);
    setFilterKelompok([]);
    setFilterDesa([]);
    setSortConfig(DEFAULT_SORT);
  }

  const hasActiveFilters = Boolean(
    search.trim() ||
    filterJenisKelamin.length > 0 ||
    filterJenjang.length > 0 ||
    filterKelas.length > 0 ||
    filterKelompok.length > 0 ||
    (isSuperAdmin && filterDesa.length > 0),
  );

  const filterKey = [
    search,
    filterDesa.join(","),
    filterJenisKelamin.join(","),
    filterJenjang.join(","),
    filterKelas.join(","),
    filterKelompok.join(","),
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
    filterJenjang,
    setFilterJenjang,
    filterKelas,
    setFilterKelas,
    filterKelompok,
    setFilterKelompok,
    kelompokFilterOptions,
    desaOptions: isSuperAdmin
      ? DESA_OPTIONS
      : adminDesa
        ? [adminDesa]
        : [],
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