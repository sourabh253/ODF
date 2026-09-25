import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMainCategoryImage } from '../../data/serviceImages';

const CategoryTile = ({ name, to, description }) => (
  <Link
    to={to}
    className="group relative block h-40 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
  >
    <img
      src={getMainCategoryImage(name)}
      alt={name}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-secondary/25 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 p-4">
      <h3 className="text-sm font-bold text-white sm:text-base">{name}</h3>
      {description && <p className="mt-0.5 text-xs text-slate-200/90">{description}</p>}
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Browse <ArrowRight className="w-3 h-3" />
      </span>
    </div>
  </Link>
);

export default CategoryTile;
