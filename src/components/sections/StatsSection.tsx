import { useMemo } from 'react'

import { useReveal } from '../../hooks/useReveal'
import type { Work } from '../../types/work'

interface StatsSectionProps {
  works: Work[]
  onApplyGenre: (genre: string) => void
}

interface Bar {
  label: string
  count: number
}

/** ページ数の帯。実データの pageCount だけで作る（推測値は入れない）。 */
const SCALE_BANDS: { label: string; note: string; test: (n: number) => boolean }[] = [
  { label: '1ページ', note: 'LP・1枚完結', test: (n) => n === 1 },
  { label: '2〜5ページ', note: '小規模サイト', test: (n) => n >= 2 && n <= 5 },
  { label: '6〜12ページ', note: '標準的なサイト', test: (n) => n >= 6 && n <= 12 },
  { label: '13ページ以上', note: '大規模・多言語', test: (n) => n >= 13 },
]

/**
 * 掲載データそのものを図にしたセクション。
 * 数値はすべて works から算出（捏造なし）。棒は単一色で、長さだけが量を表す。
 */
export function StatsSection({ works, onApplyGenre }: StatsSectionProps) {
  const ref = useReveal<HTMLElement>()

  const genreBars = useMemo<Bar[]>(() => {
    const map = new Map<string, number>()
    for (const work of works) {
      const key = work.genre.trim()
      if (key.length === 0) continue
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ja'))
  }, [works])

  const scaleBars = useMemo(() => {
    const counted = works
      .map((work) => work.pageCount)
      .filter((n): n is number => typeof n === 'number' && n > 0)
    return SCALE_BANDS.map((band) => ({
      ...band,
      count: counted.filter((n) => band.test(n)).length,
    }))
  }, [works])

  const breakdown = useMemo(
    () => [
      { label: '実案件（コンセプト以外）', count: works.filter((w) => w.isConcept !== true).length },
      { label: 'アニメーションあり', count: works.filter((w) => w.hasAnimation === true).length },
      { label: 'フォームあり', count: works.filter((w) => w.hasForm === true).length },
      { label: 'マルチページ（2P以上）', count: works.filter((w) => (w.pageCount ?? 0) >= 2).length },
      { label: 'CMS（WordPress）', count: works.filter((w) => w.hasCms === true).length },
    ],
    [works],
  )

  const genreMax = Math.max(1, ...genreBars.map((bar) => bar.count))
  const scaleMax = Math.max(1, ...scaleBars.map((bar) => bar.count))
  const totalPages = works.reduce((sum, work) => sum + (work.pageCount ?? 0), 0)
  const withScale = scaleBars.reduce((sum, bar) => sum + bar.count, 0)

  return (
    <section className="stats" id="stats" ref={ref}>
      <div className="stats__inner">
        <div className="stats__head reveal">
          <h2 className="stats__title">どんな案件を、どのくらいの規模でやってきたか</h2>
          <p className="stats__lead">
            {'下のグラフは、この一覧に載っている作品そのものを数えたものです。棒を押すとその条件で絞り込みます。'}
          </p>
        </div>

        <div className="stats__grid">
          <figure className="stats__chart reveal">
            <figcaption className="stats__chart-head">
              <h3 className="stats__chart-title">業種ジャンル別の件数</h3>
              <p className="stats__chart-note">全{works.length}件／{genreBars.length}ジャンル</p>
            </figcaption>
            <ul className="bars">
              {genreBars.map((bar, i) => (
                <li className="bars__row" key={bar.label}>
                  <button
                    type="button"
                    className="bars__btn"
                    onClick={() => onApplyGenre(bar.label)}
                    aria-label={`${bar.label} の実績 ${bar.count}件を表示`}
                  >
                    <span className="bars__label">{bar.label}</span>
                    <span className="bars__track">
                      <span
                        className="bars__fill"
                        style={{
                          '--w': `${(bar.count / genreMax) * 100}%`,
                          '--d': `${i * 45}ms`,
                        } as React.CSSProperties}
                      />
                    </span>
                    <span className="bars__value">{bar.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </figure>

          <div className="stats__col">
          <figure className="stats__chart reveal" data-reveal-delay="120">
            <figcaption className="stats__chart-head">
              <h3 className="stats__chart-title">ページ数の分布</h3>
              <p className="stats__chart-note">
                {withScale}件／合計{totalPages}ページ
              </p>
            </figcaption>
            <ul className="bars bars--wide">
              {scaleBars.map((bar, i) => (
                <li className="bars__row" key={bar.label}>
                  <span className="bars__btn bars__btn--static">
                    <span className="bars__label">
                      {bar.label}
                      <small className="bars__sub">{bar.note}</small>
                    </span>
                    <span className="bars__track">
                      <span
                        className="bars__fill bars__fill--alt"
                        style={{
                          '--w': `${(bar.count / scaleMax) * 100}%`,
                          '--d': `${i * 60}ms`,
                        } as React.CSSProperties}
                      />
                    </span>
                    <span className="bars__value">{bar.count}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="stats__foot">
              {'1枚のLPから18ページのブランドサイト、36ページの多言語サイトまで。規模が上がるほど、設計と表記ゆれの管理が仕事の中心になります。'}
            </p>
          </figure>

          <figure className="stats__chart stats__chart--split reveal" data-reveal-delay="200">
            <figcaption className="stats__chart-head">
              <h3 className="stats__chart-title">中身の内訳</h3>
              <p className="stats__chart-note">全{works.length}件中</p>
            </figcaption>
            <ul className="split">
              {breakdown.map((row) => (
                <li className="split__row" key={row.label}>
                  <span className="split__label">{row.label}</span>
                  <span className="split__meter">
                    <span
                      className="split__fill"
                      style={{ '--w': `${(row.count / Math.max(1, works.length)) * 100}%` } as React.CSSProperties}
                    />
                  </span>
                  <span className="split__value">
                    {row.count}
                    <small>/{works.length}</small>
                  </span>
                </li>
              ))}
            </ul>
          </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
