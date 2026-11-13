
import { getMudamudiHistory } from "../../../src/backend/admin/history-actions";
import HistoryPage from "../../../src/components/admin/HistoryPage";

export default async function Page() {
    const result = await getMudamudiHistory({
        page: 1,
        pageSize: 20,
    });

    if (result.error) {
        return (
            <main className="min-h-screen p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-[11px] text-red-700">
                    {result.error}
                </div>
            </main>
        );
    }

    return (
        <HistoryPage
            initialData={result.data}
            initialTotal={result.total}
        />
    );
}
