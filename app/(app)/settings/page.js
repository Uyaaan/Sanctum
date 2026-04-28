import { requireUser } from '@/lib/auth/guards';
import { getProfile } from '@/lib/db/profiles';
import { SettingsForm } from '@/components/SettingsForm';
import { PushSubscribeButton } from '@/components/PushSubscribeButton';
import { RuneDivider } from '@/components/RuneDivider';

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id).catch(() => null);

  return (
    <section className="space-y-8">
      <h2 className="font-display text-amber text-2xl font-semibold">Settings</h2>

      <SettingsForm initialProfile={profile} />

      <RuneDivider />

      <section className="space-y-3">
        <div>
          <h3 className="font-display text-rune-gold text-xs tracking-[0.2em] uppercase">
            Sanctum Bell
          </h3>
          <p className="text-text-subtle mt-1 max-w-md text-xs">
            A push notification fired when your bell time arrives. Subscribe in this browser to
            receive it. On localhost, the time-window cron does not auto-fire — use the test push
            button to verify the pipeline.
          </p>
        </div>
        <PushSubscribeButton />
      </section>

      <RuneDivider />

      <section className="space-y-1 text-xs">
        <p className="text-text-subtle">
          Signed in as <span className="text-text">{user.email}</span>
        </p>
      </section>
    </section>
  );
}
