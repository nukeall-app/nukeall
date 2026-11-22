import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import '../../src/ui/styles.css';
import type { ExtensionMessage, MessageResponse } from '../../src/core/messages';
import { loadSettings } from '../../src/core/storage';
import type { JobState } from '../../src/core/types';
import { getUiDict, resolveUiLang, type UiLang } from '../../src/i18n';

function PopupApp() {
  const [lang, setLang] = useState<UiLang>('en');
  const [job, setJob] = useState<JobState | null>(null);
  const [onPlatform, setOnPlatform] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      setLang(resolveUiLang(s.locale));
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      setOnPlatform(
        Boolean(tab?.url && /^https:\/\/([a-z0-9-]+\.)?(x|twitter|instagram|reddit|linkedin)\.com/i.test(tab.url)),
      );
      const resp = (await browser.runtime.sendMessage({
        type: 'GET_STATE',
      } satisfies ExtensionMessage)) as MessageResponse | undefined;
      if (resp && resp.ok && resp.state) {
        setJob(resp.state.activeJob);
      }
    })();
  }, []);

  const d = getUiDict(lang);

  const openFullPanel = async () => {
    const g = globalThis as unknown as {
      chrome?: {
        sidePanel?: { open?: (opts: { windowId: number }) => Promise<void> };
      };
      browser?: {
        sidebarAction?: { open?: () => Promise<void> };
      };
    };
    try {
      const win = await browser.windows.getCurrent();
      if (g.chrome?.sidePanel?.open && win.id != null) {
        await g.chrome.sidePanel.open({ windowId: win.id });
        window.close();
        return;
      }
      if (g.browser?.sidebarAction?.open) {
        await g.browser.sidebarAction.open();
        window.close();
        return;
      }
    } catch {
      // Fall back to opening full panel in a tab
    }
    await browser.tabs.create({ url: browser.runtime.getURL('/sidepanel.html') });
    window.close();
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-orange-500 text-zinc-950 font-black text-base">
            ☢
          </span>
          <div>
            <div className="font-bold text-sm">{d.appName}</div>
            <div className="text-[11px] text-zinc-400">{d.localBadge}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.close()}
          className="px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 hover:text-white text-[11px] cursor-pointer"
          aria-label={d.closePanelTitle}
          title={d.closePanelTitle}
        >
          ✕
        </button>
      </div>

      {job && (
        <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="text-[11px] text-zinc-400">{d.popup.status}</div>
          <div className="font-semibold">
            {d.job[job.status === 'idle' ? 'running' : job.status]} · {job.done}/{job.total}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => void openFullPanel()}
          className="w-full py-2 px-3 rounded-lg bg-orange-500 text-zinc-950 font-bold text-sm hover:bg-orange-400 cursor-pointer"
        >
          {d.popup.openPanel}
        </button>

        {!onPlatform && (
          <div className="grid grid-cols-2 gap-1.5">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center py-1.5 px-2 rounded-lg border border-zinc-700 text-zinc-200 hover:border-orange-500"
            >
              X
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center py-1.5 px-2 rounded-lg border border-zinc-700 text-zinc-200 hover:border-orange-500"
            >
              Instagram
            </a>
            <a
              href="https://www.reddit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center py-1.5 px-2 rounded-lg border border-zinc-700 text-zinc-200 hover:border-orange-500"
            >
              Reddit
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center py-1.5 px-2 rounded-lg border border-zinc-700 text-zinc-200 hover:border-orange-500"
            >
              LinkedIn
            </a>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
        <a
          href="https://nukeall.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-200"
        >
          {d.popup.siteLink}
        </a>
        <a
          href="https://github.com/nukeall-app/nukeall"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-200"
        >
          {d.popup.githubLink}
        </a>
      </div>
    </div>
  );
}

render(<PopupApp />, document.getElementById('app')!);
