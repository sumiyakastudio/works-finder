import { useSyncExternalStore } from 'react'

import { works as bundledWorks } from '../data/works'
import { fetchRemoteWorks } from './remoteWorks'
import type { Work } from '../types/work'

/**
 * 表示に使う作品リストの供給元。
 *
 *   1. 初期値 = 同梱データ（src/data/works.ts）→ 何があっても即座に表示できる
 *   2. 起動後にポートフォリオ本体の API を1回だけ取りに行き、成功したら差し替える
 *
 * これで「ポートフォリオに作品を追加 → この Finder も自動で最新」になる。
 * 取得に失敗した場合は同梱データのまま動き続ける（表示が壊れない）。
 */

let current: Work[] = bundledWorks
let settled = false
let inflight: Promise<void> | null = null
const listeners = new Set<() => void>()

const emit = () => {
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => current

/** 同梱データ。URL 復元時のサニタイズなど「初期値が要る場面」で使う。 */
export const getBundledWorks = (): Work[] => bundledWorks

/** リモート取得が完了（成功・失敗どちらでも）したか */
export const isWorksSettled = (): boolean => settled

/** 1回だけリモート取得する。多重呼び出ししても実際のリクエストは1回。 */
export const ensureRemoteWorks = (): Promise<void> => {
  if (inflight !== null) return inflight

  inflight = fetchRemoteWorks()
    .then((remote) => {
      if (remote !== null && remote.length > 0) {
        current = remote
      }
    })
    .catch(() => {
      /* 同梱データのまま続行 */
    })
    .finally(() => {
      settled = true
      emit()
    })

  return inflight
}

/** 現在の作品リストを購読する。 */
export const useWorks = (): Work[] =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

/** 「リモート取得が終わったか」を購読する。 */
export const useWorksSettled = (): boolean =>
  useSyncExternalStore(subscribe, isWorksSettled, isWorksSettled)
