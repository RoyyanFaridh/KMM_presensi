import { getKegiatan } from "../../../../src/backend/kegiatan/actions";
import MonitoringPage from "../../../../src/components/presensi/monitoring/MonitoringPage";

export default async function Page() {
  const kegiatan = await getKegiatan();

  return (
    <main>
      <MonitoringPage kegiatan={kegiatan} />
    </main>
  );
}