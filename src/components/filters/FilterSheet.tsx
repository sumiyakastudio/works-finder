import type { FilterGroup, FilterGroupKey, FilterState } from '../../types/filter'
import { BAR_GROUP_KEYS } from './FilterBar'

interface FilterSheetProps {
  filterGroups: FilterGroup[]
  selectedFilters: FilterState
  visibleCount: number
  appliedFilterCount: number
  onFilterToggle: (groupKey: FilterGroupKey, value: string) => void
  onClearFilters: () => void
  onClose: () => void
}

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 6.2L4.8 8.5L9.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** SP 用のボトムシート。上部バーと同じ4軸を縦に並べる。 */
export function FilterSheet({
  filterGroups,
  selectedFilters,
  visibleCount,
  appliedFilterCount,
  onFilterToggle,
  onClearFilters,
  onClose,
}: FilterSheetProps) {
  const groups = BAR_GROUP_KEYS.map((key) => filterGroups.find((group) => group.key === key)).filter(
    (group): group is FilterGroup => group != null,
  )

  return (
    <div
      className="sheet-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="絞り込み"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="sheet">
        <div className="sheet__header">
          <p className="sheet__title">絞り込み</p>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="閉じる">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="sheet__body">
          {groups.map((group) => (
            <div className="sheet__group" key={group.key}>
              <p className="sheet__group-title">{group.title}</p>
              {group.options.map((option) => {
                const isChecked = selectedFilters[group.key].includes(option.label)
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
          ))}
        </div>

        <div className="sheet__footer">
          {appliedFilterCount > 0 && (
            <button type="button" className="ghost-button" onClick={onClearFilters}>
              クリア
            </button>
          )}
          <button type="button" className="primary-button" onClick={onClose}>
            {visibleCount}件を見る
          </button>
        </div>
      </div>
    </div>
  )
}
