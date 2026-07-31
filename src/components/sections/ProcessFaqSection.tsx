import type { ReactNode } from 'react'

import { useReveal } from '../../hooks/useReveal'

interface ProcessFaqSectionProps {
  onOpenContactForm: () => void
}

/* 図はすべて自作の線画SVG（外部アイコンライブラリは混ぜない・線幅1.5で統一） */
const IconSend = (
  <svg viewBox="0 0 64 44" fill="none" aria-hidden="true">
    <rect x="1" y="9" width="38" height="26" rx="4" className="fig-line" />
    <path d="M8 17h24M8 23h16M8 29h20" className="fig-line fig-line--soft" />
    <path d="M44 22h16M54 16l6 6-6 6" className="fig-line fig-accent" />
  </svg>
)

const IconPlan = (
  <svg viewBox="0 0 64 44" fill="none" aria-hidden="true">
    <rect x="4" y="3" width="26" height="38" rx="3" className="fig-line" />
    <path d="M10 12h14M10 19h14M10 26h9" className="fig-line fig-line--soft" />
    <rect x="36" y="9" width="24" height="9" rx="2" className="fig-line fig-accent" />
    <rect x="36" y="23" width="24" height="4" rx="2" className="fig-line fig-line--soft" />
    <rect x="36" y="31" width="16" height="4" rx="2" className="fig-line fig-line--soft" />
  </svg>
)

const IconShip = (
  <svg viewBox="0 0 64 44" fill="none" aria-hidden="true">
    <rect x="2" y="6" width="42" height="32" rx="4" className="fig-line" />
    <path d="M2 15h42" className="fig-line fig-line--soft" />
    <circle cx="8" cy="10.5" r="1.4" className="fig-dot" />
    <circle cx="13" cy="10.5" r="1.4" className="fig-dot" />
    <path d="M50 30l5 5 9-13" className="fig-line fig-accent" />
  </svg>
)

const STEPS: { n: string; title: string; body: string; fig: ReactNode }[] = [
  {
    n: '01',
    title: '近い実績のURLを送る',
    body: 'このツールで絞り込んだ状態のURL、または気になった実績のページをそのまま送ってください。要件がまだ固まっていなくても構いません。「この2つの間くらい」で十分です。',
    fig: IconSend,
  },
  {
    n: '02',
    title: '構成と概算をお返しする',
    body: 'ページ構成（サイトマップ）、必要な機能、想定の制作期間、概算費用を書面でお返しします。ここまでは費用はかかりません。認識がずれていれば、この段階で何度でも直します。',
    fig: IconPlan,
  },
  {
    n: '03',
    title: '制作 → 公開 → 引き渡し',
    body: '実際の画面を見ていただきながら進めます。公開後は、更新の手順書をお渡しするか、更新自体を継続でお引き受けするかを選べます。',
    fig: IconShip,
  },
]

const FAQ = [
  {
    q: 'デザインだけ、コーディングだけ、の依頼もできますか。',
    a: 'できます。デザインデータ（Figma等）をお持ちであればコーディングから、逆にラフしか無い状態からでも構いません。既存サイトの一部改修だけ、という依頼も受けています。',
  },
  {
    q: 'WordPressで納品してもらえますか。',
    a: '対応できます。掲載実績の中にも、WordPressのテーマへ組み込んで公開まで行ったものがあります。「文章と写真は自分たちで差し替えたい」場合は、更新したい箇所だけを管理画面から編集できる形に設計します。',
  },
  {
    q: '公開したあと、自分たちで更新できますか。',
    a: 'どこを更新したいかによって、方法を変えています。お知らせやブログのように頻繁に増えるものはCMSで、年に数回の料金改定のような箇所は手順書＋こちらでの対応、という切り分けが現実的です。ご相談時に決めましょう。',
  },
  {
    q: '費用と期間の目安を知りたいです。',
    a: '各実績の詳細に「想定予算帯」と「ページ数」を載せています。近い規模の実績を見ていただくのが一番早い見当のつけ方です。正確な金額は、構成が決まった段階でお見積りします。',
  },
  {
    q: 'スマートフォンでの表示は含まれますか。',
    a: '含まれます。PC・タブレット・スマートフォンの3段階で作り、iPhone / iPad の実機表示まで確認したうえで納品しています。',
  },
]

/** 進め方（順序があるので番号を使う）＋ よくある質問 */
export function ProcessFaqSection({ onOpenContactForm }: ProcessFaqSectionProps) {
  const ref = useReveal<HTMLElement>()

  return (
    <section className="process" id="process" ref={ref}>
      <div className="process__inner">
        <div className="process__head reveal">
          <h2 className="process__title">相談から公開まで</h2>
          <p className="process__lead">
            {'いきなり見積書は出しません。まず「何を作るか」を一緒に固めるところからです。'}
          </p>
        </div>

        <ol className="process__steps">
          {STEPS.map((step, i) => (
            <li className="process__step reveal" key={step.n} data-reveal-delay={i * 90}>
              <span className="process__fig">{step.fig}</span>
              <span className="process__step-n">{step.n}</span>
              <div>
                <h3 className="process__step-title">{step.title}</h3>
                <p className="process__step-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="faq reveal">
          <h3 className="faq__title">よくある質問</h3>
          <dl className="faq__list">
            {FAQ.map((item) => (
              <div className="faq__item" key={item.q}>
                <dt className="faq__q">{item.q}</dt>
                <dd className="faq__a">{item.a}</dd>
              </div>
            ))}
          </dl>
          <p className="faq__more">
            ここに無いことは直接おたずねください。
            <button type="button" className="faq__link" onClick={onOpenContactForm}>
              相談フォームを開く
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}
