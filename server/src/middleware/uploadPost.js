import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure Cloudinary storage for posts
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'flagged/posts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit' }],
        public_id: (req, file) => {
            return `post-${req.user._id}-${Date.now()}`
        }
    }
})

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Only image files are allowed'), false)
    }
}

// Create multer upload instance
export const uploadPostImages = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).array('images', 5) // Max 5 images

// Export cloudinary instance for deletion
export { cloudinary }