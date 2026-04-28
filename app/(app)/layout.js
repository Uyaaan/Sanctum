import { requireUser } from '@/lib/auth/guards';

export default async function AppLayout({ children }) {
  await requireUser();
  return <>{children}</>;
}
