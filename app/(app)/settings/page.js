import { requireUser } from '@/lib/auth/guards';
import { getProfile } from '@/lib/db/profiles';
import { listTemplates } from '@/lib/db/templates';
import { SettingsForm } from '@/components/SettingsForm';
import { PushSubscribeButton } from '@/components/PushSubscribeButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TemplatesForm } from '@/components/TemplatesForm';

export default async function SettingsPage() {
  const user = await requireUser();
  const [profile, templates] = await Promise.all([
    getProfile(user.id).catch(() => null),
    listTemplates(user.id).catch(() => []),
  ]);

  return (
    <section className="space-y-10">
      <h2 className="text-text text-2xl font-semibold">Settings</h2>

      <SettingsForm initialProfile={profile} />

      <hr className="border-border" />

      <section className="space-y-3">
        <div>
          <h3 className="text-text text-sm font-medium">Appearance</h3>
          <p className="text-text-subtle mt-1 text-xs">
            Choose between light, dark, or system theme.
          </p>
        </div>
        <ThemeToggle />
      </section>

      <hr className="border-border" />

      <section className="space-y-3">
        <div>
          <h3 className="text-text text-sm font-medium">Day templates</h3>
          <p className="text-text-subtle mt-1 max-w-md text-xs">
            Pre-fill the structured daily log fields per weekday. An empty field means no pre-fill
            for that weekday.
          </p>
        </div>
        <TemplatesForm initialTemplates={templates} />
      </section>

      <hr className="border-border" />

      <section className="space-y-3">
        <div>
          <h3 className="text-text text-sm font-medium">Sanctum Bell</h3>
          <p className="text-text-subtle mt-1 max-w-md text-xs">
            A push notification fired when your bell time arrives. Subscribe in this browser to
            receive it. On localhost, the time-window cron does not auto-fire — use the test push
            button to verify the pipeline.
          </p>
        </div>
        <PushSubscribeButton />
      </section>

      <hr className="border-border" />

      <section className="space-y-1 text-xs">
        <p className="text-text-subtle">
          Signed in as <span className="text-text">{user.email}</span>
        </p>
      </section>
    </section>
  );
}
