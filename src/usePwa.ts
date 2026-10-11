'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};
export function usePwa() {
  const [online, setOnline] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [installable, setInstallable] = useState(false);
  const [installBusy, setInstallBusy] = useState(false);
  const [ios, setIos] = useState(false);
  const [offline, setOffline] = useState<'preparing' | 'ready' | 'error' | 'unsupported'>(
    'preparing',
  );
  const [download, setDownload] = useState(0);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const prompt = useRef<InstallPrompt | null>(null);
  const applyingUpdate = useRef(false);
  const register = useRef<(() => Promise<void>) | null>(null);
  useEffect(() => {
    let disposed = false;
    const standalone = matchMedia('(display-mode: standalone)');
    const detectInstalled = () =>
      setInstalled(
        standalone.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone,
      );
    const network = () => setOnline(navigator.onLine);
    setIos(
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    );
    detectInstalled();
    network();
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      prompt.current = event as InstallPrompt;
      setInstallable(true);
    };
    const appInstalled = () => {
      prompt.current = null;
      setInstalled(true);
      setInstallable(false);
    };
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', appInstalled);
    window.addEventListener('online', network);
    window.addEventListener('offline', network);
    standalone.addEventListener('change', detectInstalled);
    const message = (event: MessageEvent) => {
      if (event.data?.type === 'NETWORK_STATUS' && typeof event.data.online === 'boolean')
        setOnline(event.data.online);
      if (event.data?.type === 'OFFLINE_READY') {
        setOffline('ready');
        setDownload(100);
      }
      if (event.data?.type === 'OFFLINE_ERROR')
        setOffline((current) => (current === 'ready' ? 'ready' : 'error'));
      if (event.data?.type === 'OFFLINE_PROGRESS')
        setDownload(Math.round((100 * event.data.completed) / event.data.total));
    };
    const controllerChange = () => {
      if (applyingUpdate.current) {
        window.location.reload();
        return;
      }
      navigator.serviceWorker.controller?.postMessage({ type: 'OFFLINE_STATUS' });
    };
    if (
      !('serviceWorker' in navigator) ||
      !window.isSecureContext ||
      process.env.NODE_ENV !== 'production'
    ) {
      setOffline('unsupported');
    } else {
      navigator.serviceWorker.addEventListener('message', message);
      navigator.serviceWorker.addEventListener('controllerchange', controllerChange);
      register.current = async () => {
        try {
          setOffline((current) => (current === 'ready' ? 'ready' : 'preparing'));
          navigator.serviceWorker.controller?.postMessage({ type: 'OFFLINE_STATUS' });
          const existing = await navigator.serviceWorker.getRegistration('/');
          const reg =
            existing ||
            (await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
              updateViaCache: 'none',
            }));
          if (disposed) return;
          registration.current = reg;
          if (reg.waiting) setUpdateAvailable(true);
          navigator.serviceWorker.controller?.postMessage({ type: 'OFFLINE_STATUS' });
          const watch = (worker: ServiceWorker | null) => {
            worker?.addEventListener('statechange', () => {
              if (disposed) return;
              if (worker.state === 'installed' && navigator.serviceWorker.controller)
                setUpdateAvailable(true);
              if (worker.state === 'redundant')
                setOffline((current) => (current === 'ready' ? 'ready' : 'error'));
            });
          };
          watch(reg.installing);
          reg.addEventListener('updatefound', () => watch(reg.installing));
          if (existing && navigator.onLine) void reg.update().catch(() => {});
        } catch {
          if (!disposed) setOffline((current) => (current === 'ready' ? 'ready' : 'error'));
        }
      };
      // Let the current screen and its animation finish loading before caching assets.
      const start = () => {
        if (!disposed) void register.current?.();
      };
      if (document.readyState === 'complete') start();
      else window.addEventListener('load', start, { once: true });
      const checkUpdate = () => {
        if (document.visibilityState === 'visible' && navigator.onLine)
          void registration.current?.update().catch(() => {});
      };
      document.addEventListener('visibilitychange', checkUpdate);
      return () => {
        disposed = true;
        window.removeEventListener('load', start);
        document.removeEventListener('visibilitychange', checkUpdate);
        navigator.serviceWorker.removeEventListener('message', message);
        navigator.serviceWorker.removeEventListener('controllerchange', controllerChange);
        window.removeEventListener('beforeinstallprompt', beforeInstall);
        window.removeEventListener('appinstalled', appInstalled);
        window.removeEventListener('online', network);
        window.removeEventListener('offline', network);
        standalone.removeEventListener('change', detectInstalled);
      };
    }
    return () => {
      disposed = true;
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', appInstalled);
      window.removeEventListener('online', network);
      window.removeEventListener('offline', network);
      standalone.removeEventListener('change', detectInstalled);
    };
  }, []);
  const install = useCallback(async () => {
    if (!prompt.current || installBusy) return;
    setInstallBusy(true);
    try {
      await prompt.current.prompt();
      await prompt.current.userChoice;
      prompt.current = null;
      setInstallable(false);
    } finally {
      setInstallBusy(false);
    }
  }, [installBusy]);
  const update = useCallback(() => {
    if (!registration.current?.waiting) {
      setUpdateAvailable(false);
      return;
    }
    applyingUpdate.current = true;
    setUpdating(true);
    registration.current.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, []);
  const retry = useCallback(async () => {
    setDownload(0);
    await register.current?.();
    await registration.current?.update().catch(() => {});
  }, []);
  return {
    online,
    installed,
    installable,
    installBusy,
    ios,
    offline,
    download,
    updateAvailable,
    updating,
    install,
    update,
    retry,
  };
}
