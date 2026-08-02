import type { Work } from '../types/work'

/**
 * ポートフォリオ本体（sumiyaka-portfolio）から制作実績を取得する。
 *
 * 目的: ポートフォリオに作品を1件足したら、この Finder も自動で最新になること。
 * 取得できなければ同梱データ（src/data/works.ts）にそのままフォールバックするので、
 * API が落ちていても Finder は必ず動く。
 */

const ENDPOINT = 'https://sumiyaka-portfolio.vercel.app/api/works'
const TIMEOUT_MS = 4000

interface RemoteWork {
  slug: string
  id: string | null
  title: string
  card: string
  full: string
  genre: string
  siteType: string
  purpose: string
  tags: string[]
  summary: string
  challenge: string | null
  designTone: string | null
  features: string[]
  techTags: string[]
  techStack: string[]
  pageCount: number | null
  scale: string | null
  budgetRange: string | null
  durationRange: string | null
  year: number | null
  isFeatured: boolean
  hasCms: boolean
  hasAnimation: boolean
  hasForm: boolean
  siteUrl: string | null
  detailUrl: string | null
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(isNonEmptyString) : []

/** 最低限の形をしているかだけ検証する（欠けている作品は捨てる） */
const toWork = (raw: unknown): Work | null => {
  if (raw === null || typeof raw !== 'object') return null
  const item = raw as Partial<RemoteWork>

  if (
    !isNonEmptyString(item.slug) ||
    !isNonEmptyString(item.title) ||
    !isNonEmptyString(item.card) ||
    !isNonEmptyString(item.genre) ||
    !isNonEmptyString(item.siteType) ||
    !isNonEmptyString(item.summary)
  ) {
    return null
  }

  return {
    id: item.id ?? undefined,
    slug: item.slug,
    title: item.title,
    thumbnail: item.card,
    thumbnailFallback: item.card,
    fullPageScreenshot: isNonEmptyString(item.full) ? item.full : null,
    genre: item.genre,
    siteType: item.siteType,
    purpose: isNonEmptyString(item.purpose) ? item.purpose : '—',
    tags: asStringArray(item.tags),
    summary: item.summary,
    challenge: item.challenge ?? undefined,
    designTone: item.designTone ?? undefined,
    features: asStringArray(item.features),
    techTags: asStringArray(item.techTags),
    techStack: asStringArray(item.techStack),
    pageCount: typeof item.pageCount === 'number' ? item.pageCount : undefined,
    scale: item.scale ?? null,
    budgetRange: item.budgetRange ?? null,
    durationRange: item.durationRange ?? null,
    year: typeof item.year === 'number' ? item.year : undefined,
    isFeatured: item.isFeatured === true,
    hasCms: item.hasCms === true,
    hasAnimation: item.hasAnimation === true,
    hasForm: item.hasForm === true,
    detailUrl: item.detailUrl ?? null,
    siteUrl: item.siteUrl ?? null,
  }
}

/**
 * 取得に成功したら Work[] を、失敗・不正・件数不足なら null を返す。
 * null のときは呼び出し側が同梱データを使い続ける。
 */
export const fetchRemoteWorks = async (): Promise<Work[] | null> => {
  if (typeof fetch !== 'function') return null

  const controller = new AbortController()
  const timer = setTimeout(() => { controller.abort() }, TIMEOUT_MS)

  try {
    const response = await fetch(ENDPOINT, {
      signal: controller.signal,
      // 読み取りのみ。Cookie 等は一切送らない
      credentials: 'omit',
      mode: 'cors',
    })
    if (!response.ok) return null

    const json: unknown = await response.json()
    if (json === null || typeof json !== 'object') return null

    const list = (json as { works?: unknown }).works
    if (!Array.isArray(list)) return null

    const works = list.map(toWork).filter((work): work is Work => work !== null)

    // 同梱データより明らかに少ない場合は壊れているとみなして採用しない
    return works.length >= 1 ? works : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
