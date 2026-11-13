
"use server";

import { requireAdmin } from "../auth/admin";
import { createAdminClient } from "../supabase/admin";

export type HistoryRecord = {
    id: number;
    operation: string;
    record_id: string | null;
    changed_at: string;
    changed_by: string | null;
    actor_email: string | null;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
};

export type HistoryFilters = {
    page?: number;
    pageSize?: number;
    operation?: string;
    dateFrom?: string;
    dateTo?: string;
    actorEmail?: string;
};

export type HistoryResult = {
    data: HistoryRecord[];
    total: number;
    page: number;
    pageSize: number;
    error: string | null;
};

export async function getMudamudiHistory(
    filters: HistoryFilters = {},
): Promise<HistoryResult> {
    const { desa: adminDesa, isSuperAdmin } = await requireAdmin();

    const page = Math.max(1, Math.floor(filters.page ?? 1));
    const pageSize = Math.min(
        100,
        Math.max(1, Math.floor(filters.pageSize ?? 20)),
    );

    const emptyResult: HistoryResult = {
        data: [],
        total: 0,
        page,
        pageSize,
        error: null,
    };

    if (!isSuperAdmin && !adminDesa) {
        return {
            ...emptyResult,
            error: "Desa admin tidak valid",
        };
    }

    const supabase = createAdminClient();

    let query = supabase
        .from("mudamudi_audit")
        .select(
            "id, operation, record_id, changed_at, changed_by, actor_email, old_data, new_data",
            { count: "exact" },
        );

    if (!isSuperAdmin && adminDesa) {
        const safeDesa = adminDesa.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

        query = query.or(
            `old_data->>desa.eq."${safeDesa}",new_data->>desa.eq."${safeDesa}"`,
        );
    }

    if (filters.operation) {
        query = query.eq("operation", filters.operation);
    }

    if (filters.dateFrom) {
        query = query.gte(
            "changed_at",
            `${filters.dateFrom}T00:00:00+07:00`,
        );
    }

    if (filters.dateTo) {
        query = query.lte(
            "changed_at",
            `${filters.dateTo}T23:59:59.999+07:00`,
        );
    }

    if (filters.actorEmail?.trim()) {
        query = query.ilike("actor_email", `%${filters.actorEmail.trim()}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
        .order("changed_at", { ascending: false })
        .range(from, to);

    if (error) {
        console.error("getMudamudiHistory error:", error);

        return {
            ...emptyResult,
            error: "Gagal mengambil riwayat aktivitas",
        };
    }

    return {
        data: (data ?? []) as HistoryRecord[],
        total: count ?? 0,
        page,
        pageSize,
        error: null,
    };
}
