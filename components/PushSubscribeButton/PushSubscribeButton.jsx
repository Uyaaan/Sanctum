'use client';

import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { sendTestPushAction } from '@/app/actions/push';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function PushSubscribeButton() {
  // Lazy initializers run once on first render — safe for SSR (window check) and
  // avoids tripping react-hooks/set-state-in-effect for synchronous browser-API reads.
  const [supported, setSupported] = useState(
    () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window,
  );
  const [permission, setPermission] = useState(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  );
  const [subscribed, setSubscribed] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setSubscribed(!!sub);
      } catch {
        if (!cancelled) setSupported(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supported]);

  async function subscribe() {
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult !== 'granted') {
        toast.error('Notifications denied. Enable in browser settings.');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        toast.error('VAPID public key missing.');
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = sub.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth_key: json.keys?.auth,
          user_agent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        toast.error('Failed to register subscription.');
        await sub.unsubscribe();
        return;
      }

      setSubscribed(true);
      toast.success('Sanctum Bell ready.');
    } catch (err) {
      toast.error(err?.message ?? 'Subscribe failed.');
    }
  }

  async function unsubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        setSubscribed(false);
        return;
      }
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
      setSubscribed(false);
      toast.success('Bell silenced.');
    } catch (err) {
      toast.error(err?.message ?? 'Unsubscribe failed.');
    }
  }

  function testPush() {
    startTransition(async () => {
      const result = await sendTestPushAction();
      if (result?.ok) {
        toast.success(`Test push sent (${result.dispatched}).`);
      } else {
        toast.error(result?.error ?? 'Test push failed.');
      }
    });
  }

  if (!supported) {
    return <p className="text-text-subtle text-xs">Web Push is not supported in this browser.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {subscribed ? (
        <>
          <button
            type="button"
            onClick={testPush}
            disabled={isPending}
            className="border-amber/40 text-amber hover:bg-amber/10 rounded border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Sending…' : 'Send test push'}
          </button>
          <button
            type="button"
            onClick={unsubscribe}
            className="border-border text-text-muted hover:text-crimson hover:border-crimson/40 rounded border px-3 py-1.5 text-xs transition-colors"
          >
            Unsubscribe
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={subscribe}
          disabled={permission === 'denied'}
          className="bg-amber text-background hover:bg-amber/90 rounded px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {permission === 'denied' ? 'Notifications blocked' : 'Subscribe to Sanctum Bell'}
        </button>
      )}
      <span className="text-text-subtle text-[0.65rem] tracking-wider uppercase">
        {subscribed ? 'Subscribed' : `Permission: ${permission}`}
      </span>
    </div>
  );
}
