import { BadgeCheck, Clock3, IndianRupee, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import LocationSelector from '../common/LocationSelector';
import { HERO_IMAGES } from '../../data/serviceImages';
import { mainCategoryLink } from '../../utils/catalogLinks';

const HeroSection = ({ stats, mainCategories = [] }) => (
  <section className="relative overflow-hidden border-b border-slate-200 bg-surface">
    <div className="pointer-events-none absolute -top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-52 -left-40 h-[26rem] w-[26rem] rounded-full bg-primary/5 blur-3xl" />

    <div className="container-custom relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
          <ShieldCheck className="w-3.5 h-3.5" /> Verified workers, transparent pricing
        </span>

        <h1 className="mt-5 text-4xl font-black leading-[1.1] text-secondary sm:text-5xl lg:text-[3.4rem]">
          Home services,
          <br />
          <span className="text-primary">delivered on demand.</span>
        </h1>

        <p className="mt-4 max-w-lg text-base text-slate-600 sm:text-lg">
          Book vetted professionals for cleaning, repairs, salon and spa — compare real prices,
          add what you need to the cart, and hire in minutes.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
          </span>
          <LocationSelector />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {mainCategories.slice(0, 5).map((name) => (
            <Link
              key={name}
              to={mainCategoryLink(name)}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary"
            >
              {name}
            </Link>
          ))}
        </div>

        <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-6">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Categories</dt>
            <dd className="text-2xl font-bold text-secondary">{stats.categories}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Services</dt>
            <dd className="text-2xl font-bold text-secondary">{stats.services}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Inspection fee</dt>
            <dd className="text-2xl font-bold text-secondary">₹{stats.inspectionFee}</dd>
          </div>
        </dl>
      </div>

      <div className="relative hidden lg:block">
        <div className="relative">
          <img
            src={HERO_IMAGES.main}
            alt="Professional cleaning a window at a customer's home"
            className="h-[26rem] w-full rounded-[2rem] object-cover shadow-2xl shadow-slate-900/15"
          />
          <img
            src={HERO_IMAGES.thumbs[0]}
            alt="Technician servicing an electrical panel"
            className="absolute -bottom-8 -left-10 h-32 w-32 rounded-2xl border-4 border-white object-cover shadow-xl"
          />
          <img
            src={HERO_IMAGES.thumbs[1]}
            alt="Salon professional performing a facial treatment"
            className="absolute -bottom-6 right-8 h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-xl"
          />

          <div className="absolute -top-5 right-6 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-secondary">
              <BadgeCheck className="w-4 h-4 text-success" /> Verified workers
            </div>
          </div>

          <div className="absolute top-1/3 -left-12 w-56 space-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
            {[
              { icon: Clock3, text: 'Same-day slots available' },
              { icon: IndianRupee, text: 'Cash on service or pay before' },
              { icon: BadgeCheck, text: 'ID-verified professionals' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
