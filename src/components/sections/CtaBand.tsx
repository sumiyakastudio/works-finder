interface CtaBandProps {
  onOpenContactForm: () => void
}

/** 相談CTA帯。サイト内で唯一、差し色（インディゴのグロー）を使う面。 */
export function CtaBand({ onOpenContactForm }: CtaBandProps) {
  return (
    <section className="cta-band" id="contact">
      <div className="cta-band__inner">
        <div>
          <h2 className="cta-band__title">近い実績は、ありましたか。</h2>
          <p className="cta-band__lead">
            {'気になった実績のURLをそのまま送っていただければ、同じ規模・同じ作りで進めた場合の構成と概算をお返しします。まだ要件が固まっていない段階のご相談でも構いません。'}
          </p>
        </div>
        <div className="cta-band__actions">
          <button type="button" className="primary-button" onClick={onOpenContactForm}>
            制作について相談する
          </button>
          <a
            className="ghost-button"
            href="https://sumiyaka-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ポートフォリオを見る
          </a>
        </div>
      </div>
    </section>
  )
}
