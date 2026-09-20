import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import ServiceCatalog from '../models/ServiceCatalog.js';

dotenv.config();

const services = [
  // ═══════════════════════════════════════════════════════
  // MAIN CATEGORY: Women's Salon & Spa
  // ═══════════════════════════════════════════════════════
  // Hair Care
  { mainCategory: "Women's Salon & Spa", category: 'Hair Care', subCategory: 'Hair Care', serviceName: "Women's haircut", price: 199, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Hair Care', subCategory: 'Hair Care', serviceName: 'Hair wash & conditioning', price: 149, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Hair Care', subCategory: 'Hair Care', serviceName: 'Hair trim', price: 99, unit: 'per service' },
  // Hair Styling
  { mainCategory: "Women's Salon & Spa", category: 'Hair Styling', subCategory: 'Hair Styling', serviceName: 'Blow dry styling', price: 249, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Hair Styling', subCategory: 'Hair Styling', serviceName: 'Basic hair styling', price: 299, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Hair Styling', subCategory: 'Hair Styling', serviceName: 'Party hair styling', price: 499, unit: 'per service' },
  // Hair Spa
  { mainCategory: "Women's Salon & Spa", category: 'Hair Spa', subCategory: 'Hair Spa', serviceName: 'Basic hair spa', price: 399, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Hair Spa', subCategory: 'Hair Spa', serviceName: 'Advanced hair spa', price: 599, unit: 'per service' },
  // Hair Removal
  { mainCategory: "Women's Salon & Spa", category: 'Hair Removal', subCategory: 'Hair Removal', serviceName: 'Full arms waxing', price: 299, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Hair Removal', subCategory: 'Hair Removal', serviceName: 'Half arms waxing', price: 199, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Hair Removal', subCategory: 'Hair Removal', serviceName: 'Full legs waxing', price: 399, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Hair Removal', subCategory: 'Hair Removal', serviceName: 'Half legs waxing', price: 249, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Hair Removal', subCategory: 'Hair Removal', serviceName: 'Underarms waxing', price: 149, unit: 'per service' },
  // Facial & Skin Care
  { mainCategory: "Women's Salon & Spa", category: 'Facial & Skin Care', subCategory: 'Facial & Skin Care', serviceName: 'Basic facial', price: 399, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Facial & Skin Care', subCategory: 'Facial & Skin Care', serviceName: 'Cleanup facial', price: 299, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Facial & Skin Care', subCategory: 'Facial & Skin Care', serviceName: 'Fruit facial', price: 499, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Facial & Skin Care', subCategory: 'Facial & Skin Care', serviceName: 'Skin cleanup', price: 249, unit: 'per service' },
  // Manicure & Pedicure
  { mainCategory: "Women's Salon & Spa", category: 'Manicure & Pedicure', subCategory: 'Manicure & Pedicure', serviceName: 'Basic manicure', price: 249, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Manicure & Pedicure', subCategory: 'Manicure & Pedicure', serviceName: 'Basic pedicure', price: 299, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Manicure & Pedicure', subCategory: 'Manicure & Pedicure', serviceName: 'Manicure + pedicure', price: 499, unit: 'per service' },
  // Makeup
  { mainCategory: "Women's Salon & Spa", category: 'Makeup', subCategory: 'Makeup', serviceName: 'Basic makeup', price: 799, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Makeup', subCategory: 'Makeup', serviceName: 'Party makeup', price: 1499, unit: 'per service' },
  // Spa & Massage
  { mainCategory: "Women's Salon & Spa", category: 'Spa & Massage', subCategory: 'Spa & Massage', serviceName: 'Head massage', price: 249, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Spa & Massage', subCategory: 'Spa & Massage', serviceName: 'Relaxation body massage', price: 699, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Spa & Massage', subCategory: 'Spa & Massage', serviceName: 'Back massage', price: 399, unit: 'per service' },
  // Bridal & Special Occasion
  { mainCategory: "Women's Salon & Spa", category: 'Bridal & Special Occasion', subCategory: 'Bridal & Special Occasion', serviceName: 'Basic bridal makeup', price: 2999, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Bridal & Special Occasion', subCategory: 'Bridal & Special Occasion', serviceName: 'Bridal hair styling', price: 999, unit: 'per service' },
  { mainCategory: "Women's Salon & Spa", category: 'Bridal & Special Occasion', subCategory: 'Bridal & Special Occasion', serviceName: 'Special occasion makeup', price: 1999, unit: 'per service' },

  // ═══════════════════════════════════════════════════════
  // MAIN CATEGORY: Men's Salon & Massage
  // ═══════════════════════════════════════════════════════
  // Haircut
  { mainCategory: "Men's Salon & Massage", category: 'Haircut', subCategory: 'Haircut', serviceName: "Basic men's haircut", price: 149, unit: 'per service' },
  { mainCategory: "Men's Salon & Massage", category: 'Haircut', subCategory: 'Haircut', serviceName: 'Premium haircut', price: 249, unit: 'per service' },
  // Hair Styling
  { mainCategory: "Men's Salon & Massage", category: 'Hair Styling', subCategory: 'Hair Styling', serviceName: 'Hair styling', price: 199, unit: 'per service' },
  { mainCategory: "Men's Salon & Massage", category: 'Hair Styling', subCategory: 'Hair Styling', serviceName: 'Premium hair styling', price: 299, unit: 'per service' },
  // Beard & Shaving
  { mainCategory: "Men's Salon & Massage", category: 'Beard & Shaving', subCategory: 'Beard & Shaving', serviceName: 'Beard trimming', price: 99, unit: 'per service' },
  { mainCategory: "Men's Salon & Massage", category: 'Beard & Shaving', subCategory: 'Beard & Shaving', serviceName: 'Beard styling', price: 149, unit: 'per service' },
  { mainCategory: "Men's Salon & Massage", category: 'Beard & Shaving', subCategory: 'Beard & Shaving', serviceName: 'Clean shave', price: 129, unit: 'per service' },
  // Hair & Beard Combo
  { mainCategory: "Men's Salon & Massage", category: 'Hair & Beard Combo', subCategory: 'Hair & Beard Combo', serviceName: 'Haircut + beard trim', price: 249, unit: 'per service' },
  { mainCategory: "Men's Salon & Massage", category: 'Hair & Beard Combo', subCategory: 'Hair & Beard Combo', serviceName: 'Haircut + beard styling', price: 299, unit: 'per service' },
  // Hair Spa
  { mainCategory: "Men's Salon & Massage", category: 'Hair Spa', subCategory: 'Hair Spa', serviceName: "Basic men's hair spa", price: 349, unit: 'per service' },
  { mainCategory: "Men's Salon & Massage", category: 'Hair Spa', subCategory: 'Hair Spa', serviceName: "Advanced men's hair spa", price: 499, unit: 'per service' },
  // Facial & Skin Care
  { mainCategory: "Men's Salon & Massage", category: 'Facial & Skin Care', subCategory: 'Facial & Skin Care', serviceName: "Men's basic facial", price: 349, unit: 'per service' },
  { mainCategory: "Men's Salon & Massage", category: 'Facial & Skin Care', subCategory: 'Facial & Skin Care', serviceName: "Men's cleanup", price: 249, unit: 'per service' },
  // Head Massage
  { mainCategory: "Men's Salon & Massage", category: 'Head Massage', subCategory: 'Head Massage', serviceName: 'Head massage', price: 199, unit: 'per service' },
  { mainCategory: "Men's Salon & Massage", category: 'Head Massage', subCategory: 'Head Massage', serviceName: 'Head massage + hair wash', price: 299, unit: 'per service' },
  // Body Massage
  { mainCategory: "Men's Salon & Massage", category: 'Body Massage', subCategory: 'Body Massage', serviceName: 'Back massage', price: 399, unit: 'per service' },
  { mainCategory: "Men's Salon & Massage", category: 'Body Massage', subCategory: 'Body Massage', serviceName: 'Relaxation body massage', price: 699, unit: 'per service' },
  // Grooming Packages
  { mainCategory: "Men's Salon & Massage", category: 'Grooming Packages', subCategory: 'Grooming Packages', serviceName: 'Basic grooming package', price: 399, unit: 'per service' },
  { mainCategory: "Men's Salon & Massage", category: 'Grooming Packages', subCategory: 'Grooming Packages', serviceName: 'Premium grooming package', price: 699, unit: 'per service' },

  // ═══════════════════════════════════════════════════════
  // MAIN CATEGORY: Cleaning
  // ═══════════════════════════════════════════════════════
  // Home Cleaning
  { mainCategory: 'Cleaning', category: 'Home Cleaning', subCategory: 'Home Cleaning', serviceName: '1 BHK basic cleaning', price: 699, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Home Cleaning', subCategory: 'Home Cleaning', serviceName: '2 BHK basic cleaning', price: 999, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Home Cleaning', subCategory: 'Home Cleaning', serviceName: '3 BHK basic cleaning', price: 1299, unit: 'per visit' },
  // Deep Cleaning
  { mainCategory: 'Cleaning', category: 'Deep Cleaning', subCategory: 'Deep Cleaning', serviceName: '1 BHK deep cleaning', price: 1499, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Deep Cleaning', subCategory: 'Deep Cleaning', serviceName: '2 BHK deep cleaning', price: 1999, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Deep Cleaning', subCategory: 'Deep Cleaning', serviceName: '3 BHK deep cleaning', price: 2499, unit: 'per visit' },
  // Kitchen Cleaning
  { mainCategory: 'Cleaning', category: 'Kitchen Cleaning', subCategory: 'Kitchen Cleaning', serviceName: 'Kitchen basic cleaning', price: 399, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Kitchen Cleaning', subCategory: 'Kitchen Cleaning', serviceName: 'Kitchen deep cleaning', price: 699, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Kitchen Cleaning', subCategory: 'Kitchen Cleaning', serviceName: 'Chimney exterior cleaning', price: 250, unit: 'per service' },
  { mainCategory: 'Cleaning', category: 'Kitchen Cleaning', subCategory: 'Kitchen Cleaning', serviceName: 'Kitchen cabinet cleaning', price: 399, unit: 'per service' },
  // Bathroom Cleaning
  { mainCategory: 'Cleaning', category: 'Bathroom Cleaning', subCategory: 'Bathroom Cleaning', serviceName: 'Bathroom basic cleaning', price: 249, unit: 'per bathroom' },
  { mainCategory: 'Cleaning', category: 'Bathroom Cleaning', subCategory: 'Bathroom Cleaning', serviceName: 'Bathroom deep cleaning', price: 399, unit: 'per bathroom' },
  { mainCategory: 'Cleaning', category: 'Bathroom Cleaning', subCategory: 'Bathroom Cleaning', serviceName: 'Toilet deep cleaning', price: 249, unit: 'per toilet' },
  // Floor Cleaning
  { mainCategory: 'Cleaning', category: 'Floor Cleaning', subCategory: 'Floor Cleaning', serviceName: 'Floor deep cleaning', price: 499, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Floor Cleaning', subCategory: 'Floor Cleaning', serviceName: 'Balcony cleaning', price: 249, unit: 'per balcony' },
  { mainCategory: 'Cleaning', category: 'Floor Cleaning', subCategory: 'Floor Cleaning', serviceName: 'Terrace basic cleaning', price: 499, unit: 'per visit' },
  // Window & Glass Cleaning
  { mainCategory: 'Cleaning', category: 'Window & Glass Cleaning', subCategory: 'Window & Glass Cleaning', serviceName: 'Window cleaning', price: 199, unit: 'per window' },
  { mainCategory: 'Cleaning', category: 'Window & Glass Cleaning', subCategory: 'Window & Glass Cleaning', serviceName: 'Glass door cleaning', price: 199, unit: 'per door' },
  { mainCategory: 'Cleaning', category: 'Window & Glass Cleaning', subCategory: 'Window & Glass Cleaning', serviceName: 'Glass partition cleaning', price: 299, unit: 'per partition' },
  // Sofa Cleaning
  { mainCategory: 'Cleaning', category: 'Sofa Cleaning', subCategory: 'Sofa Cleaning', serviceName: '1-seat sofa cleaning', price: 150, unit: 'per seat' },
  { mainCategory: 'Cleaning', category: 'Sofa Cleaning', subCategory: 'Sofa Cleaning', serviceName: '2-seat sofa cleaning', price: 250, unit: 'per seat' },
  { mainCategory: 'Cleaning', category: 'Sofa Cleaning', subCategory: 'Sofa Cleaning', serviceName: '3-seat sofa cleaning', price: 350, unit: 'per seat' },
  { mainCategory: 'Cleaning', category: 'Sofa Cleaning', subCategory: 'Sofa Cleaning', serviceName: '4-seat sofa cleaning', price: 450, unit: 'per seat' },
  { mainCategory: 'Cleaning', category: 'Sofa Cleaning', subCategory: 'Sofa Cleaning', serviceName: '5-seat sofa cleaning', price: 550, unit: 'per seat' },
  { mainCategory: 'Cleaning', category: 'Sofa Cleaning', subCategory: 'Sofa Cleaning', serviceName: '6-seat sofa cleaning', price: 650, unit: 'per seat' },
  // Mattress Cleaning
  { mainCategory: 'Cleaning', category: 'Mattress Cleaning', subCategory: 'Mattress Cleaning', serviceName: 'Single mattress cleaning', price: 399, unit: 'per mattress' },
  { mainCategory: 'Cleaning', category: 'Mattress Cleaning', subCategory: 'Mattress Cleaning', serviceName: 'Double mattress cleaning', price: 599, unit: 'per mattress' },
  { mainCategory: 'Cleaning', category: 'Mattress Cleaning', subCategory: 'Mattress Cleaning', serviceName: 'King mattress cleaning', price: 699, unit: 'per mattress' },
  // Chair Cleaning
  { mainCategory: 'Cleaning', category: 'Chair Cleaning', subCategory: 'Chair Cleaning', serviceName: 'Dining chair cleaning', price: 100, unit: 'per chair' },
  { mainCategory: 'Cleaning', category: 'Chair Cleaning', subCategory: 'Chair Cleaning', serviceName: 'Office chair cleaning', price: 120, unit: 'per chair' },
  // Pest Control
  { mainCategory: 'Cleaning', category: 'Pest Control', subCategory: 'Pest Control', serviceName: '1 BHK pest control', price: 599, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Pest Control', subCategory: 'Pest Control', serviceName: '2 BHK pest control', price: 799, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Pest Control', subCategory: 'Pest Control', serviceName: '3 BHK pest control', price: 999, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Pest Control', subCategory: 'Pest Control', serviceName: 'Cockroach control', price: 499, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Pest Control', subCategory: 'Pest Control', serviceName: 'Ant control', price: 399, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Pest Control', subCategory: 'Pest Control', serviceName: 'Mosquito control', price: 499, unit: 'per visit' },
  { mainCategory: 'Cleaning', category: 'Pest Control', subCategory: 'Pest Control', serviceName: 'Bed bug control', price: 999, unit: 'per visit' },

  // ═══════════════════════════════════════════════════════
  // MAIN CATEGORY: AC & Appliance Repair
  // ═══════════════════════════════════════════════════════
  // AC Service & Repair
  { mainCategory: 'AC & Appliance Repair', category: 'AC Service & Repair', subCategory: 'AC Service & Repair', serviceName: 'Split AC basic service', price: 399, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'AC Service & Repair', subCategory: 'AC Service & Repair', serviceName: 'Split AC deep cleaning', price: 699, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'AC Service & Repair', subCategory: 'AC Service & Repair', serviceName: 'Window AC basic service', price: 399, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'AC Service & Repair', subCategory: 'AC Service & Repair', serviceName: 'Window AC deep cleaning', price: 699, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'AC Service & Repair', subCategory: 'AC Service & Repair', serviceName: 'AC cooling inspection', price: 199, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'AC Service & Repair', subCategory: 'AC Service & Repair', serviceName: 'AC gas leakage inspection', price: 299, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'AC Service & Repair', subCategory: 'AC Service & Repair', serviceName: 'AC electrical inspection', price: 199, unit: 'per unit' },
  // AC Installation
  { mainCategory: 'AC & Appliance Repair', category: 'AC Installation', subCategory: 'AC Installation', serviceName: 'Split AC installation', price: 999, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'AC Installation', subCategory: 'AC Installation', serviceName: 'Split AC removal', price: 599, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'AC Installation', subCategory: 'AC Installation', serviceName: 'Window AC installation', price: 699, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'AC Installation', subCategory: 'AC Installation', serviceName: 'Window AC removal', price: 399, unit: 'per unit' },
  // Washing Machine
  { mainCategory: 'AC & Appliance Repair', category: 'Washing Machine', subCategory: 'Washing Machine', serviceName: 'Washing machine inspection', price: 199, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Washing Machine', subCategory: 'Washing Machine', serviceName: 'Washing machine basic service', price: 399, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Washing Machine', subCategory: 'Washing Machine', serviceName: 'Washing machine deep cleaning', price: 699, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Washing Machine', subCategory: 'Washing Machine', serviceName: 'Washing machine installation', price: 299, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Washing Machine', subCategory: 'Washing Machine', serviceName: 'Washing machine removal', price: 199, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Washing Machine', subCategory: 'Washing Machine', serviceName: 'Inlet pipe replacement', price: 150, unit: 'per pipe' },
  { mainCategory: 'AC & Appliance Repair', category: 'Washing Machine', subCategory: 'Washing Machine', serviceName: 'Drain pipe replacement', price: 150, unit: 'per pipe' },
  { mainCategory: 'AC & Appliance Repair', category: 'Washing Machine', subCategory: 'Washing Machine', serviceName: 'Washing machine electrical inspection', price: 199, unit: 'per unit' },
  // Refrigerator
  { mainCategory: 'AC & Appliance Repair', category: 'Refrigerator', subCategory: 'Refrigerator', serviceName: 'Refrigerator inspection', price: 199, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Refrigerator', subCategory: 'Refrigerator', serviceName: 'Refrigerator basic service', price: 399, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Refrigerator', subCategory: 'Refrigerator', serviceName: 'Refrigerator deep cleaning', price: 599, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Refrigerator', subCategory: 'Refrigerator', serviceName: 'Door gasket replacement', price: 250, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Refrigerator', subCategory: 'Refrigerator', serviceName: 'Refrigerator electrical inspection', price: 199, unit: 'per unit' },
  // RO/Water Purifier
  { mainCategory: 'AC & Appliance Repair', category: 'RO/Water Purifier', subCategory: 'RO/Water Purifier', serviceName: 'RO inspection', price: 199, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'RO/Water Purifier', subCategory: 'RO/Water Purifier', serviceName: 'RO basic service', price: 399, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'RO/Water Purifier', subCategory: 'RO/Water Purifier', serviceName: 'RO deep cleaning', price: 599, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'RO/Water Purifier', subCategory: 'RO/Water Purifier', serviceName: 'RO installation', price: 399, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'RO/Water Purifier', subCategory: 'RO/Water Purifier', serviceName: 'RO removal', price: 299, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'RO/Water Purifier', subCategory: 'RO/Water Purifier', serviceName: 'Filter replacement', price: 199, unit: 'per filter' },
  { mainCategory: 'AC & Appliance Repair', category: 'RO/Water Purifier', subCategory: 'RO/Water Purifier', serviceName: 'Pipe replacement', price: 150, unit: 'per pipe' },
  // Geyser
  { mainCategory: 'AC & Appliance Repair', category: 'Geyser', subCategory: 'Geyser', serviceName: 'Geyser installation', price: 499, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Geyser', subCategory: 'Geyser', serviceName: 'Geyser removal', price: 299, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Geyser', subCategory: 'Geyser', serviceName: 'Geyser electrical connection', price: 250, unit: 'per unit' },
  // Microwave
  { mainCategory: 'AC & Appliance Repair', category: 'Microwave', subCategory: 'Microwave', serviceName: 'Microwave installation', price: 199, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Microwave', subCategory: 'Microwave', serviceName: 'Microwave electrical connection', price: 150, unit: 'per unit' },
  // Chimney
  { mainCategory: 'AC & Appliance Repair', category: 'Chimney', subCategory: 'Chimney', serviceName: 'Chimney installation', price: 499, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Chimney', subCategory: 'Chimney', serviceName: 'Chimney exterior cleaning', price: 250, unit: 'per unit' },
  // Dishwasher
  { mainCategory: 'AC & Appliance Repair', category: 'Dishwasher', subCategory: 'Dishwasher', serviceName: 'Dishwasher installation', price: 399, unit: 'per unit' },
  // Other Home Appliances
  { mainCategory: 'AC & Appliance Repair', category: 'Other Home Appliances', subCategory: 'Other Home Appliances', serviceName: 'Air cooler installation', price: 199, unit: 'per unit' },
  { mainCategory: 'AC & Appliance Repair', category: 'Other Home Appliances', subCategory: 'Other Home Appliances', serviceName: 'Air cooler removal', price: 149, unit: 'per unit' },

  // ═══════════════════════════════════════════════════════
  // MAIN CATEGORY: Electrician, Plumber & Carpenter
  // ═══════════════════════════════════════════════════════
  // --- Electrician ---
  // Switches & Sockets
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Switches & Sockets', serviceName: 'Switch replacement', price: 80, unit: 'per switch' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Switches & Sockets', serviceName: 'Socket replacement', price: 100, unit: 'per socket' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Switches & Sockets', serviceName: 'Switch+socket replacement', price: 150, unit: 'per pair' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Switches & Sockets', serviceName: 'Modular switch replacement', price: 100, unit: 'per switch' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Switches & Sockets', serviceName: 'Modular socket replacement', price: 120, unit: 'per socket' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Switches & Sockets', serviceName: 'Switchboard replacement', price: 250, unit: 'per board' },
  // Lights
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Lights', serviceName: 'Bulb install/replace', price: 80, unit: 'per bulb' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Lights', serviceName: 'LED light installation', price: 120, unit: 'per light' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Lights', serviceName: 'Ceiling light installation', price: 150, unit: 'per light' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Lights', serviceName: 'Wall light installation', price: 150, unit: 'per light' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Lights', serviceName: 'Tube light installation', price: 120, unit: 'per light' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Lights', serviceName: 'LED panel light installation', price: 150, unit: 'per light' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Lights', serviceName: 'Decorative light installation', price: 250, unit: 'per light' },
  // Fans
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Fans', serviceName: 'Ceiling fan installation', price: 250, unit: 'per fan' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Fans', serviceName: 'Ceiling fan removal', price: 150, unit: 'per fan' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Fans', serviceName: 'Exhaust fan installation', price: 250, unit: 'per fan' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Fans', serviceName: 'Fan capacitor replacement', price: 150, unit: 'per fan' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Fans', serviceName: 'Fan regulator replacement', price: 120, unit: 'per fan' },
  // Wiring & Electrical Repair
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Wiring & Electrical Repair', serviceName: 'Minor wiring repair', price: 150, unit: 'per job' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Wiring & Electrical Repair', serviceName: 'Loose wire connection repair', price: 120, unit: 'per job' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Wiring & Electrical Repair', serviceName: 'Short-circuit inspection', price: 150, unit: 'per job' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Wiring & Electrical Repair', serviceName: 'MCB replacement', price: 150, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Wiring & Electrical Repair', serviceName: 'Fuse replacement', price: 120, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Wiring & Electrical Repair', serviceName: 'Distribution board inspection', price: 200, unit: 'per board' },
  // Doorbell
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Doorbell', serviceName: 'Doorbell installation', price: 150, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Doorbell', serviceName: 'Doorbell replacement', price: 120, unit: 'per unit' },
  // Inverter & Stabilizer
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Inverter & Stabilizer', serviceName: 'Inverter installation', price: 300, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Inverter & Stabilizer', serviceName: 'Inverter removal', price: 200, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Inverter & Stabilizer', serviceName: 'Stabilizer installation', price: 200, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Inverter & Stabilizer', serviceName: 'Stabilizer removal', price: 150, unit: 'per unit' },
  // Electrical Appliances
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Electrical Appliances', serviceName: 'Washing machine electrical connection', price: 200, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Electrical Appliances', serviceName: 'Microwave electrical connection', price: 150, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Electrical Appliances', serviceName: 'Refrigerator electrical connection', price: 150, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Electrical Appliances', serviceName: 'Geyser electrical connection', price: 250, unit: 'per unit' },
  // Electrical Inspection
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Electrical Inspection', serviceName: 'Safety inspection', price: 200, unit: 'per visit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Electrician', subCategory: 'Electrical Inspection', serviceName: 'Fault diagnosis', price: 200, unit: 'per visit' },

  // --- Plumber ---
  // Taps & Faucets
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Taps & Faucets', serviceName: 'Tap replacement', price: 120, unit: 'per tap' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Taps & Faucets', serviceName: 'Faucet replacement', price: 150, unit: 'per faucet' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Taps & Faucets', serviceName: 'Tap leakage repair', price: 120, unit: 'per tap' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Taps & Faucets', serviceName: 'Faucet leakage repair', price: 150, unit: 'per faucet' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Taps & Faucets', serviceName: 'Mixer tap installation', price: 250, unit: 'per unit' },
  // Sink
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Sink', serviceName: 'Sink blockage removal', price: 200, unit: 'per sink' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Sink', serviceName: 'Sink pipe leakage repair', price: 150, unit: 'per joint' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Sink', serviceName: 'Sink installation', price: 400, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Sink', serviceName: 'Sink removal', price: 250, unit: 'per unit' },
  // Toilet
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Toilet', serviceName: 'Flush repair', price: 180, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Toilet', serviceName: 'Flush tank replacement', price: 250, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Toilet', serviceName: 'Seat replacement', price: 200, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Toilet', serviceName: 'Toilet blockage removal', price: 250, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Toilet', serviceName: 'Toilet installation', price: 500, unit: 'per unit' },
  // Pipes & Leakage
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Pipes & Leakage', serviceName: 'Minor pipe leakage repair', price: 150, unit: 'per joint' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Pipes & Leakage', serviceName: 'Pipe joint repair', price: 120, unit: 'per joint' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Pipes & Leakage', serviceName: 'Water pipe replacement', price: 200, unit: 'per meter' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Pipes & Leakage', serviceName: 'Drain pipe repair', price: 200, unit: 'per joint' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Pipes & Leakage', serviceName: 'Water leakage inspection', price: 150, unit: 'per visit' },
  // Bathroom Plumbing
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Bathroom Plumbing', serviceName: 'Shower installation', price: 200, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Bathroom Plumbing', serviceName: 'Health faucet installation', price: 150, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Bathroom Plumbing', serviceName: 'Bathroom accessory installation', price: 200, unit: 'per accessory' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Bathroom Plumbing', serviceName: 'Bathroom plumbing inspection', price: 200, unit: 'per visit' },
  // Water Supply
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Water Supply', serviceName: 'Water tank pipe connection', price: 250, unit: 'per connection' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Water Supply', serviceName: 'Water inlet pipe replacement', price: 200, unit: 'per pipe' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Plumber', subCategory: 'Water Supply', serviceName: 'Water outlet pipe replacement', price: 200, unit: 'per pipe' },

  // --- Carpenter ---
  // Furniture Assembly
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Furniture Assembly', serviceName: 'Table assembly', price: 250, unit: 'per piece' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Furniture Assembly', serviceName: 'Chair assembly', price: 150, unit: 'per piece' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Furniture Assembly', serviceName: 'Bed assembly', price: 400, unit: 'per piece' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Furniture Assembly', serviceName: 'Wardrobe assembly', price: 500, unit: 'per piece' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Furniture Assembly', serviceName: 'Bookshelf assembly', price: 300, unit: 'per piece' },
  // Furniture Repair
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Furniture Repair', serviceName: 'Chair repair', price: 150, unit: 'per piece' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Furniture Repair', serviceName: 'Table repair', price: 200, unit: 'per piece' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Furniture Repair', serviceName: 'Bed repair', price: 250, unit: 'per piece' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Furniture Repair', serviceName: 'Drawer repair', price: 150, unit: 'per piece' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Furniture Repair', serviceName: 'Cabinet repair', price: 250, unit: 'per piece' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Furniture Repair', serviceName: 'Wardrobe door repair', price: 250, unit: 'per door' },
  // Door & Window
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Door & Window', serviceName: 'Handle replacement', price: 150, unit: 'per handle' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Door & Window', serviceName: 'Lock installation', price: 200, unit: 'per lock' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Door & Window', serviceName: 'Hinge replacement', price: 150, unit: 'per hinge' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Door & Window', serviceName: 'Door/window alignment/adjustment', price: 200, unit: 'per unit' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Door & Window', serviceName: 'Window latch replacement', price: 150, unit: 'per latch' },
  // Drilling & Installation
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Drilling & Installation', serviceName: 'Wall shelf installation', price: 200, unit: 'per shelf' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Drilling & Installation', serviceName: 'Curtain rod installation', price: 150, unit: 'per rod' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Drilling & Installation', serviceName: 'Mirror installation', price: 200, unit: 'per mirror' },
  { mainCategory: 'Electrician, Plumber & Carpenter', category: 'Carpenter', subCategory: 'Drilling & Installation', serviceName: 'Wall-mounted TV unit installation', price: 400, unit: 'per unit' },
];

const seedCatalog = async () => {
  try {
    await connectDB();

    // Clear existing catalog completely
    const deleteResult = await ServiceCatalog.deleteMany({});
    console.log(`Cleared existing catalog: ${deleteResult.deletedCount} documents removed`);

    // Insert all services
    const result = await ServiceCatalog.insertMany(services);
    console.log(`Seeded ${result.length} services into the catalog`);

    // Summary by main category
    const mainCategories = [...new Set(services.map(s => s.mainCategory))];
    console.log(`\nMain categories: ${mainCategories.length}`);
    for (const mc of mainCategories) {
      const mcServices = services.filter(s => s.mainCategory === mc);
      const cats = [...new Set(mcServices.map(s => s.category))];
      const subCats = [...new Set(mcServices.map(s => s.subCategory))];
      console.log(`  ${mc}: ${mcServices.length} services, ${cats.length} service categories, ${subCats.length} subcategories`);
    }

    // Verify no duplicates
    const uniqueServices = new Set(services.map(s => `${s.mainCategory}|${s.category}|${s.subCategory}|${s.serviceName}`));
    if (uniqueServices.size !== services.length) {
      console.error(`WARNING: ${services.length - uniqueServices.size} duplicate(s) detected!`);
    } else {
      console.log(`\nNo duplicates detected (${uniqueServices.size} unique services)`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedCatalog();
