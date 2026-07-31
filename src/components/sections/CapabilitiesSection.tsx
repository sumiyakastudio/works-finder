import { useMemo } from 'react'

import { useReveal } from '../../hooks/useReveal'
import type { Work } from '../../types/work'

interface CapabilitiesSectionProps {
  works: Work[]
  onApplySiteType: (siteType: string) => void
  onApplyQuery: (keyword: string) => void
}

/** 実績がまだ無いが対応できるもの。実績と混ぜないよう別扱いで出す。 */
const PLANNED_BUILDS = ['採用サイト', 'オウンドメディア', 'ECサイト', '会員向けサイト']

const PLANNED_FEATURES = [
  '会員登録・ログイン',
  'マイページ',
  '決済・カート',
  '在庫・料金の管理画面',
  '予約枠の管理',
  '記事の投稿・下書き',
]

const PLANNED_CONNECTIONS = [
  '外部APIとの連携',
  'スプレッドシート連携',
  'CSVの一括取込',
  '認証基盤（メール / SNSログイン）',
  'Slack・LINEへの通知',
  '定期実行（バッチ）',
]

/** 値の出現回数を数えて多い順に返す */
const tally = (values: string[], limit: number): { label: string; count: number }[] => {
  const map = new Map<string, number>()
  for (const value of values) {
    const key = value.trim()
    if (key.length === 0) continue
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ja'))
    .slice(0, limit)
}

/**
 * 対応範囲。
 * 「実績あり」の項目は掲載データから毎回集計している（作品が増えれば自動で増える）。
 * 実績が無いものは "対応可" として明確に分けて出す。
 */
export function CapabilitiesSection({
  works,
  onApplySiteType,
  onApplyQuery,
}: CapabilitiesSectionProps) {
  const ref = useReveal<HTMLElement>()
  const builds = useMemo(() => tally(works.map((work) => work.siteType), 8), [works])
  const features = useMemo(
    () => tally(works.flatMap((work) => work.features ?? []), 12),
    [works],
  )
  const techs = useMemo(
    () => tally(works.flatMap((work) => work.techStack), 10),
    [works],
  )

  const cmsCount = works.filter((work) => work.hasCms).length
  const formCount = works.filter((work) => work.hasForm).length

  return (
    <section className="cap" id="capabilities" ref={ref}>
      <div className="cap__inner">
        <div className="cap__head reveal">
          <h2 className="cap__title">
            つくれるのは、
            <br />
            サイトの見た目だけではありません。
          </h2>
          <p className="cap__lead">
            {'ページを作って終わり、ではなく「そのページで何をさせたいか」から作ります。下は実際に納品した中身の集計と、まだ実績は無いものの対応できる範囲です。'}
          </p>
          <p className="cap__legend">
            <span className="cap__legend-item">
              <span className="cap__badge cap__badge--proven">3</span> 数字＝この掲載データ内の実績件数（押すと絞り込めます）
            </span>
            <span className="cap__legend-item">
              <span className="cap__badge">対応可</span> 実績はまだありませんが、設計・実装できます
            </span>
          </p>
        </div>

        <div className="cap__row reveal">
          <div className="cap__row-label">
            <h3>つくるもの</h3>
            <p>ページの形</p>
          </div>
          <div className="cap__row-items">
            {builds.map((item) => (
              <button
                type="button"
                key={item.label}
                className="cap__item cap__item--proven"
                onClick={() => onApplySiteType(item.label)}
              >
                {item.label}
                <span className="cap__badge cap__badge--proven">{item.count}</span>
              </button>
            ))}
            {PLANNED_BUILDS.map((label) => (
              <span className="cap__item" key={label}>
                {label}
                <span className="cap__badge">対応可</span>
              </span>
            ))}
          </div>
        </div>

        <div className="cap__row reveal">
          <div className="cap__row-label">
            <h3>画面の中の機能</h3>
            <p>訪問者が触る部分</p>
          </div>
          <div className="cap__row-items">
            {features.map((item) => (
              <button
                type="button"
                key={item.label}
                className="cap__item cap__item--proven"
                onClick={() => onApplyQuery(item.label)}
              >
                {item.label}
                <span className="cap__badge cap__badge--proven">{item.count}</span>
              </button>
            ))}
            {PLANNED_FEATURES.map((label) => (
              <span className="cap__item" key={label}>
                {label}
                <span className="cap__badge">対応可</span>
              </span>
            ))}
          </div>
        </div>

        <div className="cap__row reveal">
          <div className="cap__row-label">
            <h3>つなぐ・自動化する</h3>
            <p>裏側の仕組み</p>
          </div>
          <div className="cap__row-items">
            {cmsCount > 0 && (
              <span className="cap__item cap__item--proven">
                CMSからの更新（WordPress）
                <span className="cap__badge cap__badge--proven">{cmsCount}</span>
              </span>
            )}
            {formCount > 0 && (
              <span className="cap__item cap__item--proven">
                フォーム送信・自動返信
                <span className="cap__badge cap__badge--proven">{formCount}</span>
              </span>
            )}
            {PLANNED_CONNECTIONS.map((label) => (
              <span className="cap__item" key={label}>
                {label}
                <span className="cap__badge">対応可</span>
              </span>
            ))}
          </div>
        </div>

        <div className="cap__row reveal">
          <div className="cap__row-label">
            <h3>使っている技術</h3>
            <p>掲載データからの集計</p>
          </div>
          <div className="cap__row-items">
            {techs.map((item) => (
              <button
                type="button"
                key={item.label}
                className="cap__item cap__item--proven"
                onClick={() => onApplyQuery(item.label)}
              >
                {item.label}
                <span className="cap__badge cap__badge--proven">{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
