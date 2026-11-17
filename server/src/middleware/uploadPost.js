import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { imageFileFilter, wrapStorageWithContentValidation } from '../utils/imageValidator.js'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure Cloudinary storage for posts
const baseStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'flagger/posts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit' }],
        public_id: (req, file) => {
            const userId = req.user?._id || 'post'
            return `post-${userId}-${Date.now()}`
        }
    }
})

const secureStorage = wrapStorageWithContentValidation(baseStorage)

// Create multer upload instance with max 5 images and 10MB limit per file
export const uploadPostImages = multer({
    storage: secureStorage,
    fileFilter: imageFileFilter,
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 images
    }
}).array('images', 5)

// Export cloudinary instance for deletion
export { cloudinary }
