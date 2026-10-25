import { requireAdmin } from "../../../src/backend/auth/admin";
import ProfileForm from "./ProfileForm";

export default async function ProfilPage() {
  const { user, profile } = await requireAdmin();

  return (
    <ProfileForm
      user={{
        email: user.email ?? "",
      }}
      profile={profile}
    />
  );
}