import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const registerCustomer = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, location } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    role: 'customer',
    fullName,
    email,
    phone,
    passwordHash: password,
    location,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

export const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, role: 'customer' });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

export const registerWorker = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    res.status(400);
    throw new Error('Worker already exists with this email or phone');
  }

  const user = await User.create({
    role: 'worker',
    fullName,
    email,
    phone,
    passwordHash: password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(400);
    throw new Error('Invalid worker data');
  }
});

export const loginWorker = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body; 

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
    role: 'worker'
  });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: 'admin' });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    role: req.user.role,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.passwordHash = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});
