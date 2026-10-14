import { requireAdmin } from "../../../../src/backend/auth/admin";
import RekapitulasiPage from "../../../../src/components/presensi/rekapitulasi/RekapitulasiPage";

export default async function Page() {
  const { desa } = await requireAdmin();

  return <RekapitulasiPage adminDesa={desa} />;
}
