import { useReveal } from '../../hooks/useReveal'

/**
 * 課題提起 → このツールがどう答えるか。
 * 均等3カラムを避け、1つ目を広く取った非対称の組みにしている。
 */
export function PitchSection() {
  const ref = useReveal<HTMLElement>()

  return (
    <section className="pitch" id="about" ref={ref}>
      <div className="pitch__inner">
        <div className="pitch__head reveal">
          <h2 className="pitch__title">
            「実績は見た。
            <br />
            で、うちの場合は？」
          </h2>
          <p className="pitch__lead">
            {'制作会社のサイトに並ぶ実績は、たいてい"きれいな絵"で終わります。業種が違う、ページ数が違う、必要な機能が違う——結局、自分の案件に置き換えられない。このツールは、その置き換え作業をこちら側でやっておくための道具です。'}
          </p>
        </div>

        <div className="pitch__grid reveal" data-reveal-delay="80">
          <article className="pitch__item pitch__item--wide">
            <h3 className="pitch__item-title">条件で絞ると、話が早い</h3>
            <p className="pitch__item-body">
              {'業種・サイトの形・目的・使った技術の4軸で絞り込めます。「美容クリニックで、予約につなげたい」「BtoBで、資料請求まで持っていきたい」——その条件に近い実物だけが残るので、打ち合わせの前に方向性の合意が取れます。'}
            </p>
          </article>

          <article className="pitch__item">
            <h3 className="pitch__item-title">中身まで書いてあります</h3>
            <p className="pitch__item-body">
              {'各実績に、ページ数・実装した機能・使用技術・想定予算帯・設計で悩んだ点まで載せています。見た目の好みだけでなく、規模感と工数の当たりがつきます。'}
            </p>
          </article>

          <article className="pitch__item">
            <h3 className="pitch__item-title">3件まで並べて比べられます</h3>
            <p className="pitch__item-body">
              {'「この構成とこの構成、何が違うのか」を仕様の行で突き合わせられます。社内で共有するときは、絞り込んだ状態のURLをそのまま送ってください。同じ画面が開きます。'}
            </p>
          </article>

          <article className="pitch__item pitch__item--note">
            <h3 className="pitch__item-title">この画面自体も制作物です</h3>
            <p className="pitch__item-body">
              {'いま見ているこの検索ツールは、React + TypeScript で組んだ一点物です。「サイト」ではなく「業務で使う画面」が必要な場合も、同じように設計から作れます。'}
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
