import { useEffect, useState } from 'react';
import { t, tv, type Lang } from '../lib/i18n';
import { readSolved } from '../lib/kataProgress';
import { difficulties, type Difficulty, type KataItem } from '../data/katas';

/**
 * The catalogue.
 *
 * The page around it is static; only the ticks are not, because progress lives
 * in the browser. Everything is rendered at build time and the marks are filled
 * in on mount, so the list is readable with JavaScript off.
 */

interface Props {
  items: KataItem[];
  lang?: Lang;
}

const heading: Record<Difficulty, 'diffIntro' | 'diffCore' | 'diffTough'> = {
  intro: 'diffIntro',
  core: 'diffCore',
  tough: 'diffTough',
};

export default function KataList({ items, lang = 'en' }: Props) {
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSolved(readSolved());
    setReady(true);
  }, []);

  const done = items.filter((item) => solved[item.slug]).length;

  return (
    <div className="dm-katas not-content">
      {/* The count comes from the catalogue, so no page has to be edited when
          a kata is added — and none can be wrong about how many there are. */}
      <p className="dm-katas__progress">
        {ready && done > 0
          ? tv(lang, 'kataProgress', { done, total: items.length })
          : tv(lang, 'kataTotal', { total: items.length })}
      </p>

      {difficulties.map((level) => {
        const group = items.filter((item) => item.difficulty === level);
        if (group.length === 0) return null;

        return (
          <section className="dm-katas__group" key={level}>
            <h3 className="dm-katas__level" data-level={level}>{t(lang, heading[level])}</h3>
            <ul className="dm-katas__list">
              {group.map((item) => (
                <li className="dm-katas__item" key={item.slug} data-solved={Boolean(solved[item.slug])}>
                  <a className="dm-katas__link" href={item.href}>
                    <span className="dm-katas__tick" aria-hidden="true">{solved[item.slug] ? '✓' : ''}</span>
                    <span className="dm-katas__body">
                      <strong className="dm-katas__title">{item.title}</strong>
                      <span className="dm-katas__brief">{item.brief}</span>
                      <span className="dm-katas__tactics">
                        {item.tactics.map((tactic) => (
                          <code key={tactic}>{tactic}</code>
                        ))}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
