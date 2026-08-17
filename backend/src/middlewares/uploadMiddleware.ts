import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'citysync_civic_media',
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  } as any,
});

export const upload = multer({ storage });
