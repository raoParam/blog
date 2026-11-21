import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'stream'
import { 
    isValidImageMagicNumber, 
    detectImageFormat, 
    decodeAndValidateImage,
    imageFileFilter, 
    wrapStorageWithContentValidation 
} from '../src/utils/imageValidator.js'

describe('Image Upload Validation', () => {
    // 1x1 valid decodable images
    const validPngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4z8AAAAMBAQCc479ZAAAAAElFTkSuQmCC',
        'base64'
    )

    const validJpegBuffer = Buffer.from(
        '/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABgj/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABykX//Z',
        'base64'
    )

    const validWebpBuffer = Buffer.from(
        'UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoBAAEAAUAmJaACdLoB+AADsAD+8ut//NgVzXPv9//S4P0uD9Lg/9KQAAA=',
        'base64'
    )

    // Valid 1x1 GIF (valid image, but not in default allowed formats JPEG/PNG/WebP)
    const validGifBuffer = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
    )

    // Malformed/corrupted image buffers (has image header but corrupted/truncated payload)
    const corruptedJpegBuffer = Buffer.concat([
        validJpegBuffer.subarray(0, 10),
        Buffer.from('corrupted truncated binary data that cannot be decoded')
    ])

    const corruptedPngBuffer = Buffer.concat([
        validPngBuffer.subarray(0, 16),
        Buffer.from('garbage data replacing chunk body')
    ])

    describe('detectImageFormat & isValidImageMagicNumber (Header Checks)', () => {
        it('should correctly detect valid JPEG signature and segments', () => {
            assert.equal(detectImageFormat(validJpegBuffer), 'jpeg')
            assert.equal(isValidImageMagicNumber(validJpegBuffer), true)
        })

        it('should correctly detect valid PNG signature and IHDR chunk', () => {
            assert.equal(detectImageFormat(validPngBuffer), 'png')
            assert.equal(isValidImageMagicNumber(validPngBuffer), true)
        })

        it('should correctly detect valid WebP signature and chunks', () => {
            assert.equal(detectImageFormat(validWebpBuffer), 'webp')
            assert.equal(isValidImageMagicNumber(validWebpBuffer), true)
        })

        it('should reject text files disguised with image headers', () => {
            const fakeHtml = Buffer.from('<!DOCTYPE html><html><body><h1>Exploit</h1></body></html>')
            assert.equal(detectImageFormat(fakeHtml), null)
            assert.equal(isValidImageMagicNumber(fakeHtml), false)
        })

        it('should reject executables disguised as images', () => {
            const exeBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00])
            assert.equal(detectImageFormat(exeBuffer), null)
            assert.equal(isValidImageMagicNumber(exeBuffer), false)
        })

        it('should reject empty or undersized buffers', () => {
            assert.equal(detectImageFormat(Buffer.alloc(0)), null)
            assert.equal(detectImageFormat(Buffer.from([0xFF, 0xD8])), null)
            assert.equal(detectImageFormat(null), null)
        })
    })

    describe('decodeAndValidateImage (Full Image Decoding via Sharp)', () => {
        it('should successfully decode and return metadata for valid PNG', async () => {
            const result = await decodeAndValidateImage(validPngBuffer)
            assert.equal(result.format, 'png')
            assert.equal(result.width, 1)
            assert.equal(result.height, 1)
        })

        it('should successfully decode and return metadata for valid JPEG', async () => {
            const result = await decodeAndValidateImage(validJpegBuffer)
            assert.equal(result.format, 'jpeg')
            assert.equal(result.width, 1)
            assert.equal(result.height, 1)
        })

        it('should successfully decode and return metadata for valid WebP', async () => {
            const result = await decodeAndValidateImage(validWebpBuffer)
            assert.equal(result.format, 'webp')
            assert.equal(result.width, 1)
            assert.equal(result.height, 1)
        })

        it('should reject empty buffer with 400', async () => {
            await assert.rejects(
                async () => decodeAndValidateImage(Buffer.alloc(0)),
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.equal(err.message, 'Empty image file uploaded')
                    return true
                }
            )
        })

        it('should reject corrupted JPEG payload that cannot be decoded', async () => {
            await assert.rejects(
                async () => decodeAndValidateImage(corruptedJpegBuffer),
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.ok(err.message.includes('Invalid or corrupted image'))
                    return true
                }
            )
        })

        it('should reject corrupted PNG payload that cannot be decoded', async () => {
            await assert.rejects(
                async () => decodeAndValidateImage(corruptedPngBuffer),
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.ok(err.message.includes('Invalid or corrupted image'))
                    return true
                }
            )
        })

        it('should reject truncated JPEG file with 400 error', async () => {
            const truncatedJpeg = validJpegBuffer.subarray(0, Math.floor(validJpegBuffer.length / 2))
            await assert.rejects(
                async () => decodeAndValidateImage(truncatedJpeg),
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.ok(err.message.includes('Invalid or corrupted image'))
                    return true
                }
            )
        })

        it('should reject truncated PNG file with 400 error', async () => {
            const truncatedPng = validPngBuffer.subarray(0, validPngBuffer.length - 15)
            await assert.rejects(
                async () => decodeAndValidateImage(truncatedPng),
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.ok(err.message.includes('Invalid or corrupted image'))
                    return true
                }
            )
        })

        it('should reject truncated WebP file with 400 error', async () => {
            const truncatedWebp = validWebpBuffer.subarray(0, validWebpBuffer.length - 15)
            await assert.rejects(
                async () => decodeAndValidateImage(truncatedWebp),
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.ok(err.message.includes('Invalid or corrupted image'))
                    return true
                }
            )
        })

        it('should reject non-image text file', async () => {
            const textBuffer = Buffer.from('This is a text file, not an image.')
            await assert.rejects(
                async () => decodeAndValidateImage(textBuffer),
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.ok(err.message.includes('Invalid or corrupted image'))
                    return true
                }
            )
        })

        it('should reject valid image format if not in permitted list (e.g. GIF)', async () => {
            await assert.rejects(
                async () => decodeAndValidateImage(validGifBuffer, ['jpeg', 'png', 'webp']),
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.equal(err.message, 'Image format "gif" is not permitted')
                    return true
                }
            )
        })
    })

    describe('imageFileFilter', () => {
        it('should accept valid image extensions and mimetypes', (t, done) => {
            const file = { originalname: 'avatar.png', mimetype: 'image/png' }
            imageFileFilter({}, file, (err, accept) => {
                assert.equal(err, null)
                assert.equal(accept, true)
                done()
            })
        })

        it('should reject disallowed mimetypes even if extension looks like an image', (t, done) => {
            const file = { originalname: 'photo.jpg', mimetype: 'application/octet-stream' }
            imageFileFilter({}, file, (err, accept) => {
                assert.ok(err)
                assert.equal(err.statusCode, 400)
                assert.equal(accept, false)
                done()
            })
        })

        it('should reject disallowed extensions even if mimetype looks like an image', (t, done) => {
            const file = { originalname: 'script.js', mimetype: 'image/jpeg' }
            imageFileFilter({}, file, (err, accept) => {
                assert.ok(err)
                assert.equal(err.statusCode, 400)
                assert.equal(accept, false)
                done()
            })
        })

        it('should reject SVG files due to XSS risk', (t, done) => {
            const file = { originalname: 'graphic.svg', mimetype: 'image/svg+xml' }
            imageFileFilter({}, file, (err, accept) => {
                assert.ok(err)
                assert.equal(accept, false)
                done()
            })
        })
    })

    describe('wrapStorageWithContentValidation (Stream Handling & Cloudinary Protection)', () => {
        it('should reassemble fragmented 1-byte chunks and preserve every byte', (t, done) => {
            const oneByteChunks = []
            for (let i = 0; i < validPngBuffer.length; i++) {
                oneByteChunks.push(validPngBuffer.subarray(i, i + 1))
            }

            const mockStorage = {
                _handleFile(req, file, cb) {
                    const received = []
                    file.stream.on('data', chunk => received.push(chunk))
                    file.stream.on('end', () => {
                        const assembled = Buffer.concat(received)
                        assert.equal(assembled.length, validPngBuffer.length)
                        assert.ok(assembled.equals(validPngBuffer), 'Stream must match original buffer exactly')
                        cb(null, { size: assembled.length, format: file.detectedFormat })
                    })
                }
            }

            const secureStorage = wrapStorageWithContentValidation(mockStorage)
            const stream = Readable.from(oneByteChunks)

            secureStorage._handleFile({}, { stream }, (err, info) => {
                assert.equal(err, null)
                assert.equal(info.size, validPngBuffer.length)
                assert.equal(info.format, 'png')
                done()
            })
        })

        it('should reject empty stream (0 bytes) with 400 error', (t, done) => {
            let baseStorageCalled = false
            const mockStorage = {
                _handleFile(req, file, cb) {
                    baseStorageCalled = true
                    cb(null, {})
                }
            }

            const secureStorage = wrapStorageWithContentValidation(mockStorage)
            const emptyStream = Readable.from([])

            secureStorage._handleFile({}, { stream: emptyStream }, (err) => {
                assert.ok(err)
                assert.equal(err.statusCode, 400)
                assert.equal(err.message, 'Empty image file uploaded')
                assert.equal(baseStorageCalled, false, 'Base storage must never be called for empty files')
                done()
            })
        })

        it('should reject fragmented invalid text stream before calling base storage', (t, done) => {
            let baseStorageCalled = false
            const mockStorage = {
                _handleFile(req, file, cb) {
                    baseStorageCalled = true
                    cb(null, {})
                }
            }

            const secureStorage = wrapStorageWithContentValidation(mockStorage)
            const textChunks = [
                Buffer.from('Hello '),
                Buffer.from('this is '),
                Buffer.from('not an image file!'),
                Buffer.from(' Just plain text data.')
            ]
            const stream = Readable.from(textChunks)

            secureStorage._handleFile({}, { stream }, (err) => {
                assert.ok(err)
                assert.equal(err.statusCode, 400)
                assert.equal(baseStorageCalled, false, 'Base storage must never receive invalid files')
                done()
            })
        })

        it('should reject corrupted image payload before calling base storage', (t, done) => {
            let baseStorageCalled = false
            const mockStorage = {
                _handleFile(req, file, cb) {
                    baseStorageCalled = true
                    cb(null, {})
                }
            }

            const secureStorage = wrapStorageWithContentValidation(mockStorage)
            const stream = Readable.from([corruptedJpegBuffer])

            secureStorage._handleFile({}, { stream }, (err) => {
                assert.ok(err)
                assert.equal(err.statusCode, 400)
                assert.ok(err.message.includes('Invalid or corrupted image'))
                assert.equal(baseStorageCalled, false, 'Base storage must never receive corrupted files')
                done()
            })
        })

        it('should reject truncated image stream before calling base storage', (t, done) => {
            let baseStorageCalled = false
            const mockStorage = {
                _handleFile(req, file, cb) {
                    baseStorageCalled = true
                    cb(null, {})
                }
            }

            const secureStorage = wrapStorageWithContentValidation(mockStorage)
            const truncatedBuffer = validJpegBuffer.subarray(0, Math.floor(validJpegBuffer.length / 2))
            const stream = Readable.from([truncatedBuffer])

            secureStorage._handleFile({}, { stream }, (err) => {
                assert.ok(err)
                assert.equal(err.statusCode, 400)
                assert.ok(err.message.includes('Invalid or corrupted image'))
                assert.equal(baseStorageCalled, false, 'Base storage must never receive truncated files')
                done()
            })
        })

        it('should enforce allowed formats and reject format not in permitted list', (t, done) => {
            let baseStorageCalled = false
            const mockStorage = {
                _handleFile(req, file, cb) {
                    baseStorageCalled = true
                    cb(null, {})
                }
            }

            // Only allow PNG; valid JPEG should be rejected
            const pngOnlyStorage = wrapStorageWithContentValidation(mockStorage, ['png'])
            const stream = Readable.from([validJpegBuffer])

            pngOnlyStorage._handleFile({}, { stream }, (err) => {
                assert.ok(err)
                assert.equal(err.statusCode, 400)
                assert.ok(err.message.includes('not permitted'))
                assert.equal(baseStorageCalled, false)
                done()
            })
        })

        it('should successfully upload valid JPEG and WebP images', (t, done) => {
            const mockStorage = {
                _handleFile(req, file, cb) {
                    const received = []
                    file.stream.on('data', chunk => received.push(chunk))
                    file.stream.on('end', () => {
                        const assembled = Buffer.concat(received)
                        cb(null, { size: assembled.length, format: file.detectedFormat })
                    })
                }
            }

            const secureStorage = wrapStorageWithContentValidation(mockStorage)
            const stream = Readable.from([validJpegBuffer])

            secureStorage._handleFile({}, { stream }, (err, info) => {
                assert.equal(err, null)
                assert.equal(info.format, 'jpeg')
                assert.equal(info.size, validJpegBuffer.length)
                done()
            })
        })

        it('should propagate stream errors and prevent base storage call', (t, done) => {
            let baseStorageCalled = false
            const mockStorage = {
                _handleFile(req, file, cb) {
                    baseStorageCalled = true
                    cb(null, {})
                }
            }

            const secureStorage = wrapStorageWithContentValidation(mockStorage)
            const failingStream = new Readable({
                read() {
                    this.destroy(new Error('Network stream error'))
                }
            })

            secureStorage._handleFile({}, { stream: failingStream }, (err) => {
                assert.ok(err)
                assert.equal(err.message, 'Network stream error')
                assert.equal(baseStorageCalled, false)
                done()
            })
        })
    })
})
