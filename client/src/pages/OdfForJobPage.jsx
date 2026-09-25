import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  LogIn,
  MapPin,
  ShieldCheck,
  Star,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import { imageUrl } from '../data/serviceImages';

const WHY_JOIN = [
  {
    icon: CalendarDays,
    title: 'Work on your terms',
    desc: 'You decide which jobs to accept and when. Pick work that fits your schedule, skills and the areas you cover.',
  },
  {
    icon: MapPin,
    title: 'Jobs near you',
    desc: 'Customers in your locality find you through the ODForce catalog. Less travelling, more working.',
  },
  {
    icon: BadgeCheck,
    title: 'A profile that earns trust',
    desc: 'Your profile goes live after verification, so customers see a checked professional — not an unknown face.',
  },
  {
    icon: Wallet,
    title: 'Clear, upfront pricing',
    desc: 'Service prices are listed before a booking is made. You are paid for the work you complete — cash on service or online.',
  },
  {
    icon: Users,
    title: 'Direct to customers',
    desc: 'No auctions, no bidding loops. Customers book the service you offer and you take it from there.',
  },
  {
    icon: Star,
    title: 'Reviews that build your name',
    desc: 'Every completed job can earn you a customer review — good work makes your profile easier to choose.',
  },
];

const WORK_STEPS = [
  {
    title: 'Register your account',
    desc: 'Sign up with your basic details using the existing ODForce worker registration.',
    cta: true,
  },
  {
    title: 'Complete verification',
    desc: 'Submit your details for review. Your profile goes live once the platform verifies it.',
  },
  {
    title: 'Set up your profile',
    desc: 'Add your skills, experience and the areas you serve so the right jobs reach you.',
  },
  {
    title: 'Receive bookings',
    desc: 'Customers book your services from the catalog. You see what is requested before accepting.',
  },
  {
    title: 'Do the work',
    desc: 'Confirm a time, arrive prepared and complete the service to the listed scope.',
  },
  {
    title: 'Get paid',
    desc: 'Collect payment on completion — cash on service or the online payment flow, as chosen by the customer.',
  },
];

const GUIDELINES = [
  'Reach on time or message the customer if you are running late.',
  'Carry the tools and parts your trade needs for the booked service.',
  'Explain any extra work and cost to the customer before you start it.',
  'Treat the customer\u2019s home, belongings and privacy with care.',
  'Keep your profile details — skills, phone, service area — accurate.',
  'If you must cancel, do it early so the customer can rebook.',
];

const STANDARDS = [
  {
    icon: ShieldCheck,
    title: 'Verified professionals',
    desc: 'Identity checks are completed before a profile is published on the platform.',
  },
  {
    icon: CheckCircle2,
    title: 'Service scope discipline',
    desc: 'Bookings list exactly what was requested — perform the agreed scope and quote extras transparently.',
  },
  {
    icon: Star,
    title: 'Customer reviews',
    desc: 'Customers rate the work after completion. Consistent quality keeps your profile strong.',
  },
  {
    icon: Clock,
    title: 'Responsive communication',
    desc: 'Confirm or decline bookings promptly so customers are never left waiting.',
  },
];

const JoinCta = () => (
  <section className="bg-secondary py-16">
    <div className="container-custom text-center">
      <h2 className="text-3xl font-bold text-white sm:text-4xl">
        Ready to put your skills to work?
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-400">
        Create your worker account, complete verification and start taking jobs from customers
        near you.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/worker-portal?mode=register"
          className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-base"
        >
          <UserPlus className="h-5 w-5" /> Register as a professional
        </Link>
        <Link
          to="/worker-portal"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-500 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
        >
          <LogIn className="h-5 w-5" /> Login
        </Link>
      </div>
    </div>
  </section>
);

const OdfForJobPage = () => (
  <div className="flex flex-col min-h-screen">
    {/* Hero — recruitment poster */}
    <section className="border-b border-slate-200 bg-surface">
      <div className="container-custom grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            <BriefcaseIcon /> ODF for Job — work with ODForce
          </span>
          <h1 className="mt-5 text-4xl font-black leading-[1.1] text-secondary sm:text-5xl">
            Turn your skills into
            <br />
            <span className="text-primary">steady, local work.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-slate-600 sm:text-lg">
            ODForce connects verified professionals — plumbers, electricians, carpenters, cleaners,
            salon experts and more — with customers booking near them. Register once, get verified,
            and start taking jobs.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/worker-portal?mode=register"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3"
            >
              <UserPlus className="h-5 w-5" /> Register
            </Link>
            <Link
              to="/worker-portal"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              <LogIn className="h-5 w-5" /> Login
            </Link>
          </div>
          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Step 1</dt>
              <dd className="text-lg font-bold text-secondary">Register free</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Step 2</dt>
              <dd className="text-lg font-bold text-secondary">Get verified</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Step 3</dt>
              <dd className="text-lg font-bold text-secondary">Take jobs</dd>
            </div>
          </dl>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative">
            <img
              src={imageUrl('odfHero', 1200, 800)}
              alt="Uniformed professional ready for a service job"
              className="h-[26rem] w-full rounded-[2rem] object-cover shadow-2xl shadow-slate-900/15"
            />
            <div className="absolute -top-5 right-6 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
              <div className="flex items-center gap-2 text-sm font-bold text-secondary">
                <ShieldCheck className="w-4 h-4 text-primary" /> Verified before going live
              </div>
            </div>
            <div className="absolute -bottom-6 left-6 w-60 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarDays className="w-3.5 h-3.5" />
                </span>
                Accept only the jobs you want
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                Bookings from your service areas
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Why join us */}
    <section className="bg-white py-16">
      <div className="container-custom">
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Why join us
          </p>
          <h2 className="text-2xl font-bold text-secondary sm:text-3xl">
            Built for professionals who want steady work
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            ODForce is a booking platform, not a job board you have to fight over. Customers come
            with a clear service request — you decide what to take.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_JOIN.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-secondary">{title}</h3>
              <p className="text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How professionals work */}
    <section className="bg-slate-50 py-16">
      <div className="container-custom">
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
            How professionals work
          </p>
          <h2 className="text-2xl font-bold text-secondary sm:text-3xl">
            From registration to payout in six steps
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {WORK_STEPS.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mb-2 text-lg font-bold text-secondary">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.desc}</p>
              {step.cta && (
                <Link
                  to="/worker-portal?mode=register"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  Register now <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 grid items-center gap-8 rounded-[2rem] border border-slate-100 bg-white p-6 sm:p-8 lg:grid-cols-2">
          <img
            src={imageUrl('odfTeam', 800, 500)}
            alt="Professionals collaborating in an office"
            className="h-64 w-full rounded-2xl object-cover"
          />
          <div>
            <h3 className="text-xl font-bold text-secondary">
              One account — the whole flow you already know
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Registration, verification and your worker dashboard all run on ODForce&apos;s existing
              worker portal. There is no second system to learn: register, finish your profile
              setup, clear verification and work from your dashboard.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/worker-portal?mode=register"
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <UserPlus className="h-4 w-4" /> Start registration
              </Link>
              <Link
                to="/worker-portal"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-secondary transition-colors hover:border-primary hover:text-primary"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Professional guidelines */}
    <section className="bg-white py-16">
      <div className="container-custom grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Professional guidelines
          </p>
          <h2 className="text-2xl font-bold text-secondary sm:text-3xl">
            What customers expect from you
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Follow these on every booking and repeat work becomes a habit, not a gamble.
          </p>
          <ul className="mt-6 space-y-3">
            {GUIDELINES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <img
          src={imageUrl('odfWorker', 800, 500)}
          alt="Professional in work gear holding tools on site"
          className="h-80 w-full rounded-[2rem] object-cover shadow-xl"
        />
      </div>
    </section>

    {/* Professional standards */}
    <section className="bg-slate-50 py-16">
      <div className="container-custom">
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Professional standards
          </p>
          <h2 className="text-2xl font-bold text-secondary sm:text-3xl">
            The bar every ODForce professional is held to
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {STANDARDS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-white p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/5 text-secondary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-secondary">{title}</h3>
              <p className="text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <JoinCta />
  </div>
);

// Small inline badge icon (kept local so the page has no extra deps)
function BriefcaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export default OdfForJobPage;
