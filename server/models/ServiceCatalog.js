import mongoose from 'mongoose';

const serviceCatalogSchema = new mongoose.Schema(
  {
    mainCategory: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      default: 'per job',
    },
    isQuotationOnly: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient category browsing
serviceCatalogSchema.index({ mainCategory: 1, category: 1, subCategory: 1 });
serviceCatalogSchema.index({ category: 1, isActive: 1 });
serviceCatalogSchema.index({ mainCategory: 1, isActive: 1 });

const ServiceCatalog = mongoose.model('ServiceCatalog', serviceCatalogSchema);
export default ServiceCatalog;
