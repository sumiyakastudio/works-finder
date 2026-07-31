import { useEffect, useRef } from 'react'

/**
 * IntersectionObserver で、範囲内の `.reveal` に `.is-visible` を付ける。
 *
 * モーションの人格はアンカー（Linear）に合わせて「速い・小さい・一度だけ」。
 * スクロールライブラリは使わない（アンカーも使っていない）。
 */
export const useReveal = <T extends HTMLElement>() => {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (root === null) return

    const targets = root.querySelectorAll<HTMLElement>('.reveal')
    if (targets.length === 0) return

    // IO 非対応環境では最初から見せる（消えたままにしない）
    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          const delay = Number(el.dataset.revealDelay ?? '0')
          if (delay > 0) {
            el.style.transitionDelay = `${delay}ms`
          }
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )

    targets.forEach((el) => observer.observe(el))
    return () => { observer.disconnect() }
  }, [])

  return ref
}

/**
 * 数値のカウントアップ。要素が見えたら 0 → 目標値へ。
 * 桁の増減でレイアウトが揺れないよう、呼び出し側で tabular-nums を当てておくこと。
 */
export const useCountUp = (value: number, durationMs = 900) => {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el === null) return

    let frame = 0
    let started = false

    const run = () => {
      const startedAt = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - startedAt) / durationMs)
        // ease-out-quart（アンカーのイージング）
        const eased = 1 - Math.pow(1 - t, 4)
        el.textContent = String(Math.round(value * eased))
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }

    if (typeof IntersectionObserver === 'undefined') {
      el.textContent = String(value)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true
            run()
            observer.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, durationMs])

  return ref
}
