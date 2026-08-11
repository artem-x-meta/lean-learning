import { useEffect, useState } from 'react';
import { readBooleanRecord, writeBooleanRecord } from '../lib/storage';
import { t, type Lang } from '../lib/i18n';

interface Option {
  label: string;
  explanation: string;
}

interface Props {
  id: string;
  question: string;
  options: Option[];
  correctIndex: number;
  /** Islands cannot read Astro context, so the page passes the language in. */
  lang?: Lang;
}

const STORAGE_KEY = 'dive-math:checks';

function rememberAnswer(id: string) {
  writeBooleanRecord(localStorage, STORAGE_KEY, id, true);
}

export default function QuickCheck({ id, question, options, correctIndex, lang = 'en' }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [wasCompleted, setWasCompleted] = useState(false);

  useEffect(() => {
    setWasCompleted(Boolean(readBooleanRecord(localStorage, STORAGE_KEY)[id]));
  }, [id]);

  const choose = (index: number) => {
    setSelected(index);
    if (index === correctIndex) {
      setWasCompleted(true);
      rememberAnswer(id);
    }
  };

  const isCorrect = selected === correctIndex;

  return (
    <section className="dm-check not-content" aria-labelledby={`${id}-question`}>
      <p className="dm-check__eyebrow">{t(lang, 'quickCheckEyebrow')} {wasCompleted && `· ${t(lang, 'quickCheckSolved')}`}</p>
      <h3 className="dm-check__question" id={`${id}-question`}>{question}</h3>
      <ul className="dm-check__options">
        {options.map((option, index) => {
          const isSelected = selected === index;
          const stateClass = !isSelected ? '' : index === correctIndex ? 'dm-option--correct' : 'dm-option--wrong';
          return (
            <li key={option.label}>
              <button
                type="button"
                className={`dm-option ${isSelected ? 'dm-option--selected' : ''} ${stateClass}`}
                onClick={() => choose(index)}
                aria-pressed={isSelected}
              >
                <strong>{String.fromCharCode(1040 + index)}.</strong> {option.label}
              </button>
            </li>
          );
        })}
      </ul>
      {selected !== null && (
        <div className="dm-check__feedback" data-status={isCorrect ? 'correct' : 'wrong'} aria-live="polite">
          <strong>{isCorrect ? t(lang, 'correct') : t(lang, 'incorrect')}</strong>{' '}
          {options[selected].explanation}
        </div>
      )}
    </section>
  );
}
