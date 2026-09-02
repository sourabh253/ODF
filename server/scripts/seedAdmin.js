import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const email = 'sourabh253@gmail.com';
const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 12) {
  console.error('ADMIN_PASSWORD is required and must be at least 12 characters.');
  process.exit(1);
}

await connectDB();

const existingUser = await User.findOne({ email });
if (existingUser && existingUser.role !== 'admin') {
  console.error(`Cannot provision admin: ${email} already belongs to a ${existingUser.role}.`);
  process.exitCode = 1;
} else {
  const admin = existingUser || new User({ email });
  admin.fullName = 'Sourabh';
  admin.role = 'admin';
  admin.passwordHash = password;
  admin.isActive = true;
  await admin.save();
  console.log(`Admin account provisioned: ${admin.email}`);
}

await User.db.close();
