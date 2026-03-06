import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'flagger/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
        public_id: (req, file) => {
            return `user-${req.user._id}-${Date.now()}`
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
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
})

// Single file upload middleware
export const uploadAvatar = upload.single('avatar')

// Export cloudinary instance for deletion
export { cloudinary }
