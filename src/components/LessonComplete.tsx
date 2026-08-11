import { useEffect, useState } from 'react';
import { readBooleanRecord, writeBooleanRecord } from '../lib/storage';
import { t, type Lang } from '../lib/i18n';

interface Props {
  lessonId: string;
  /** Islands cannot read Astro context, so the page passes the language in. */
  lang?: Lang;
}

const STORAGE_KEY = 'dive-math:lessons';

export default function LessonComplete({ lessonId, lang = 'en' }: Props) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setComplete(Boolean(readBooleanRecord(localStorage, STORAGE_KEY)[lessonId]));
  }, [lessonId]);

  const toggle = () => {
    const next = !complete;
    setComplete(next);
    writeBooleanRecord(localStorage, STORAGE_KEY, lessonId, next);
  };

  return (
    <section className="dm-complete not-content" data-complete={complete}>
      <div>
        <h3>{complete ? t(lang, 'completeDone') : t(lang, 'completeAsk')}</h3>
        <p>{complete ? t(lang, 'completeDoneHint') : t(lang, 'completeAskHint')}</p>
      </div>
      <button className={`dm-button ${complete ? 'dm-button--secondary' : ''}`} type="button" onClick={toggle}>
        {complete ? t(lang, 'completeButtonDone') : t(lang, 'completeButton')}
      </button>
    </section>
  );
}
