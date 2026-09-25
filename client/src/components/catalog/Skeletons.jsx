export const ServiceCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="h-36 animate-pulse bg-slate-200" />
    <div className="space-y-2.5 p-3.5">
      <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-200" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
      <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
    </div>
  </div>
);

export const CategorySectionSkeleton = () => (
  <section className="mb-14">
    <div className="mb-7 space-y-2">
      <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
      <div className="h-7 w-64 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
    </div>
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="w-[15.5rem] shrink-0 sm:w-[17rem]">
          <ServiceCardSkeleton />
        </div>
      ))}
    </div>
  </section>
);

export const QuickCategorySkeleton = () => (
  <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
);

export const HeroSkeleton = () => (
  <section className="border-b border-slate-200 bg-surface py-16">
    <div className="container-custom grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-12 w-full max-w-lg animate-pulse rounded bg-slate-200" />
        <div className="h-12 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-14 w-full max-w-xl animate-pulse rounded bg-slate-200" />
      </div>
      <div className="hidden h-80 animate-pulse rounded-3xl bg-slate-200 lg:block" />
    </div>
  </section>
);
