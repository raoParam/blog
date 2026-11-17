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

// Configure storage
const baseStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'flagger/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
        public_id: (req, file) => {
            const userId = req.user?._id || 'anon'
            return `user-${userId}-${Date.now()}`
        }
    }
})

const secureStorage = wrapStorageWithContentValidation(baseStorage)

// Create multer upload instance with strict limits and validation
export const upload = multer({
    storage: secureStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    }
})

// Single file upload middleware
export const uploadAvatar = upload.single('avatar')

// Export cloudinary instance for deletion
export { cloudinary }
