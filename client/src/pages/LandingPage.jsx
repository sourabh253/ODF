import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Quote, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import catalogService from '../services/catalogService';
import { flattenCatalogTree, pickPopularServices } from '../utils/catalogTree';
import { mainCategoryLink } from '../utils/catalogLinks';
import HeroSection from '../components/landing/HeroSection';
import PopularServices from '../components/landing/PopularServices';
import CategoryTile from '../components/catalog/CategoryTile';
import SectionHeader from '../components/catalog/SectionHeader';
import { HeroSkeleton, QuickCategorySkeleton } from '../components/catalog/Skeletons';

const MAIN_CATEGORY_DESCRIPTIONS = {
  Cleaning: 'Kitchens, bathrooms, sofas, floors and full-home deep cleaning.',
  'AC & Appliance Repair': 'AC service, refrigerators, washing machines, geysers and more.',
  'Electrician, Plumber & Carpenter': 'Quick fixes, fittings and installations at clear prices.',
  "Women's Salon & Spa": 'Hair, skin, makeup, waxing and spa — done at your home.',
  "Men's Salon & Massage": 'Haircuts, beard care, facials and massage at home.',
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-slate-800">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 bg-white p-4 text-slate-600">{answer}</div>
      )}
    </div>
  );
};

const LandingPage = () => {
  const { user } = useAuth();
  const { cartItems, addToCart, updateQuantity, INSPECTION_FEE } = useCart();

  const [mainCategories, setMainCategories] = useState([]);
  const [catalogTree, setCatalogTree] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [categories, tree] = await Promise.all([
        catalogService.getMainCategories(user?.token),
        catalogService.getCatalogTree(user?.token),
      ]);
      setMainCategories(Array.isArray(categories) ? categories : []);
      setCatalogTree(tree || {});
    } catch {
      setError('We could not load the service catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const services = useMemo(() => flattenCatalogTree(catalogTree), [catalogTree]);
  const popular = useMemo(() => pickPopularServices(services), [services]);
  const categoryCount = useMemo(
    () => new Set(services.map((service) => service.category)).size,
    [services]
  );

  const getQuantity = useCallback(
    (serviceId) => cartItems.find((item) => item._id === serviceId)?.quantity || 0,
    [cartItems]
  );

  const cartApi = {
    getQuantity,
    onAdd: (service, category) => addToCart(service, category),
    onIncrement: (serviceId, quantity) => updateQuantity(serviceId, quantity),
    onDecrement: (serviceId, quantity) => updateQuantity(serviceId, quantity),
  };

  const stats = {
    categories: categoryCount,
    services: services.length,
    inspectionFee: INSPECTION_FEE,
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <HeroSkeleton />
        <div className="container-custom py-12">
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <QuickCategorySkeleton key={item} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection stats={stats} mainCategories={mainCategories} />

      {error && (
        <div className="container-custom mt-6">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={loadCatalog}
              className="ml-auto inline-flex items-center gap-1.5 font-semibold underline"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        </div>
      )}

      {!error && services.length === 0 && (
        <div className="container-custom py-16 text-center">
          <h2 className="text-xl font-bold text-secondary">No services available yet</h2>
          <p className="mt-2 text-slate-500">Please check back soon — new services are added daily.</p>
        </div>
      )}

      {/* What do you need done? — category discovery grid */}
      <section id="services" className="bg-slate-50 py-14 border-b border-slate-200">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Service categories"
            title="What do you need done?"
            subtitle="Pick a category to see every service, price and sub-category — then add services to your cart."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {mainCategories.map((name) => (
              <CategoryTile
                key={name}
                name={name}
                description={MAIN_CATEGORY_DESCRIPTIONS[name]}
                to={mainCategoryLink(name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Popular services */}
      <section className="bg-slate-50 py-14">
        <div className="container-custom">
          <PopularServices services={popular} actionTo="/dashboard" {...cartApi} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <h2 className="mb-3 text-center text-3xl font-bold">What our early users say</h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-slate-500">
            Real feedback from customers and workers using ODForce. Check back soon — our first
            bookings are just getting started.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { quote: 'Booked an electrician in 2 minutes. Transparent pricing, no surprises.', role: 'Customer', tag: 'Mumbai' },
              { quote: 'I get direct bookings without paying commission to middlemen.', role: 'Worker', tag: 'Pune' },
              { quote: 'Cash on service option gave me confidence to try the platform.', role: 'Customer', tag: 'Delhi' },
            ].map((item, i) => (
              <div key={i} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-8">
                <Quote className="absolute right-6 top-6 h-10 w-10 text-primary/20" />
                <p className="mb-6 italic text-slate-600">“{item.quote}”</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {item.role[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{item.role}</div>
                    <div className="text-xs text-slate-400">{item.tag}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="container-custom mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> About ODForce
          </span>
          <p className="text-lg leading-relaxed text-slate-600">
            ODForce replaces the informal, middleman-driven local hiring process with a centralized,
            trustworthy platform. Customers get access to verified talent instantly, and workers
            retain full control over their bookings and earnings — with fair pay and transparent
            pricing for everyone.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="container-custom mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold">Frequently asked questions</h2>
          <FAQItem
            question="How do I pay for a service?"
            answer="You can pay using 'Cash on Service' directly to the worker after completion, or use our 'Pay Before' secure online checkout via UPI with available coupons."
          />
          <FAQItem
            question="Are the workers verified?"
            answer="Yes, all workers undergo a verification process including ID checks before their profiles go live on our platform."
          />
          <FAQItem
            question="What is the minimum charge?"
            answer={`To ensure fair wages, the minimum booking charge on ODForce is ₹300, and a flat ₹${INSPECTION_FEE} inspection fee applies per booking.`}
          />
          <FAQItem
            question="Can I cancel a booking?"
            answer="Yes, you can cancel a pending request anytime, or cancel an accepted booking before the worker arrives."
          />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
