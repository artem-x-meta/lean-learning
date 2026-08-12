import { useEffect, useState } from 'react';
import { t, type Lang } from '../lib/i18n';

/**
 * Two modes for the same snippet.
 *
 * On the published site there is no Lean anywhere, so this stays out of the
 * way and the page keeps its playground link. When the local checker from
 * `npm run lean` answers, an editor appears and the code is compiled by your
 * own Lean — same Mathlib, same version, no round trip to anyone's server.
 */

interface Props {
  code: string;
  lang?: Lang;
  /** Where the local checker listens; matches scripts/lean-server.mjs. */
  endpoint?: string;
}

interface Verdict {
  ok: boolean;
  hasSorry?: boolean;
  timedOut?: boolean;
  output: string;
}

type Mode = 'probing' | 'absent' | 'ready';

export default function LeanRunner({ code, lang = 'en', endpoint = 'http://127.0.0.1:4322' }: Props) {
  const [mode, setMode] = useState<Mode>('probing');
  const [draft, setDraft] = useState(code);
  const [busy, setBusy] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  useEffect(() => {
    // A missing checker is the normal case, not an error: fail quietly.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);

    fetch(`${endpoint}/ping`, { signal: controller.signal })
      .then((response) => setMode(response.ok ? 'ready' : 'absent'))
      .catch(() => setMode('absent'))
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [endpoint]);

  if (mode !== 'ready') return null;

  const run = async () => {
    setBusy(true);
    setVerdict(null);
    try {
      const response = await fetch(`${endpoint}/check`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: draft }),
      });
      setVerdict(await response.json());
    } catch (error) {
      setVerdict({ ok: false, output: String(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dm-lean-runner not-content">
      <label className="dm-lean-runner__label" htmlFor="lean-runner-code">
        {t(lang, 'runnerTitle')}
      </label>

      <textarea
        id="lean-runner-code"
        className="dm-lean-runner__editor"
        value={draft}
        spellCheck={false}
        rows={Math.min(24, draft.split('\n').length + 2)}
        onChange={(event) => setDraft(event.target.value)}
      />

      <div className="dm-lean-runner__actions">
        <button className="dm-button" type="button" onClick={run} disabled={busy}>
          {busy ? t(lang, 'runnerChecking') : t(lang, 'runnerCheck')}
        </button>
        <button
          className="dm-button dm-button--secondary"
          type="button"
          onClick={() => { setDraft(code); setVerdict(null); }}
          disabled={busy}
        >
          {t(lang, 'runnerReset')}
        </button>
      </div>

      {verdict && (
        <div
          className="dm-lean-runner__verdict"
          data-status={verdict.ok ? 'ok' : 'fail'}
          aria-live="polite"
        >
          <strong>
            {verdict.ok
              ? t(lang, 'runnerOk')
              : verdict.hasSorry
                ? t(lang, 'runnerSorry')
                : t(lang, 'runnerFail')}
          </strong>
          {verdict.output && <pre>{verdict.output}</pre>}
        </div>
      )}
    </div>
  );
}
