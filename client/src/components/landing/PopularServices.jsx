import ServiceCard from '../catalog/ServiceCard';
import ServiceCarousel, { CarouselItem } from '../catalog/ServiceCarousel';
import SectionHeader from '../catalog/SectionHeader';
import { categoryLink } from '../../utils/catalogLinks';

const PopularServices = ({
  services,
  onAdd,
  getQuantity,
  onIncrement,
  onDecrement,
  actionTo = '/dashboard',
}) => {
  if (!services.length) return null;

  return (
    <section className="mb-14">
      <SectionHeader
        eyebrow="Popular services"
        title="Popular right now"
        subtitle="Upfront starting prices across cleaning, repairs and salon — add what you need and adjust quantities in the cart."
        actionLabel="Browse all services"
        actionTo={actionTo}
      />
      <ServiceCarousel>
        {services.map((service) => {
          const quantity = getQuantity(service._id);
          return (
            <CarouselItem key={service._id}>
              <ServiceCard
                service={service}
                mainCategory={service.mainCategory}
                inCart={quantity > 0}
                quantity={quantity}
                onAdd={() => onAdd(service, service.category)}
                onIncrement={() => onIncrement(service._id, quantity + 1)}
                onDecrement={() => onDecrement(service._id, quantity - 1)}
              />
            </CarouselItem>
          );
        })}
      </ServiceCarousel>
    </section>
  );
};

export default PopularServices;
