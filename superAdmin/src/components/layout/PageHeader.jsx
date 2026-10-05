import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function PageHeader({ title, description, backTo, backLabel = 'Back', actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        {backTo && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#39725a] hover:text-[#21483a] mb-3"
          >
            <ChevronLeft size={13} />
            {backLabel}
          </Link>
        )}

        <h1 className="font-display text-3xl font-bold tracking-tight text-[#24312b]">
          {title}
        </h1>

        {description && (
          <p className="text-[13px] text-[#8b958e] mt-1.5 max-w-xl leading-6">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
