import { requireUser } from '@/lib/auth/guards';

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="bg-background min-h-screen p-8">
      <h1 className="font-display text-amber text-2xl font-semibold">Sanctum</h1>
      <p className="text-text-muted mt-2 text-sm">
        Welcome, {user.email}. Dashboard coming in Day 2.
      </p>
    </main>
  );
}
