'use client';
import { useState } from 'react';
import {
  ArrowSquareOut,
  Check,
  CloudCheck,
  CloudSlash,
  DownloadSimple,
  DeviceMobile,
  ShareNetwork,
  Sun,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import type { usePwa } from './usePwa';
import type { useWakeLock } from './useNative';

export function NativeSettings({
  pwa,
  wake,
  onShare,
}: {
  pwa: ReturnType<typeof usePwa>;
  wake: ReturnType<typeof useWakeLock>;
  onShare: () => void;
}) {
  const [showGuide, setShowGuide] = useState(false);
  return (
    <section className="native-settings" aria-label="App and offline settings">
      <h3>A little more at home.</h3>
      <div className="settings-group">
        <div className="setting-row">
          <span className="setting-icon lilac">
            <DeviceMobile />
          </span>
          <span>
            <strong>{pwa.installed ? 'Your home-screen app' : 'Lumni, one tap away'}</strong>
            <small>
              {pwa.installed
                ? 'Installed and ready for little discoveries'
                : 'Add Lumni to your home screen'}
            </small>
          </span>
          {pwa.installed ? (
            <Check size={22} aria-label="Installed" />
          ) : (
            <button
              className="button small"
              disabled={pwa.installBusy}
              onClick={() => {
                if (pwa.installable) void pwa.install().catch(() => setShowGuide(true));
                else setShowGuide(!showGuide);
              }}
            >
              {pwa.installBusy ? 'Opening…' : pwa.installable ? 'Install' : 'How to'}
              <ArrowSquareOut />
            </button>
          )}
        </div>
        {showGuide && !pwa.installed && (
          <div className="install-guide" role="status">
            <strong>Make a little room for curiosity.</strong>
            {pwa.ios ? (
              <p>
                Open Lumni in Safari, tap the Share button, then choose <b>Add to Home Screen</b>.
                Turn on <b>Open as Web App</b> if shown, then tap <b>Add</b>.
              </p>
            ) : (
              <p>
                Open your browser menu and choose <b>Install Lumni</b> or <b>Add to Home screen</b>.
                On desktop Chrome or Edge, use the install button in the address bar. If your
                browser has no install option, bookmark Lumni for quick access.
              </p>
            )}
          </div>
        )}
        <div className="setting-row">
          <span className="setting-icon mint">
            {pwa.offline === 'ready' ? (
              <CloudCheck />
            ) : pwa.online ? (
              <DownloadSimple />
            ) : (
              <CloudSlash />
            )}
          </span>
          <span>
            <strong>
              {pwa.offline === 'ready'
                ? 'Ready for offline learning'
                : pwa.offline === 'preparing'
                  ? 'Downloading a little possibility'
                  : pwa.offline === 'error'
                    ? 'Download needs another try'
                    : 'Offline learning is unavailable here'}
            </strong>
            <small>
              {pwa.offline === 'ready'
                ? 'All lessons, quizzes, puzzles and 3D labs saved'
                : pwa.offline === 'preparing'
                  ? `${pwa.download}% · Keep Lumni open until it’s ready`
                  : pwa.offline === 'error'
                    ? 'Reconnect, then retry the complete download'
                    : 'Open the published app in a supported browser'}
            </small>
          </span>
          {pwa.offline === 'ready' ? (
            <Check size={22} aria-label="Downloaded" />
          ) : pwa.offline === 'error' ? (
            <button className="button small" onClick={() => void pwa.retry()}>
              Retry
              <ArrowsClockwise />
            </button>
          ) : null}
        </div>
        {pwa.offline === 'preparing' && (
          <div
            className="offline-track"
            role="progressbar"
            aria-label="Offline download"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pwa.download}
          >
            <span style={{ width: `${pwa.download}%` }} />
          </div>
        )}
        <div className="setting-row">
          <span className="setting-icon peach">
            <Sun />
          </span>
          <span>
            <strong>Keep the curiosity awake</strong>
            <small>
              {!wake.supported
                ? 'Screen wake lock isn’t available in this browser'
                : wake.unavailable
                  ? 'Your device has paused this to save power'
                  : wake.held
                    ? 'Screen stays awake while this activity is open'
                    : 'Keep the screen on during lessons and challenges'}
            </small>
          </span>
          <button
            className="toggle"
            role="switch"
            aria-label="Keep screen awake"
            aria-checked={wake.enabled}
            disabled={!wake.supported}
            onClick={() => wake.setEnabled(!wake.enabled)}
          >
            <span />
          </button>
        </div>
        <div className="setting-row">
          <span className="setting-icon blue">
            <ShareNetwork />
          </span>
          <span>
            <strong>A little discovery, shared</strong>
            <small>Invite someone to explore STEM with you</small>
          </span>
          <button className="button small" onClick={onShare}>
            Share
            <ShareNetwork />
          </button>
        </div>
      </div>
      <p className="native-note">
        Your progress stays on this device. Download once while connected, then keep learning
        offline.
      </p>
    </section>
  );
}

export function AppStatus({ pwa }: { pwa: ReturnType<typeof usePwa> }) {
  if (pwa.online && !pwa.updateAvailable) return null;
  return (
    <aside className="app-status" aria-label="App status">
      {!pwa.online && (
        <span role="status">
          <CloudSlash size={18} />
          {pwa.offline === 'ready'
            ? 'Offline. Your discoveries are still here.'
            : 'Offline. Reconnect to finish downloading.'}
        </span>
      )}
      {pwa.updateAvailable && (
        <div className="update-notice">
          <span role="status">
            <SparkleMark />A fresh little update is ready.
          </span>
          <button
            className="button small"
            onClick={pwa.update}
            disabled={pwa.updating || !pwa.online}
          >
            {pwa.updating ? 'Updating…' : 'Update now'}
            <ArrowsClockwise />
          </button>
        </div>
      )}
    </aside>
  );
}
function SparkleMark() {
  return <ArrowsClockwise size={18} />;
}
