import type { StatusFilter } from '../types.ts'

const FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'partial', label: 'Partially paid' },
  { id: 'paid', label: 'Paid' },
  { id: 'expired', label: 'Expired' },
]

type StatusFilterProps = {
  value: StatusFilter
  counts: Record<StatusFilter, number>
  onChange: (value: StatusFilter) => void
}

export function StatusFilter({ value, counts, onChange }: StatusFilterProps) {
  return (
    <div className="filters" role="group" aria-label="Filter by status">
      {FILTERS.map((filter) => {
        const selected = value === filter.id
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
            <span className="count" aria-hidden="true">
              {counts[filter.id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
