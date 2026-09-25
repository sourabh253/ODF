import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ServiceCarousel = ({ children }) => {
  const scrollerRef = useRef(null);

  const scrollBy = (direction) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="group/carousel relative">
      <div
        ref={scrollerRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className="absolute -left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-secondary shadow-md transition hover:border-primary hover:text-primary md:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-secondary shadow-md transition hover:border-primary hover:text-primary md:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export const CarouselItem = ({ children }) => (
  <div className="w-[15.5rem] shrink-0 snap-start sm:w-[17rem]">{children}</div>
);

export default ServiceCarousel;
