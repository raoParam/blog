import { Readable } from 'stream'
import path from 'path'
import sharp from 'sharp'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

/**
 * Validates and decodes image format from buffer headers (JPEG, PNG, WebP).
 * @param {Buffer} buffer
 * @returns {'jpeg'|'png'|'webp'|null}
 */
export function detectImageFormat(buffer) {
    if (!buffer || buffer.length < 12) return null

    // 1. PNG: 8-byte signature followed by IHDR chunk with dimensions
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
        buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
        return 'png'
    }

    // 2. JPEG: SOI (FF D8) + Marker (FF xx)
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return 'jpeg'
    }

    // 3. WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11)
    if (buffer.length >= 12 &&
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP') {
        return 'webp'
    }

    return null
}

/**
 * Backward-compatible helper checking whether a buffer has a valid image signature.
 * @param {Buffer} buffer
 * @returns {boolean}
 */
export function isValidImageMagicNumber(buffer) {
    return detectImageFormat(buffer) !== null
}

/**
 * Uses maintained image library (Sharp) to decode and verify image integrity and format.
 * Throws a 400 error if empty, unparseable, corrupted, or not permitted.
 * @param {Buffer} buffer
 * @param {string[]} allowedFormats
 * @returns {Promise<{ format: string, width: number, height: number }>}
 */
export async function decodeAndValidateImage(buffer, allowedFormats = ['jpeg', 'png', 'webp', 'jpg']) {
    if (!buffer || buffer.length === 0) {
        const err = new Error('Empty image file uploaded')
        err.statusCode = 400
        throw err
    }

    const normalizedAllowed = new Set(
        allowedFormats.map(f => f.toLowerCase() === 'jpg' ? 'jpeg' : f.toLowerCase())
    )

    let metadata
    try {
        const image = sharp(buffer, { failOn: 'error' })
        metadata = await image.metadata()
        // Fully decode pixel statistics to detect truncated or corrupted files
        await image.stats()
    } catch (decodeErr) {
        const err = new Error('Invalid or corrupted image: file cannot be decoded as an image')
        err.statusCode = 400
        throw err
    }

    const detectedFormat = (metadata.format || '').toLowerCase()
    if (!normalizedAllowed.has(detectedFormat)) {
        const err = new Error(`Image format "${detectedFormat}" is not permitted`)
        err.statusCode = 400
        throw err
    }

    return {
        format: detectedFormat,
        width: metadata.width,
        height: metadata.height
    }
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
 * Wraps a Multer storage engine to buffer incoming chunks across stream fragmentation,
 * fully decode and validate the image via Sharp before any byte reaches Cloudinary,
 * and preserve every byte into the upload stream if valid.
 * @param {object} baseStorage
 * @param {string[]} allowedFormats
 * @returns {object}
 */
export function wrapStorageWithContentValidation(baseStorage, allowedFormats = ['jpeg', 'png', 'webp', 'jpg'], maxBytes = 10 * 1024 * 1024) {
    return {
        _handleFile(req, file, cb) {
            const chunks = []
            let totalBytes = 0
            let finished = false

            function cleanup() {
                file.stream.removeListener('data', onData)
                file.stream.removeListener('end', onEnd)
                file.stream.removeListener('error', onError)
                file.stream.removeListener('limit', failForFileSize)
            }

            function failForFileSize() {
                if (finished) return
                finished = true

                // Stop buffering immediately, but keep a temporary error sink while
                // the remaining request stream is drained. A stream can error during
                // resume() after the normal upload listeners have been removed.
                file.stream.removeListener('data', onData)
                file.stream.removeListener('end', onEnd)
                file.stream.removeListener('limit', failForFileSize)
                file.stream.removeListener('error', onError)
                chunks.length = 0

                const cleanupDrain = () => {
                    file.stream.removeListener('error', onDrainError)
                    file.stream.removeListener('end', cleanupDrain)
                    file.stream.removeListener('close', cleanupDrain)
                }
                const onDrainError = () => {
                    // The upload has already failed; absorb drain errors to avoid an
                    // unhandled EventEmitter error. The request layer owns the response.
                }

                file.stream.on('error', onDrainError)
                file.stream.once('end', cleanupDrain)
                file.stream.once('close', cleanupDrain)

                const err = new Error('Uploaded file exceeds the maximum allowed size limit')
                err.statusCode = 413
                err.code = 'LIMIT_FILE_SIZE'
                cb(err)
                file.stream.resume()
            }

            function onData(chunk) {
                if (finished) return
                if (totalBytes + chunk.length > maxBytes) {
                    return failForFileSize()
                }
                chunks.push(chunk)
                totalBytes += chunk.length
            }

            async function onEnd() {
                if (finished) return
                finished = true
                cleanup()

                if (totalBytes === 0) {
                    chunks.length = 0
                    const err = new Error('Empty image file uploaded')
                    err.statusCode = 400
                    return cb(err)
                }

                const fullBuffer = Buffer.concat(chunks, totalBytes)
                chunks.length = 0

                try {
                    const validated = await decodeAndValidateImage(fullBuffer, allowedFormats)

                    // Replay all buffered bytes into a clean Readable stream for Cloudinary
                    const replayStream = Readable.from(fullBuffer)
                    const normalizedMime = `image/${validated.format === 'jpg' ? 'jpeg' : validated.format}`
                    let safeOriginalname = file.originalname
                    if (typeof safeOriginalname === 'string' && safeOriginalname.length > 0) {
                        const currentExt = path.extname(safeOriginalname).toLowerCase()
                        const expectedExt = validated.format === 'jpeg'
                            ? (currentExt === '.jpeg' ? '.jpeg' : '.jpg')
                            : `.${validated.format}`
                        if (currentExt && currentExt !== expectedExt && !(validated.format === 'jpeg' && currentExt === '.jpg')) {
                            safeOriginalname = `${path.basename(safeOriginalname, currentExt)}${expectedExt}`
                        }
                    }
                    const wrappedFile = {
                        ...file,
                        originalname: safeOriginalname,
                        mimetype: normalizedMime,
                        stream: replayStream,
                        detectedFormat: validated.format,
                        imageDimensions: { width: validated.width, height: validated.height }
                    }

                    baseStorage._handleFile(req, wrappedFile, cb)
                } catch (validationErr) {
                    // Invalid/corrupted image: base storage is NEVER invoked
                    cb(validationErr)
                }
            }

            function onError(err) {
                if (finished) return
                finished = true
                cleanup()
                chunks.length = 0
                cb(err)
            }

            file.stream.on('data', onData)
            file.stream.on('end', onEnd)
            file.stream.on('error', onError)
            file.stream.once('limit', failForFileSize)
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
