import { useCountUp } from '../../hooks/useReveal'
import { getWorkImagePath, getWorkThumbPath } from '../../lib/works'
import type { Work } from '../../types/work'

interface HeroStat {
  value: number
  suffix?: string
  label: string
}

interface HeroSectionProps {
  stats: HeroStat[]
  works: Work[]
  onOpenContactForm: () => void
}

function StatValue({ value }: { value: number }) {
  const ref = useCountUp(value)
  return (
    <span className="hero__stat-num" ref={ref as React.RefObject<HTMLSpanElement>}>
      0
    </span>
  )
}

/**
 * 入口ヒーロー。
 * 借用元 = Mobbin（巨大タイポ → そのままツール本体へ入る導線）。
 * アンカー = Linear の構造（左寄せ・グレーのリード文・数値の列）へ翻訳している。
 * 下端に実作品のサムネ帯を常時ゆっくり流す（CSSマーキー＝iOS でも安定する手法）。
 */
export function HeroSection({ stats, works, onOpenContactForm }: HeroSectionProps) {
  // 途切れないよう2周分ならべる
  const strip = works.length > 0 ? [...works, ...works] : []

  return (
    <section className="hero">
      <div className="hero__inner">
        <p className="hero__kicker">AKASHIKI — Works Finder</p>

        <h1 className="hero__title">
          つくったものを、
          <br />
          条件から見つける。
        </h1>

        <p className="hero__lead">
          {'業種・サイト種別・制作目的・使った技術。4つの軸で絞り込むと、依頼を考えている案件にいちばん近い制作実績だけが残ります。1枚のLPから18ページのブランドサイトまで、実際に公開しているものだけを並べています。'}
        </p>

        <div className="hero__actions">
          <a className="primary-button" href="#finder">
            実績を探す
          </a>
          <button type="button" className="ghost-button" onClick={onOpenContactForm}>
            制作について相談する
          </button>
        </div>

        <dl className="hero__stats">
          {stats.map((stat) => (
            <div className="hero__stat" key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="hero__stat-value">
                <StatValue value={stat.value} />
                {stat.suffix != null && <span className="hero__stat-suffix">{stat.suffix}</span>}
              </dd>
              <dd className="hero__stat-label">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      {strip.length > 0 && (
        <div className="hero__strip" aria-hidden="true">
          <div className="hero__strip-track">
            {strip.map((work, i) => (
              <span className="hero__strip-item" key={`${work.slug}-${i}`}>
                <img
                  src={getWorkThumbPath(work)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={240}
                  height={135}
                  onError={(event) => {
                    const img = event.currentTarget
                    const fallback = getWorkImagePath(work)
                    if (!img.src.endsWith(fallback)) {
                      img.onerror = null
                      img.src = fallback
                    }
                  }}
                />
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
