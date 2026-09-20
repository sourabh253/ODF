import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Coupon from '../models/Coupon.js';

dotenv.config();

const coupons = [
  {
    code: 'FLAT50',
    discountType: 'flat',
    discountValue: 50,
    minBookingAmount: 200,
    isActive: true,
    expiresAt: new Date('2026-12-31'),
    usageLimit: 100,
    usedCount: 0,
  },
  {
    code: 'SAVE10',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 150,
    minBookingAmount: 300,
    isActive: true,
    expiresAt: new Date('2026-12-31'),
    usageLimit: 200,
    usedCount: 0,
  },
  {
    code: 'WELCOME20',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 200,
    minBookingAmount: 500,
    isActive: true,
    expiresAt: new Date('2026-06-30'),
    usageLimit: 50,
    usedCount: 0,
  },
];

const seedCoupons = async () => {
  try {
    await connectDB();

    const deleteResult = await Coupon.deleteMany({});
    console.log(`Cleared existing coupons: ${deleteResult.deletedCount} removed`);

    const result = await Coupon.insertMany(coupons);
    console.log(`Seeded ${result.length} coupons:`);
    for (const c of result) {
      const discount = c.discountType === 'flat' ? `₹${c.discountValue} off` : `${c.discountValue}% off (max ₹${c.maxDiscount || 'none'})`;
      console.log(`  ${c.code}: ${discount}, min ₹${c.minBookingAmount}, expires ${c.expiresAt.toDateString()}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedCoupons();
