import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import Loader from './Loader'

/*
 * columns: [{ key, header, render?(row), className?, align? }]
 * Client-side pagination (pageSize rows per page).
 */
export default function DataTable({
  columns,
  rows = [],
  loading = false,
  rowKey = 'id',
  onRowClick,
  pageSize = 10,
  emptyTitle = 'Nothing here yet',
  emptyText = 'Records will appear here.',
}) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))

  useEffect(() => {
    setPage(1)
  }, [rows.length])

  const start = (page - 1) * pageSize
  const visible = rows.slice(start, start + pageSize)

  if (loading) return <Loader />

  if (rows.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="mx-auto w-12 h-12 rounded-[14px] bg-[#f3f1e9] text-[#a0aaa3] flex items-center justify-center">
          <Inbox size={20} />
        </div>
        <p className="text-sm font-bold text-[#536059] mt-4">{emptyTitle}</p>
        <p className="text-xs text-[#9aa39d] mt-1">{emptyText}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/[0.05]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 sm:px-6 py-3 text-[11px] font-semibold text-[#929c95] whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-black/[0.045]">
            {visible.map((row, i) => (
              <tr
                key={row[rowKey] ?? i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`${
                  onRowClick ? 'cursor-pointer' : ''
                } hover:bg-[#f3f1e9]/50 transition-colors`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 sm:px-6 py-4 text-xs text-[#24312b] ${
                      col.align === 'right' ? 'text-right' : ''
                    } ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > pageSize && (
        <div className="px-5 sm:px-6 py-3.5 flex items-center justify-between border-t border-black/[0.05]">
          <p className="text-[11px] text-[#8b958e]">
            {start + 1}–{Math.min(start + pageSize, rows.length)} of {rows.length}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 rounded-[10px] bg-[#f3f1e9] text-[#536059] flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="text-[11px] text-[#536059] px-2">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              aria-label="Next page"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 rounded-[10px] bg-[#f3f1e9] text-[#536059] flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
