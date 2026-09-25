import { Minus, Plus, Star, Timer } from 'lucide-react';
import { getServiceImage } from '../../data/serviceImages';

const ServiceCard = ({
  service,
  mainCategory,
  onAdd,
  inCart = false,
  quantity = 0,
  onIncrement,
  onDecrement,
  compact = false,
}) => {
  const image = getServiceImage(service);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        inCart ? 'border-primary ring-1 ring-primary/20' : 'border-slate-200'
      }`}
    >
      <div className={`relative overflow-hidden bg-slate-100 ${compact ? 'h-28' : 'h-36'}`}>
        <img
          src={image}
          alt={service.serviceName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/45 to-transparent" />
        {mainCategory && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
            {mainCategory}
          </span>
        )}
        {service.isQuotationOnly && (
          <span className="absolute right-2 top-2 rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Quote
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-sm font-semibold text-secondary leading-snug line-clamp-2">
          {service.serviceName}
        </h3>
        {service.category && (
          <p className="mt-0.5 text-xs text-slate-400 truncate">{service.category}</p>
        )}

        <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
          {typeof service.rating === 'number' && service.rating > 0 && (
            <span className="flex items-center gap-1 font-semibold text-secondary">
              <Star className="w-3.5 h-3.5 fill-warning text-warning" /> {service.rating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-slate-400" /> Same-day slot
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            {service.isQuotationOnly ? (
              <span className="text-sm font-bold text-warning">On request</span>
            ) : (
              <>
                <span className="text-lg font-bold text-primary">₹{service.price}</span>
                <span className="ml-1 text-xs text-slate-400">/ {service.unit}</span>
              </>
            )}
          </div>

          {inCart ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label={`Decrease ${service.serviceName} quantity`}
                onClick={onDecrement}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-secondary">{quantity}</span>
              <button
                type="button"
                aria-label={`Increase ${service.serviceName} quantity`}
                onClick={onIncrement}
                className="w-8 h-8 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="btn-primary py-1.5 px-3 text-xs"
              aria-label={`Add ${service.serviceName} to cart`}
            >
              <span className="flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
