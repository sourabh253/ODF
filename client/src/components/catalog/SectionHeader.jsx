import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SectionHeader = ({ eyebrow, title, subtitle, actionLabel, actionTo }) => (
  <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-bold text-secondary sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-slate-500 sm:text-base">{subtitle}</p>}
    </div>
    {actionLabel && actionTo && (
      <Link
        to={actionTo}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
      >
        {actionLabel}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
);

export default SectionHeader;
