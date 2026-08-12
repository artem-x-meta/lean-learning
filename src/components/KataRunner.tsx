import { useEffect, useMemo, useState } from 'react';
import { t, type Lang } from '../lib/i18n';
import { readSolved, writeSolved } from '../lib/kataProgress';
import { normalizeCode } from '../lib/practice';

/**
 * The working surface of a kata: edit the skeleton, get a verdict.
 *
 * Where the verdict comes from depends on where the page is running. With the
 * local checker answering, the proof is compiled by the reader's own Lean and
 * the mark is set by the machine. Without it — the published site — the editor
 * is still a scratch pad that feeds the playground link, and the mark is
 * self-reported. The page never pretends to have checked something it has not.
 */

interface Props {
  slug: string;
  skeleton: string;
  /** Statement the draft must still contain, whitespace-normalised. */
  statement: string;
  lang?: Lang;
  endpoint?: string;
}

interface Verdict {
  ok: boolean;
  hasSorry?: boolean;
  timedOut?: boolean;
  output: string;
}

type Mode = 'probing' | 'absent' | 'ready';

const PLAYGROUND = 'https://live.lean-lang.org/#code=';

export default function KataRunner({
  slug,
  skeleton,
  statement,
  lang = 'en',
  endpoint = 'http://127.0.0.1:4322',
}: Props) {
  const [mode, setMode] = useState<Mode>('probing');
  const [draft, setDraft] = useState(skeleton);
  const [busy, setBusy] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [solved, setSolved] = useState(false);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    setSolved(Boolean(readSolved()[slug]));
  }, [slug]);

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

  // Editing the proof is the whole point; editing the statement is not.
  const intact = useMemo(() => normalizeCode(draft).includes(statement), [draft, statement]);

  const mark = (next: boolean, automatic = false) => {
    setSolved(next);
    setAuto(next && automatic);
    writeSolved(slug, next);
  };

  const run = async () => {
    if (!intact) return;
    setBusy(true);
    setVerdict(null);
    try {
      const response = await fetch(`${endpoint}/check`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: draft }),
      });
      const result: Verdict = await response.json();
      setVerdict(result);
      if (result.ok) mark(true, true);
    } catch (error) {
      setVerdict({ ok: false, output: String(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="dm-kata not-content" data-solved={solved}>
      <div className="dm-kata__bar">
        <span className="dm-kata__state">{solved ? `✓ ${t(lang, 'kataSolved')}` : ''}</span>
        <button
          className="dm-button dm-button--secondary dm-kata__mark"
          type="button"
          onClick={() => mark(!solved)}
        >
          {solved ? t(lang, 'kataUnmark') : t(lang, 'kataMark')}
        </button>
      </div>

      <textarea
        className="dm-kata__editor"
        value={draft}
        spellCheck={false}
        aria-label={t(lang, 'kataEditor')}
        rows={Math.min(30, draft.split('\n').length + 2)}
        onChange={(event) => setDraft(event.target.value)}
      />

      {!intact && <p className="dm-kata__warn">{t(lang, 'kataTampered')}</p>}

      <div className="dm-kata__actions">
        {mode === 'ready' && (
          <button className="dm-button" type="button" onClick={run} disabled={busy || !intact}>
            {busy ? t(lang, 'runnerChecking') : t(lang, 'runnerCheck')}
          </button>
        )}
        <button
          className="dm-button dm-button--secondary"
          type="button"
          onClick={() => { setDraft(skeleton); setVerdict(null); }}
          disabled={busy}
        >
          {t(lang, 'runnerReset')}
        </button>
        <a
          className="dm-kata__playground"
          href={`${PLAYGROUND}${encodeURIComponent(draft)}`}
          target="_blank"
          rel="noopener"
        >
          {t(lang, 'playground')} <span aria-hidden="true">↗</span>
        </a>
      </div>

      {mode === 'absent' && (
        <p className="dm-kata__offline">
          <strong>{t(lang, 'kataOffline')}</strong> {t(lang, 'kataOfflineHow')}
        </p>
      )}

      {verdict && (
        <div className="dm-kata__verdict" data-status={verdict.ok ? 'ok' : 'fail'} aria-live="polite">
          <strong>
            {verdict.ok
              ? t(lang, 'runnerOk')
              : verdict.hasSorry
                ? t(lang, 'runnerSorry')
                : t(lang, 'runnerFail')}
          </strong>
          {verdict.ok && auto && <span className="dm-kata__auto">{t(lang, 'kataAuto')}</span>}
          {verdict.output && <pre>{verdict.output}</pre>}
        </div>
      )}
    </section>
  );
}
