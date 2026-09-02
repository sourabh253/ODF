import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect, authorize } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${path.extname(file.originalname).toLowerCase()}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

router.post('/', protect, authorize('worker'), upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'odforce',
      resource_type: 'auto',
    });
    
    // Remove file from local disk after upload
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    // Attempt to clean up local file if cloudinary upload fails
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Cloudinary upload error:', error);
    res.status(500);
    throw new Error('Image upload failed');
  }
}));

export default router;
