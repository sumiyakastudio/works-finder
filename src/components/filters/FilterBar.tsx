import { useEffect, useRef, useState } from 'react'

import { SORT_OPTIONS } from '../../types/filter'
import type { FilterGroup, FilterGroupKey, FilterState, SortOrder } from '../../types/filter'
import type { ViewMode } from '../../types/filter'

/** 上部バーに出す絞り込み軸（Awwwards 型の多軸ドロップダウン） */
export const BAR_GROUP_KEYS: FilterGroupKey[] = [
  'selectedGenres',
  'selectedSiteTypes',
  'selectedPurposes',
  'selectedTechTags',
]

interface FilterBarProps {
  filterGroups: FilterGroup[]
  selectedFilters: FilterState
  query: string
  sortOrder: SortOrder
  viewMode: ViewMode
  isCompareMode: boolean
  appliedFilterCount: number
  onFilterToggle: (groupKey: FilterGroupKey, value: string) => void
  onQueryChange: (value: string) => void
  onSortChange: (sortOrder: SortOrder) => void
  onViewModeChange: (mode: ViewMode) => void
  onToggleCompareMode: () => void
  onOpenSheet: () => void
}

const CaretIcon = () => (
  <svg className="axis__caret" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6.5L8 10.5L12 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 6.2L4.8 8.5L9.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function FilterBar({
  filterGroups,
  selectedFilters,
  query,
  sortOrder,
  viewMode,
  isCompareMode,
  appliedFilterCount,
  onFilterToggle,
  onQueryChange,
  onSortChange,
  onViewModeChange,
  onToggleCompareMode,
  onOpenSheet,
}: FilterBarProps) {
  const [openKey, setOpenKey] = useState<FilterGroupKey | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // 外側クリック / Esc で閉じる
  useEffect(() => {
    if (openKey === null) return

    const handlePointerDown = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setOpenKey(null)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenKey(null)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openKey])

  const barGroups = BAR_GROUP_KEYS.map((key) => filterGroups.find((group) => group.key === key)).filter(
    (group): group is FilterGroup => group != null,
  )

  return (
    <div className="filterbar" ref={barRef}>
      {/* SP: シート起動 */}
      <button
        type="button"
        className={`filterbar__sp-filter${appliedFilterCount > 0 ? ' filterbar__sp-filter--active' : ''}`}
        onClick={onOpenSheet}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16M4 12h10M4 18h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        絞り込み
        {appliedFilterCount > 0 && <span className="axis__count">{appliedFilterCount}</span>}
      </button>

      {/* PC: 軸ドロップダウン */}
      <div className="filterbar__axes">
        {barGroups.map((group) => {
          const selected = selectedFilters[group.key]
          const isOpen = openKey === group.key
          const triggerClass = [
            'axis__trigger',
            isOpen ? 'axis__trigger--open' : '',
            selected.length > 0 ? 'axis__trigger--active' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div className="axis" key={group.key}>
              <button
                type="button"
                className={triggerClass}
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => setOpenKey(isOpen ? null : group.key)}
              >
                {group.title}
                {selected.length > 0 && <span className="axis__count">{selected.length}</span>}
                <CaretIcon />
              </button>

              {isOpen && (
                <div className="axis__panel" role="group" aria-label={group.title}>
                  {group.options.map((option) => {
                    const isChecked = selected.includes(option.label)
                    return (
                      <button
                        type="button"
                        key={option.label}
                        className={`axis__option${isChecked ? ' axis__option--checked' : ''}`}
                        aria-pressed={isChecked}
                        onClick={() => onFilterToggle(group.key, option.label)}
                      >
                        <span className="axis__box">{isChecked && <CheckIcon />}</span>
                        <span className="axis__label">{option.label}</span>
                        <span className="axis__n">{option.count}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="filterbar__spacer" />

      <div className="filterbar__search">
        <svg className="filterbar__search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          className="filterbar__search-input"
          placeholder="キーワードで探す"
          value={query}
          aria-label="キーワードで探す"
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query.length > 0 && (
          <button
            type="button"
            className="filterbar__search-clear"
            aria-label="検索キーワードを消す"
            onClick={() => onQueryChange('')}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="filterbar__tools">
        <select
          className="filterbar__sort"
          value={sortOrder}
          aria-label="並び替え"
          onChange={(event) => onSortChange(event.target.value as SortOrder)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="filterbar__view" role="group" aria-label="表示切替">
          <button
            type="button"
            className={`filterbar__view-btn${viewMode === 'grid' ? ' filterbar__view-btn--active' : ''}`}
            aria-pressed={viewMode === 'grid'}
            aria-label="カード表示"
            title="カード表示"
            onClick={() => onViewModeChange('grid')}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
              <rect x="9.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1" y="9.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
              <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
          <button
            type="button"
            className={`filterbar__view-btn${viewMode === 'list' ? ' filterbar__view-btn--active' : ''}`}
            aria-pressed={viewMode === 'list'}
            aria-label="リスト表示"
            title="リスト表示"
            onClick={() => onViewModeChange('list')}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="2.5" width="14" height="2.6" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1" y="6.7" width="14" height="2.6" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1" y="10.9" width="14" height="2.6" rx="1" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
          <button
            type="button"
            className={`filterbar__view-btn${viewMode === 'thumbnail' ? ' filterbar__view-btn--active' : ''}`}
            aria-pressed={viewMode === 'thumbnail'}
            aria-label="サムネイルのみ"
            title="サムネイルのみ"
            onClick={() => onViewModeChange('thumbnail')}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="3.6" height="3.6" rx="0.8" stroke="currentColor" strokeWidth="1.2" />
              <rect x="6.2" y="1" width="3.6" height="3.6" rx="0.8" stroke="currentColor" strokeWidth="1.2" />
              <rect x="11.4" y="1" width="3.6" height="3.6" rx="0.8" stroke="currentColor" strokeWidth="1.2" />
              <rect x="1" y="6.2" width="3.6" height="3.6" rx="0.8" stroke="currentColor" strokeWidth="1.2" />
              <rect x="6.2" y="6.2" width="3.6" height="3.6" rx="0.8" stroke="currentColor" strokeWidth="1.2" />
              <rect x="11.4" y="6.2" width="3.6" height="3.6" rx="0.8" stroke="currentColor" strokeWidth="1.2" />
              <rect x="1" y="11.4" width="3.6" height="3.6" rx="0.8" stroke="currentColor" strokeWidth="1.2" />
              <rect x="6.2" y="11.4" width="3.6" height="3.6" rx="0.8" stroke="currentColor" strokeWidth="1.2" />
              <rect x="11.4" y="11.4" width="3.6" height="3.6" rx="0.8" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          className={`filterbar__toggle${isCompareMode ? ' filterbar__toggle--active' : ''}`}
          aria-pressed={isCompareMode}
          onClick={onToggleCompareMode}
        >
          比較
        </button>
      </div>
    </div>
  )
}
