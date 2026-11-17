import { PassThrough } from 'stream'
import path from 'path'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

/**
 * Validates that buffer starts with valid JPEG, PNG, or WebP magic numbers.
 * @param {Buffer} buffer 
 * @returns {boolean}
 */
export function isValidImageMagicNumber(buffer) {
    if (!buffer || buffer.length < 12) return false
    
    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return true
    }

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return true
    }

    // WebP: RIFF .... WEBP
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        return true
    }

    return false
}

/**
 * Multer file filter enforcing strictly allowed image MIME types and file extensions.
 */
export function imageFileFilter(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase()
    const mime = (file.mimetype || '').toLowerCase()

    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mime)) {
        const err = new Error('Only image files (JPEG, PNG, WebP) are allowed')
        err.statusCode = 400
        return cb(err, false)
    }

    cb(null, true)
}

/**
 * Wraps a Multer storage engine to inspect binary magic numbers before uploading to storage.
 * @param {object} baseStorage 
 * @returns {object}
 */
export function wrapStorageWithContentValidation(baseStorage) {
    return {
        _handleFile(req, file, cb) {
            let inspected = false
            const pass = new PassThrough()

            file.stream.once('data', (chunk) => {
                inspected = true
                if (!isValidImageMagicNumber(chunk)) {
                    file.stream.resume() // Drain stream
                    const err = new Error('Invalid image file content: file signature does not match image format')
                    err.statusCode = 400
                    return cb(err)
                }

                pass.write(chunk)
                file.stream.pipe(pass)

                const wrappedFile = { ...file, stream: pass }
                baseStorage._handleFile(req, wrappedFile, cb)
            })

            file.stream.once('end', () => {
                if (!inspected) {
                    const err = new Error('Empty file uploaded')
                    err.statusCode = 400
                    return cb(err)
                }
            })

            file.stream.once('error', (err) => cb(err))
        },
        _removeFile(req, file, cb) {
            if (typeof baseStorage._removeFile === 'function') {
                baseStorage._removeFile(req, file, cb)
            } else {
                cb(null)
            }
        }
    }
}
