import { getKegiatan } from '../../../src/backend/kegiatan/actions'
import KegiatanTable from '../../../src/components/kegiatan/KegiatanTable'

export default async function KegiatanPage() {
  const data = await getKegiatan()

  return (
    <main className="p-4 md:p-6">
      <KegiatanTable initialData={data} />
    </main>
  )
}

