import { requireAdmin } from "../../src/backend/auth/admin";
import AdminSidebar from "../../src/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="min-w-0 flex-1 pt-14 md:h-screen md:overflow-y-auto md:pt-0">
        {children}
      </div>
    </div>
  );
}