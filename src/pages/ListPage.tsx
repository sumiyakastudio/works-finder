import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { HeroSection } from '../components/sections/HeroSection'
import { CtaBand } from '../components/sections/CtaBand'
import { PitchSection } from '../components/sections/PitchSection'
import { StatsSection } from '../components/sections/StatsSection'
import { CapabilitiesSection } from '../components/sections/CapabilitiesSection'
import { ProcessFaqSection } from '../components/sections/ProcessFaqSection'
import { FilterBar, BAR_GROUP_KEYS } from '../components/filters/FilterBar'
import { FilterSheet } from '../components/filters/FilterSheet'
import type { ViewMode } from '../types/filter'
import { CompareBar } from '../components/compare/CompareBar'
import { ComparePanel } from '../components/compare/ComparePanel'

import { works as bundledWorks } from '../data/works'
import { ensureRemoteWorks, useWorks } from '../lib/worksSource'
import type { Work } from '../types/work'
import type {
  ExploreSerializableState,
  FilterGroupKey,
  FilterState,
  SortOrder,
} from '../types/filter'
import {
  clearCompareSelection,
  COMPARE_MIN_FOR_PANEL,
  getSelectedCompareWorks,
  isCompareAtLimit,
  isWorkSelectedForCompare,
  removeCompareSelection,
  shouldShowCompareBar,
  toggleCompareSelection,
} from '../lib/compare'
import type { CompareSelection } from '../lib/compare'
import {
  clearExploreFilters,
  clearExploreQuery,
  createExploreState,
  getDefaultExploreState,
  getExploreEmptyStateContent,
  getFilterOptions,
  getVisibleWorks,
  isDefaultExploreState,
  parseExploreState,
  serializeExploreState,
  sanitizeExploreStateForWorks,
  toggleFilterValue,
} from '../lib/works'
import {
  readStoredExploreState,
  writeStoredExploreState,
} from '../lib/exploreStorage'
import { getWorkImagePath } from '../lib/works'
import { getWorkNavigationConfig } from '../lib/detail'

// ---------------------------------------------------------------------------
// Initial state resolution
// ---------------------------------------------------------------------------

type ExploreInitSource = 'url' | 'storage' | 'default'

const parseExploreStateFromSearch = (search: string): ExploreSerializableState =>
  sanitizeExploreStateForWorks(parseExploreState(search), bundledWorks)

const resolveInitialExploreState = (): {
  state: ExploreSerializableState
  source: ExploreInitSource
} => {
  if (typeof window === 'undefined') {
    return { state: getDefaultExploreState(), source: 'default' }
  }
  const search = window.location.search
  if (search.length > 0 && search !== '?') {
    const fromUrl = parseExploreStateFromSearch(search)
    if (!isDefaultExploreState(fromUrl)) {
      return { state: fromUrl, source: 'url' }
    }
  }
  const stored = readStoredExploreState()
  if (stored !== null) {
    return { state: sanitizeExploreStateForWorks(stored, bundledWorks), source: 'storage' }
  }
  return { state: getDefaultExploreState(), source: 'default' }
}

const createEmptyFilterState = (): FilterState => ({
  selectedGenres: [],
  selectedSiteTypes: [],
  selectedPurposes: [],
  selectedFeatures: [],
  selectedBudgetRanges: [],
  selectedTechTags: [],
})

// ---------------------------------------------------------------------------
// View mode persistence
// ---------------------------------------------------------------------------

const VIEW_MODE_KEY = 'ads-view-mode'
function getInitialViewMode(): ViewMode {
  const stored = localStorage.getItem(VIEW_MODE_KEY)
  if (stored === 'grid' || stored === 'list' || stored === 'thumbnail') return stored
  return 'grid'
}

// ---------------------------------------------------------------------------
// Card stagger — アンカーのモーション人格（速い・小さい・ease-out-quart）
// ---------------------------------------------------------------------------

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i, 11) * 0.04,
      duration: 0.5,
      ease: [0.165, 0.84, 0.44, 1] as const,
    },
  }),
}

// ---------------------------------------------------------------------------
// ListPage
// ---------------------------------------------------------------------------

export function ListPage({ onOpenContactForm }: { onOpenContactForm: () => void }) {
  const navigate = useNavigate()
  // ポートフォリオ本体の最新データ（取得できなければ同梱データのまま）
  const works = useWorks()
  useEffect(() => {
    void ensureRemoteWorks()
  }, [])
  const [initialResolvedState] = useState(resolveInitialExploreState)
  const skipInitialStorageWriteRef = useRef(initialResolvedState.source === 'url')

  const [query, setQuery] = useState(initialResolvedState.state.query)
  const [selectedFilters, setSelectedFilters] = useState<FilterState>(() => ({
    selectedGenres: initialResolvedState.state.selectedGenres,
    selectedSiteTypes: initialResolvedState.state.selectedSiteTypes,
    selectedPurposes: initialResolvedState.state.selectedPurposes,
    selectedFeatures: initialResolvedState.state.selectedFeatures,
    selectedBudgetRanges: initialResolvedState.state.selectedBudgetRanges,
    selectedTechTags: initialResolvedState.state.selectedTechTags,
  }))
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialResolvedState.state.sortOrder)
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCompareMode, setIsCompareMode] = useState(false)

  // Compare state
  const [compareSlugs, setCompareSlugs] = useState<CompareSelection>([])
  const [isComparePanelOpen, setIsComparePanelOpen] = useState(false)
  const compareWorks = useMemo(
    () => getSelectedCompareWorks(compareSlugs, works),
    [compareSlugs, works],
  )

  // Derived explore state
  const serializableExploreState = useMemo(
    () => createExploreState(query, selectedFilters, sortOrder),
    [query, selectedFilters, sortOrder],
  )
  const visibleWorks = useMemo(
    () => getVisibleWorks(works, serializableExploreState),
    [serializableExploreState, works],
  )
  const serializedSearch = useMemo(
    () => serializeExploreState(serializableExploreState),
    [serializableExploreState],
  )
  const filterGroups = useMemo(() => getFilterOptions(works), [works])
  const emptyStateContent = useMemo(
    () => getExploreEmptyStateContent(serializableExploreState, works.length),
    [serializableExploreState, works],
  )

  const heroStats = useMemo(() => {
    const uniqueOf = (pick: (work: Work) => string) =>
      new Set(works.map(pick).filter((value) => value.length > 0)).size
    return [
      { value: works.length, label: '公開中の制作実績' },
      { value: uniqueOf((work) => work.genre), label: '業種ジャンル' },
      { value: uniqueOf((work) => work.siteType), label: 'サイト種別' },
      {
        value: works.reduce((sum, work) => sum + (work.pageCount ?? 0), 0),
        label: '制作ページ総数',
      },
    ]
  }, [works])

  // View mode persistence
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode)
  }, [viewMode])

  // SP シート表示中は背面スクロールを止める
  useEffect(() => {
    if (!isSheetOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isSheetOpen])

  // URL sync
  useEffect(() => {
    if (typeof window === 'undefined') return
    const currentSearch = window.location.search.startsWith('?')
      ? window.location.search.slice(1)
      : window.location.search
    if (currentSearch === serializedSearch) return
    const nextSearch = serializedSearch.length > 0 ? `?${serializedSearch}` : ''
    const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`
    window.history.replaceState(null, '', nextUrl)
  }, [serializedSearch])

  // Storage sync
  useEffect(() => {
    if (skipInitialStorageWriteRef.current) {
      skipInitialStorageWriteRef.current = false
      return
    }
    writeStoredExploreState(serializableExploreState)
  }, [serializableExploreState])

  // Popstate
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handlePopState = () => {
      const next = parseExploreStateFromSearch(window.location.search)
      setQuery(next.query)
      setSelectedFilters({
        selectedGenres: next.selectedGenres,
        selectedSiteTypes: next.selectedSiteTypes,
        selectedPurposes: next.selectedPurposes,
        selectedFeatures: next.selectedFeatures,
        selectedBudgetRanges: next.selectedBudgetRanges,
        selectedTechTags: next.selectedTechTags,
      })
      setSortOrder(next.sortOrder)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Handlers
  const handleSearchChange = (value: string) => setQuery(value)
  const handleToggleFilter = (groupKey: FilterGroupKey, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [groupKey]: toggleFilterValue(prev[groupKey], value),
    }))
  }
  const handleClearFilters = () => {
    const cleared = clearExploreFilters(serializableExploreState)
    setSelectedFilters({
      selectedGenres: cleared.selectedGenres,
      selectedSiteTypes: cleared.selectedSiteTypes,
      selectedPurposes: cleared.selectedPurposes,
      selectedFeatures: cleared.selectedFeatures,
      selectedBudgetRanges: cleared.selectedBudgetRanges,
      selectedTechTags: cleared.selectedTechTags,
    })
  }
  const handleClearAll = () => {
    handleClearFilters()
    setQuery(clearExploreQuery(serializableExploreState).query)
  }
  const handleSortChange = (next: SortOrder) => setSortOrder(next)

  const handleToggleCompare = useCallback((slug: string) => {
    setCompareSlugs((prev) => toggleCompareSelection(prev, slug))
  }, [])
  const handleRemoveFromCompare = useCallback((slug: string) => {
    setCompareSlugs((prev) => {
      const next = removeCompareSelection(prev, slug)
      if (next.length < COMPARE_MIN_FOR_PANEL) setIsComparePanelOpen(false)
      return next
    })
  }, [])
  const handleClearCompare = useCallback(() => {
    setCompareSlugs(clearCompareSelection())
    setIsComparePanelOpen(false)
  }, [])

  const handleOpenDetail = (slug: string) => {
    navigate(`/works-finder/${slug}`)
  }

  const scrollToFinder = () => {
    document.getElementById('finder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  /** 「つくるもの」から該当のサイト種別だけに絞り込む */
  const handleApplySiteType = (siteType: string) => {
    setQuery('')
    setSelectedFilters((prev) => ({ ...prev, selectedSiteTypes: [siteType] }))
    scrollToFinder()
  }
  /** グラフの棒からジャンルで絞り込む */
  const handleApplyGenre = (genre: string) => {
    setQuery('')
    setSelectedFilters((prev) => ({ ...prev, selectedGenres: [genre] }))
    scrollToFinder()
  }
  /** 「機能」「技術」からキーワード検索する */
  const handleApplyQuery = (keyword: string) => {
    setSelectedFilters(createEmptyFilterState)
    setQuery(keyword)
    scrollToFinder()
  }

  const appliedFilterCount = BAR_GROUP_KEYS.reduce(
    (sum, key) => sum + selectedFilters[key].length,
    0,
  )
  const appliedChips = BAR_GROUP_KEYS.flatMap((key) =>
    selectedFilters[key].map((value) => ({ key, value })),
  )
  const hasAnyCondition = appliedChips.length > 0 || query.trim().length > 0

  return (
    <>
      <HeroSection stats={heroStats} works={works} onOpenContactForm={onOpenContactForm} />

      <div className="finder" id="finder">
        <div className="finder__bar-wrap">
          <FilterBar
            filterGroups={filterGroups}
            selectedFilters={selectedFilters}
            query={query}
            sortOrder={sortOrder}
            viewMode={viewMode}
            isCompareMode={isCompareMode}
            appliedFilterCount={appliedFilterCount}
            onFilterToggle={handleToggleFilter}
            onQueryChange={handleSearchChange}
            onSortChange={handleSortChange}
            onViewModeChange={setViewMode}
            onToggleCompareMode={() => setIsCompareMode((prev) => !prev)}
            onOpenSheet={() => setIsSheetOpen(true)}
          />

          {hasAnyCondition && (
            <div className="finder__applied">
              {query.trim().length > 0 && (
                <span className="applied-chip">
                  「{query}」
                  <button
                    type="button"
                    className="applied-chip__x"
                    aria-label="キーワードを解除"
                    onClick={() => setQuery('')}
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              )}
              {appliedChips.map((chip) => (
                <span className="applied-chip" key={`${chip.key}-${chip.value}`}>
                  {chip.value}
                  <button
                    type="button"
                    className="applied-chip__x"
                    aria-label={`${chip.value} を解除`}
                    onClick={() => handleToggleFilter(chip.key, chip.value)}
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ))}
              <button type="button" className="applied-clear" onClick={handleClearAll}>
                すべて解除
              </button>
            </div>
          )}
        </div>

        <div className="finder__results-head">
          <p className="finder__count" aria-live="polite">
            <strong>{visibleWorks.length}</strong> 件
            {visibleWorks.length !== works.length && ` / 全${works.length}件`}
          </p>
          <p className="finder__summary">
            {hasAnyCondition ? '条件で絞り込み中' : 'すべての制作実績'}
          </p>
        </div>

        {visibleWorks.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">
              {emptyStateContent?.title ?? '条件に合う作品がありません'}
            </p>
            <p className="empty-state__desc">
              {emptyStateContent?.description ?? '条件を緩めてお試しください'}
            </p>
            {emptyStateContent && (
              <button
                type="button"
                className="empty-state__btn"
                onClick={() => {
                  if (emptyStateContent.actionKind === 'clear-search') {
                    const cleared = clearExploreQuery(serializableExploreState)
                    setQuery(cleared.query)
                  } else {
                    handleClearFilters()
                  }
                }}
              >
                {emptyStateContent.actionLabel}
              </button>
            )}
          </div>
        ) : (
          <div className={`works-view works-view--${viewMode}`}>
            {visibleWorks.map((work, i) => (
              <WorkCardItem
                key={work.slug}
                work={work}
                index={i}
                viewMode={viewMode}
                isCompareMode={isCompareMode}
                isCompared={isWorkSelectedForCompare(compareSlugs, work.slug)}
                isCompareDisabled={isCompareAtLimit(compareSlugs)}
                onOpenDetail={() => handleOpenDetail(work.slug)}
                onToggleCompare={() => handleToggleCompare(work.slug)}
              />
            ))}
          </div>
        )}
      </div>

      <PitchSection />

      <StatsSection works={works} onApplyGenre={handleApplyGenre} />

      <CapabilitiesSection
        works={works}
        onApplySiteType={handleApplySiteType}
        onApplyQuery={handleApplyQuery}
      />

      <ProcessFaqSection onOpenContactForm={onOpenContactForm} />

      <CtaBand onOpenContactForm={onOpenContactForm} />

      {/* SP フィルタシート */}
      {isSheetOpen && (
        <FilterSheet
          filterGroups={filterGroups}
          selectedFilters={selectedFilters}
          visibleCount={visibleWorks.length}
          appliedFilterCount={appliedFilterCount}
          onFilterToggle={handleToggleFilter}
          onClearFilters={handleClearFilters}
          onClose={() => setIsSheetOpen(false)}
        />
      )}

      {/* Compare bar & panel */}
      {shouldShowCompareBar(compareSlugs) && (
        <CompareBar
          works={compareWorks}
          onRemove={handleRemoveFromCompare}
          onClearAll={handleClearCompare}
          onOpenPanel={() => setIsComparePanelOpen(true)}
        />
      )}
      {isComparePanelOpen && (
        <ComparePanel
          works={compareWorks}
          onClose={() => setIsComparePanelOpen(false)}
          onRemove={handleRemoveFromCompare}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Card item — viewMode ごとに描き分ける
// ---------------------------------------------------------------------------

function WorkCardItem({
  work,
  index,
  viewMode,
  isCompareMode,
  isCompared,
  isCompareDisabled,
  onOpenDetail,
  onToggleCompare,
}: {
  work: Work
  index: number
  viewMode: ViewMode
  isCompareMode: boolean
  isCompared: boolean
  isCompareDisabled: boolean
  onOpenDetail: () => void
  onToggleCompare: () => void
}) {
  const navConfig = getWorkNavigationConfig(work)
  // カードは FV ショット（16:9）を使う。フルページ画像は詳細側の役割。
  const imgSrc = getWorkImagePath(work)

  if (viewMode === 'thumbnail') {
    return (
      <motion.div
        className="thumb-card"
        custom={index}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        onClick={onOpenDetail}
        role="button"
        tabIndex={0}
        aria-label={`${work.title} の詳細を見る`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpenDetail()
          }
        }}
      >
        <img src={imgSrc} alt={work.title} loading="lazy" decoding="async" className="thumb-card__img" />
        {isCompareMode && (
          <label className="thumb-card__compare" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isCompared}
              disabled={isCompareDisabled && !isCompared}
              onChange={onToggleCompare}
              aria-label={`${work.title} を比較に追加`}
            />
          </label>
        )}
      </motion.div>
    )
  }

  if (viewMode === 'list') {
    return (
      <motion.article
        className="list-card"
        custom={index}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        onClick={onOpenDetail}
        role="button"
        tabIndex={0}
        aria-label={`${work.title} の詳細を見る`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpenDetail()
          }
        }}
      >
        <div className="list-card__thumb">
          <img src={imgSrc} alt={work.title} loading="lazy" decoding="async" />
        </div>
        <div className="list-card__body">
          <h3 className="list-card__title">{work.title}</h3>
          <p className="list-card__meta">
            {work.genre} / {work.siteType} / {work.purpose}
          </p>
          <p className="list-card__summary">{work.summary}</p>
          <div className="list-card__tags">
            {work.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="list-card__tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="list-card__right">
          <span className="list-card__price">{work.budgetRange ?? '要見積'}</span>
          {isCompareMode && (
            <label className="list-card__compare" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isCompared}
                disabled={isCompareDisabled && !isCompared}
                onChange={onToggleCompare}
                aria-label={`${work.title} を比較に追加`}
              />
              比較
            </label>
          )}
        </div>
      </motion.article>
    )
  }

  // グリッド（既定）— サムネ + タイトル + メタ + タグ（Awwwards のカードメタ設計）
  return (
    <motion.article
      className="grid-card"
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      onClick={onOpenDetail}
      role="button"
      tabIndex={0}
      aria-label={`${work.title} の詳細を見る`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenDetail()
        }
      }}
    >
      <div className="grid-card__media">
        <img src={imgSrc} alt={work.title} loading="lazy" decoding="async" className="grid-card__img" />
        {navConfig.showCaseStudyBadge && <span className="grid-card__badge">Case Study</span>}
        {isCompareMode && (
          <label className="grid-card__compare" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isCompared}
              disabled={isCompareDisabled && !isCompared}
              onChange={onToggleCompare}
              aria-label={`${work.title} を比較に追加`}
            />
          </label>
        )}
      </div>
      <div className="grid-card__body">
        <div className="grid-card__head">
          <h3 className="grid-card__title">{work.title}</h3>
        </div>
        <p className="grid-card__meta">
          {work.genre}
          <span className="grid-card__meta-sep">/</span>
          {work.siteType}
          <span className="grid-card__meta-sep">/</span>
          {work.pageCount != null ? `${work.pageCount}P` : '—'}
        </p>
        <div className="grid-card__tags">
          {work.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="grid-card__tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}
