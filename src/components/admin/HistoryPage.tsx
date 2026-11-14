
"use client";

import { useState, useTransition } from "react";
import {
    getMudamudiHistory,
    restoreMudamudiHistory,
    type HistoryRecord,
} from "../../backend/admin/history-actions";

type Props = {
    initialData: HistoryRecord[];
    initialTotal: number;
};

type Filters = {
    operation: string;
    dateFrom: string;
    dateTo: string;
    actorEmail: string;
};

const PAGE_SIZE = 20;

const OPERATION_LABELS: Record<string, string> = {
    INSERT: "Tambah",
    UPDATE: "Ubah",
    DELETE: "Hapus",
    TRUNCATE: "Hapus Seluruh",
    TRUNCATE_EVENT: "TRUNCATE",
    RESTORE: "Dipulihkan",
};

const HEADER_CELL =
    "px-3.5 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.07em] text-[#78827C]";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
    }).format(new Date(value));
}

function getHistoryData(
    record: HistoryRecord,
    type: "old" | "new",
) {
    const data = type === "old" ? record.old_data : record.new_data;

    if (record.operation === "RESTORE" && data) {
        const key =
            type === "old"
                ? "data_before_restore"
                : "data_after_restore";

        const nested = data[key];

        if (
            nested &&
            typeof nested === "object" &&
            !Array.isArray(nested)
        ) {
            return nested as Record<string, unknown>;
        }
    }

    return data ?? {};
}

function getRecordName(record: HistoryRecord) {
    const data =
        record.operation === "RESTORE"
            ? getHistoryData(record, "new")
            : record.new_data ?? record.old_data;

    const name = data?.nama;

    if (typeof name === "string" && name.trim()) return name;

    if (record.operation === "TRUNCATE_EVENT") {
        return "Seluruh tabel Muda-Mudi";
    }

    return record.record_id
        ? `Data ID ${record.record_id}`
        : "Data tidak diketahui";
}

function getRecordDesa(record: HistoryRecord) {
    const data =
        record.operation === "RESTORE"
            ? getHistoryData(record, "new")
            : record.new_data ?? record.old_data;

    const desa = data?.desa;

    return typeof desa === "string" ? desa : "-";
}

function getOperationStyle(operation: string) {
    switch (operation) {
        case "INSERT":
            return "border-[#CDE8D6] bg-[#E6F2EA] text-[#287A50]";
        case "UPDATE":
            return "border-blue-100 bg-blue-50 text-blue-700";
        case "DELETE":
            return "border-red-100 bg-red-50 text-red-700";
        case "RESTORE":
            return "border-purple-100 bg-purple-50 text-purple-700";
        case "TRUNCATE":
        case "TRUNCATE_EVENT":
            return "border-orange-100 bg-orange-50 text-orange-700";
        default:
            return "border-[#E5EAE6] bg-[#F5F7F5] text-[#526159]";
    }
}

function formatValue(value: unknown) {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Ya" : "Tidak";

    if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
    }

    return String(value);
}

function OperationBadge({ operation }: { operation: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getOperationStyle(operation)}`}
        >
            {OPERATION_LABELS[operation] ?? operation}
        </span>
    );
}

function DetailIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
            <circle
                cx="10"
                cy="10"
                r="7"
                stroke="currentColor"
                strokeWidth="1.4"
            />
            <path
                d="M10 9v4M10 6.5h.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function HistoryEmpty() {
    return (
        <div className="flex flex-col items-center px-4 py-10 text-center">
            <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#287A50]">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path
                        d="M12 7v5l3 2M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <p className="text-[12px] font-bold text-[#202824]">
                Tidak ada riwayat aktivitas
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[#78827C]">
                Belum ada aktivitas yang sesuai dengan filter saat ini.
            </p>
        </div>
    );
}

function DetailModal({
    record,
    onClose,
}: {
    record: HistoryRecord;
    onClose: () => void;
}) {
    const oldData = getHistoryData(record, "old");
    const newData = getHistoryData(record, "new");

    const fields = Array.from(
        new Set([...Object.keys(oldData), ...Object.keys(newData)]),
    );

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-5"
            onClick={onClose}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-detail-title"
                className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3.5 sm:px-5">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E5EAE6] bg-[#E6F2EA] text-[#287A50]">
                            <DetailIcon />
                        </div>
                        <div className="min-w-0">
                            <h2
                                id="history-detail-title"
                                className="text-[12px] font-bold text-[#202824]"
                            >
                                Detail Riwayat
                            </h2>
                            <p className="truncate text-[10px] text-[#78827C]">
                                {getRecordName(record)}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup detail"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#78827C] transition hover:bg-[#F5F7F5] hover:text-[#202824]"
                    >
                        ✕
                    </button>
                </header>

                <div className="min-h-0 space-y-4 overflow-y-auto p-4 sm:p-5">
                    <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#E5EAE6] bg-[#F5F7F5] p-3 sm:grid-cols-4">
                        <div>
                            <p className="text-[9px] text-[#78827C]">
                                Aktivitas
                            </p>
                            <div className="mt-1">
                                <OperationBadge operation={record.operation} />
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] text-[#78827C]">
                                Waktu
                            </p>
                            <p className="mt-1 text-[10px] font-medium text-[#202824]">
                                {formatDate(record.changed_at)}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] text-[#78827C]">
                                Admin
                            </p>
                            <p className="mt-1 break-all text-[10px] font-medium text-[#202824]">
                                {record.actor_email ?? "Tidak diketahui"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[9px] text-[#78827C]">
                                Desa
                            </p>
                            <p className="mt-1 text-[10px] font-medium text-[#202824]">
                                {getRecordDesa(record)}
                            </p>
                        </div>
                    </div>

                    {record.operation === "TRUNCATE_EVENT" ? (
                        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                            <p className="text-[11px] font-semibold text-orange-800">
                                Aktivitas pengosongan tabel
                            </p>
                            <p className="mt-1 text-[10px] text-orange-700">
                                Jumlah data terdampak:{" "}
                                {String(newData.affected_rows ?? "-")}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-[#E5EAE6]">
                            <table className="w-full min-w-[560px] border-collapse text-left">
                                <thead>
                                    <tr className="bg-[#F5F7F5]">
                                        <th className={HEADER_CELL}>Kolom</th>
                                        <th className={HEADER_CELL}>Sebelum</th>
                                        <th className={HEADER_CELL}>Sesudah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5EAE6]">
                                    {fields.map((field) => (
                                        <tr
                                            key={field}
                                            className="hover:bg-[#F5F7F5]"
                                        >
                                            <td className="px-3.5 py-2.5 text-[10px] font-semibold capitalize text-[#526159]">
                                                {field.replaceAll("_", " ")}
                                            </td>
                                            <td className="whitespace-pre-wrap break-words px-3.5 py-2.5 text-[10px] text-[#78827C]">
                                                {formatValue(oldData[field])}
                                            </td>
                                            <td className="whitespace-pre-wrap break-words px-3.5 py-2.5 text-[10px] text-[#202824]">
                                                {formatValue(newData[field])}
                                            </td>
                                        </tr>
                                    ))}

                                    {fields.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="px-3 py-8 text-center text-[10px] text-[#78827C]"
                                            >
                                                Tidak ada detail data.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {record.restored_at && (
                        <div className="rounded-xl border border-[#CDE8D6] bg-[#E6F2EA] p-3">
                            <p className="text-[10px] font-semibold text-[#287A50]">
                                Data sudah dipulihkan
                            </p>
                            <p className="mt-1 text-[9px] text-[#526159]">
                                Waktu pemulihan: {formatDate(record.restored_at)}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default function HistoryPage({
    initialData,
    initialTotal,
}: Props) {
    const [records, setRecords] = useState(initialData);
    const [total, setTotal] = useState(initialTotal);
    const [page, setPage] = useState(1);
    const [selectedRecord, setSelectedRecord] =
        useState<HistoryRecord | null>(null);
    const [isPending, startTransition] = useTransition();
    const [restoringId, setRestoringId] = useState<number | null>(null);

    const [filters, setFilters] = useState<Filters>({
        operation: "",
        dateFrom: "",
        dateTo: "",
        actorEmail: "",
    });

    const [appliedFilters, setAppliedFilters] = useState<Filters>({
        operation: "",
        dateFrom: "",
        dateTo: "",
        actorEmail: "",
    });

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    function loadHistory(nextPage: number, nextFilters: Filters) {
        startTransition(async () => {
            const result = await getMudamudiHistory({
                page: nextPage,
                pageSize: PAGE_SIZE,
                operation: nextFilters.operation,
                dateFrom: nextFilters.dateFrom,
                dateTo: nextFilters.dateTo,
                actorEmail: nextFilters.actorEmail,
            });

            if (result.error) {
                alert(result.error);
                return;
            }

            setRecords(result.data);
            setTotal(result.total);
            setPage(nextPage);
        });
    }

    function applyFilters() {
        if (
            filters.dateFrom &&
            filters.dateTo &&
            filters.dateFrom > filters.dateTo
        ) {
            alert("Tanggal awal tidak boleh melebihi tanggal akhir.");
            return;
        }

        setAppliedFilters(filters);
        loadHistory(1, filters);
    }

    function resetFilters() {
        const emptyFilters: Filters = {
            operation: "",
            dateFrom: "",
            dateTo: "",
            actorEmail: "",
        };

        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        loadHistory(1, emptyFilters);
    }

    async function handleRestore(record: HistoryRecord) {
        if (
            !["INSERT", "UPDATE", "DELETE"].includes(record.operation) ||
            record.restored_at ||
            restoringId !== null
        ) {
            return;
        }

        const action =
            record.operation === "INSERT"
                ? "membatalkan penambahan"
                : record.operation === "UPDATE"
                    ? "mengembalikan perubahan"
                    : "memulihkan data yang dihapus";

        const confirmed = window.confirm(
            `Apakah kamu yakin ingin ${action} untuk "${getRecordName(record)}"?\n\nProses ini akan tercatat dalam riwayat aktivitas.`,
        );

        if (!confirmed) return;

        setRestoringId(record.id);

        try {
            const result = await restoreMudamudiHistory(record.id);

            if (!result.success) {
                alert(result.error || "Gagal memulihkan data.");
                return;
            }

            alert("Data berhasil dipulihkan.");

            setSelectedRecord(null);
            loadHistory(page, appliedFilters);
        } catch (error) {
            console.error("Restore error:", error);
            alert("Terjadi kesalahan saat memulihkan data.");
        } finally {
            setRestoringId(null);
        }
    }

    function renderRestoreAction(record: HistoryRecord) {
        if (record.operation === "RESTORE") {
            return (
                <span className="text-[9px] font-semibold text-purple-700">
                    Dipulihkan
                </span>
            );
        }

        if (!["INSERT", "UPDATE", "DELETE"].includes(record.operation)) {
            return (
                <span className="text-[9px] text-[#78827C]">-</span>
            );
        }

        if (record.restored_at) {
            return (
                <span
                    title={`Dipulihkan ${formatDate(record.restored_at)}`}
                    className="text-[9px] font-semibold text-[#287A50]"
                >
                    Sudah Dipulihkan
                </span>
            );
        }

        return (
            <button
                type="button"
                onClick={() => handleRestore(record)}
                disabled={restoringId !== null || isPending}
                className="inline-flex h-7 items-center justify-center rounded-lg border border-[#CDE8D6] bg-[#E6F2EA] px-2 text-[9px] font-semibold text-[#287A50] transition hover:bg-[#D5EBDD] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {restoringId === record.id ? "Memulihkan..." : "Restore"}
            </button>
        );
    }

    return (
        <main className="min-h-screen bg-[#F5F7F5] p-3.5 sm:p-5 lg:p-6">
            <div className="mx-auto max-w-[1600px] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-semibold text-[#287A50]">
                            MANAJEMEN DATA
                        </p>
                        <h1 className="mt-1 text-[17px] font-bold tracking-tight text-[#202824] sm:text-[19px]">
                            Riwayat Aktivitas
                        </h1>
                        <p className="mt-1 text-[10px] leading-4 text-[#78827C]">
                            Catatan perubahan data Muda-Mudi dan aktivitas admin.
                        </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5EAE6] bg-white px-2.5 py-1.5 text-[10px] font-medium text-[#526159]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#287A50]" />
                        {total.toLocaleString("id-ID")} Aktivitas
                    </span>
                </div>

                <section className="rounded-2xl border border-[#E5EAE6] bg-white p-4 shadow-xs sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E6F2EA] text-[#287A50]">
                            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                                <path
                                    d="M3 5h14M5.5 10h9M8 15h4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-[12px] font-bold text-[#202824]">
                                Filter Riwayat
                            </h2>
                            <p className="text-[9px] text-[#78827C]">
                                Sesuaikan pencarian aktivitas.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <label className="block">
                            <span className="mb-1.5 block text-[10px] font-medium text-[#526159]">
                                Jenis Aktivitas
                            </span>
                            <select
                                value={filters.operation}
                                onChange={(event) =>
                                    setFilters({
                                        ...filters,
                                        operation: event.target.value,
                                    })
                                }
                                className="h-9 w-full rounded-lg border border-[#E5EAE6] bg-white px-2.5 text-[10px] text-[#202824] outline-none transition focus:border-[#287A50]"
                            >
                                <option value="">Semua Aktivitas</option>
                                <option value="INSERT">Tambah Data</option>
                                <option value="UPDATE">Ubah Data</option>
                                <option value="DELETE">Hapus Data</option>
                                <option value="RESTORE">Pemulihan Data</option>
                                <option value="TRUNCATE">Hapus Seluruh Data</option>
                                <option value="TRUNCATE_EVENT">Aktivitas TRUNCATE</option>
                            </select>
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-[10px] font-medium text-[#526159]">
                                Dari Tanggal
                            </span>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(event) =>
                                    setFilters({
                                        ...filters,
                                        dateFrom: event.target.value,
                                    })
                                }
                                className="h-9 w-full rounded-lg border border-[#E5EAE6] bg-white px-2.5 text-[10px] text-[#202824] outline-none focus:border-[#287A50]"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-[10px] font-medium text-[#526159]">
                                Sampai Tanggal
                            </span>
                            <input
                                type="date"
                                min={filters.dateFrom || undefined}
                                value={filters.dateTo}
                                onChange={(event) =>
                                    setFilters({
                                        ...filters,
                                        dateTo: event.target.value,
                                    })
                                }
                                className="h-9 w-full rounded-lg border border-[#E5EAE6] bg-white px-2.5 text-[10px] text-[#202824] outline-none focus:border-[#287A50]"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-[10px] font-medium text-[#526159]">
                                Email Admin
                            </span>
                            <input
                                type="text"
                                value={filters.actorEmail}
                                onChange={(event) =>
                                    setFilters({
                                        ...filters,
                                        actorEmail: event.target.value,
                                    })
                                }
                                placeholder="Cari email admin..."
                                className="h-9 w-full rounded-lg border border-[#E5EAE6] bg-white px-2.5 text-[10px] text-[#202824] outline-none placeholder:text-gray-400 focus:border-[#287A50]"
                            />
                        </label>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={applyFilters}
                            disabled={isPending || restoringId !== null}
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-[#287A50] px-4 text-[10px] font-semibold text-white transition hover:bg-[#206541] disabled:opacity-50"
                        >
                            {isPending ? "Memuat..." : "Terapkan Filter"}
                        </button>

                        <button
                            type="button"
                            onClick={resetFilters}
                            disabled={isPending || restoringId !== null}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-[#E5EAE6] bg-white px-4 text-[10px] font-semibold text-[#526159] transition hover:bg-[#F5F7F5] disabled:opacity-50"
                        >
                            Reset
                        </button>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5EAE6] px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E5EAE6] bg-[#E6F2EA] text-[#287A50]">
                                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                                    <path
                                        d="M12 7v5l3 2M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-[12px] font-bold tracking-tight text-[#202824]">
                                    Daftar Riwayat
                                </h2>
                                <p className="mt-0.5 text-[10px] leading-3.5 text-[#78827C]">
                                    Rekaman aktivitas perubahan data Muda-Mudi
                                </p>
                            </div>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5EAE6] bg-[#F5F7F5] px-2.5 py-1 text-[10px] font-medium text-[#202824]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#287A50]" />
                            {records.length} Aktivitas
                        </span>
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[1000px] table-fixed border-collapse text-center">
                            <colgroup>
                                <col className="w-[5%]" />
                                <col className="w-[16%]" />
                                <col className="w-[16%]" />
                                <col className="w-[11%]" />
                                <col className="w-[22%]" />
                                <col className="w-[9%]" />
                                <col className="w-[8%]" />
                                <col className="w-[13%]" />
                            </colgroup>

                            <thead>
                                <tr className="border-b border-[#E5EAE6] bg-[#F5F7F5]">
                                    <th className={HEADER_CELL}>No.</th>
                                    <th className={HEADER_CELL}>Waktu</th>
                                    <th className={HEADER_CELL}>Admin</th>
                                    <th className={HEADER_CELL}>Aktivitas</th>
                                    <th className={HEADER_CELL}>Nama Muda-Mudi</th>
                                    <th className={HEADER_CELL}>Desa</th>
                                    <th className={HEADER_CELL}>Detail</th>
                                    <th className={HEADER_CELL}>Restore</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#E5EAE6]">
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan={8}>
                                            <HistoryEmpty />
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record, index) => (
                                        <tr
                                            key={record.id}
                                            className="group transition-colors duration-150 hover:bg-[#F5F7F5]"
                                        >
                                            <td className="px-3 py-3 align-middle">
                                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-gray-100 px-1 text-[9px] tabular-nums text-gray-500 group-hover:bg-[#E6F2EA] group-hover:text-[#287A50]">
                                                    {(page - 1) * PAGE_SIZE + index + 1}
                                                </span>
                                            </td>

                                            <td className="px-3 py-3 text-[10px] text-[#526159]">
                                                <span className="block">
                                                    {formatDate(record.changed_at)}
                                                </span>
                                            </td>

                                            <td className="px-3 py-3">
                                                <span
                                                    title={record.actor_email ?? ""}
                                                    className="block truncate text-[10px] font-medium text-[#202824]"
                                                >
                                                    {record.actor_email ?? "Tidak diketahui"}
                                                </span>
                                            </td>

                                            <td className="px-3 py-3">
                                                <OperationBadge operation={record.operation} />
                                            </td>

                                            <td className="px-3 py-3 text-left text-[11px] font-medium text-[#202824]">
                                                <span className="block break-words">
                                                    {getRecordName(record)}
                                                </span>
                                            </td>

                                            <td className="px-3 py-3 text-[10px] text-[#526159]">
                                                {getRecordDesa(record)}
                                            </td>

                                            <td className="px-3 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedRecord(record)}
                                                    aria-label={`Detail riwayat ${getRecordName(record)}`}
                                                    title="Lihat detail"
                                                    className="mx-auto inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5EAE6] bg-white text-[#287A50] transition hover:border-[#287A50] hover:bg-[#E6F2EA]"
                                                >
                                                    <DetailIcon />
                                                </button>
                                            </td>

                                            <td className="px-3 py-3">
                                                {renderRestoreAction(record)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="divide-y divide-[#E5EAE6] md:hidden">
                        {records.length === 0 ? (
                            <HistoryEmpty />
                        ) : (
                            records.map((record, index) => (
                                <article
                                    key={record.id}
                                    className="p-3.5 transition-colors hover:bg-[#F5F7F5]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                                                <span className="text-[9px] tabular-nums text-[#78827C]">
                                                    #{(page - 1) * PAGE_SIZE + index + 1}
                                                </span>
                                                <OperationBadge operation={record.operation} />
                                            </div>

                                            <p className="break-words text-[11px] font-semibold text-[#202824]">
                                                {getRecordName(record)}
                                            </p>

                                            <p className="mt-1 text-[9px] text-[#78827C]">
                                                {getRecordDesa(record)}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedRecord(record)}
                                                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[#E5EAE6] bg-white px-2.5 text-[9px] font-semibold text-[#287A50] transition hover:bg-[#E6F2EA]"
                                            >
                                                <DetailIcon />
                                                Detail
                                            </button>

                                            {renderRestoreAction(record)}
                                        </div>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-1.5 border-t border-[#E5EAE6] pt-2.5">
                                        <p className="break-all text-[9px] text-[#526159]">
                                            <span className="font-semibold text-[#78827C]">
                                                Admin:{" "}
                                            </span>
                                            {record.actor_email ?? "Tidak diketahui"}
                                        </p>
                                        <p className="text-[9px] text-[#78827C]">
                                            {formatDate(record.changed_at)}
                                        </p>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>

                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3">
                        <p className="text-[10px] text-[#78827C]">
                            Menampilkan{" "}
                            <span className="font-semibold tabular-nums text-[#202824]">
                                {records.length}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold tabular-nums text-[#202824]">
                                {total}
                            </span>{" "}
                            aktivitas
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1 || isPending || restoringId !== null}
                                onClick={() => loadHistory(page - 1, appliedFilters)}
                                className="inline-flex h-7 items-center rounded-lg border border-[#E5EAE6] bg-white px-3 text-[9px] font-semibold text-[#526159] transition hover:bg-[#E6F2EA] hover:text-[#287A50] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Sebelumnya
                            </button>

                            <span className="text-[9px] tabular-nums text-[#78827C]">
                                {page}/{totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={page >= totalPages || isPending || restoringId !== null}
                                onClick={() => loadHistory(page + 1, appliedFilters)}
                                className="inline-flex h-7 items-center rounded-lg border border-[#E5EAE6] bg-white px-3 text-[9px] font-semibold text-[#526159] transition hover:bg-[#E6F2EA] hover:text-[#287A50] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Berikutnya
                            </button>
                        </div>
                    </footer>
                </section>

                {isPending && (
                    <p className="text-center text-[10px] text-[#78827C]">
                        Memuat riwayat aktivitas...
                    </p>
                )}
            </div>

            {selectedRecord && (
                <DetailModal
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                />
            )}
        </main>
    );
}
