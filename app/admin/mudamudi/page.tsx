import { requireAdmin } from "../../../src/backend/auth/admin";
import { createClient } from "../../../src/backend/supabase/server";

import MudamudiPage from "../../../src/components/mudamudi/MudamudiPage";

export default async function Page() {
  const { profile } = await requireAdmin();

  const adminDesa = profile.desa;

  const supabase = await createClient();

  const { data: initialData, error } = await supabase
    .from("mudamudi")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return <MudamudiPage initialData={initialData ?? []} adminDesa={adminDesa} />;
}
