import { PassThrough } from 'stream'
import path from 'path'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const MIN_HEADER_BYTES = 32

/**
 * Validates and decodes image format from buffer headers (JPEG, PNG, WebP).
 * Does not rely solely on simple 3-byte prefix; decodes header structures/chunks.
 * @param {Buffer} buffer 
 * @returns {'jpeg'|'png'|'webp'|null}
 */
export function detectImageFormat(buffer) {
    if (!buffer || buffer.length < 12) return null

    // 1. PNG: 8-byte signature followed by IHDR chunk with dimensions
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
        buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
        if (buffer.length >= 24) {
            const chunkType = buffer.toString('ascii', 12, 16)
            if (chunkType === 'IHDR') {
                const width = buffer.readUInt32BE(16)
                const height = buffer.readUInt32BE(20)
                if (width > 0 && height > 0) {
                    return 'png'
                }
            }
        } else {
            return 'png'
        }
    }

    // 2. JPEG: SOI (FF D8) + Marker (FF xx) + segment length
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        const marker = buffer[3]
        // Standard markers following SOI: APP0-APP15 (E0-EF), DQT (DB), SOF0-SOF2 (C0-C3), DRI (DD), COM (FE)
        if ((marker >= 0xE0 && marker <= 0xEF) || marker === 0xDB || (marker >= 0xC0 && marker <= 0xC3) || marker === 0xDD || marker === 0xFE) {
            if (buffer.length >= 6) {
                const markerLen = buffer.readUInt16BE(4)
                if (markerLen >= 2) {
                    return 'jpeg'
                }
            } else {
                return 'jpeg'
            }
        }
    }

    // 3. WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11) + VP8 / VP8L / VP8X chunk
    if (buffer.length >= 12 &&
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP') {
        if (buffer.length >= 16) {
            const chunkType = buffer.toString('ascii', 12, 16)
            if (chunkType === 'VP8 ' || chunkType === 'VP8L' || chunkType === 'VP8X') {
                return 'webp'
            }
        } else {
            return 'webp'
        }
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
 * validate image format headers before any byte reaches Cloudinary, and preserve all bytes.
 * @param {object} baseStorage 
 * @param {string[]} allowedFormats
 * @returns {object}
 */
export function wrapStorageWithContentValidation(baseStorage, allowedFormats = ['jpeg', 'png', 'webp', 'jpg']) {
    const normalizedAllowed = new Set(allowedFormats.map(f => f.toLowerCase() === 'jpg' ? 'jpeg' : f.toLowerCase()))

    return {
        _handleFile(req, file, cb) {
            const chunks = []
            let totalBytes = 0
            let evaluated = false

            function cleanup() {
                file.stream.removeListener('data', onData)
                file.stream.removeListener('end', onEnd)
                file.stream.removeListener('error', onError)
            }

            function onData(chunk) {
                if (evaluated) return
                chunks.push(chunk)
                totalBytes += chunk.length

                if (totalBytes >= MIN_HEADER_BYTES) {
                    evaluated = true
                    cleanup()
                    file.stream.pause()

                    const headerBuffer = Buffer.concat(chunks, totalBytes)
                    const detectedFormat = detectImageFormat(headerBuffer)

                    if (!detectedFormat) {
                        file.stream.resume() // Drain stream
                        const err = new Error('Invalid image file content: file signature does not match any supported image format')
                        err.statusCode = 400
                        return cb(err)
                    }

                    if (!normalizedAllowed.has(detectedFormat)) {
                        file.stream.resume() // Drain stream
                        const err = new Error(`Image format "${detectedFormat}" is not permitted`)
                        err.statusCode = 400
                        return cb(err)
                    }

                    // Validated successfully. Replay every buffered byte into PassThrough and pipe remaining.
                    const pass = new PassThrough()
                    for (const c of chunks) {
                        pass.write(c)
                    }
                    file.stream.pipe(pass)
                    file.stream.resume()

                    const wrappedFile = { ...file, stream: pass, detectedFormat }
                    baseStorage._handleFile(req, wrappedFile, cb)
                }
            }

            function onEnd() {
                if (evaluated) return
                evaluated = true
                cleanup()

                if (totalBytes === 0) {
                    const err = new Error('Empty image file uploaded')
                    err.statusCode = 400
                    return cb(err)
                }

                // If file is smaller than MIN_HEADER_BYTES but has ended
                const headerBuffer = Buffer.concat(chunks, totalBytes)
                const detectedFormat = detectImageFormat(headerBuffer)

                if (!detectedFormat) {
                    const err = new Error('Invalid or corrupted image: file too small or invalid signature')
                    err.statusCode = 400
                    return cb(err)
                }

                if (!normalizedAllowed.has(detectedFormat)) {
                    const err = new Error(`Image format "${detectedFormat}" is not permitted`)
                    err.statusCode = 400
                    return cb(err)
                }

                const pass = new PassThrough()
                for (const c of chunks) {
                    pass.write(c)
                }
                pass.end()

                const wrappedFile = { ...file, stream: pass, detectedFormat }
                baseStorage._handleFile(req, wrappedFile, cb)
            }

            function onError(err) {
                if (evaluated) return
                evaluated = true
                cleanup()
                cb(err)
            }

            file.stream.on('data', onData)
            file.stream.on('end', onEnd)
            file.stream.on('error', onError)
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
