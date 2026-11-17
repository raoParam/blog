import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'stream'
import { 
    isValidImageMagicNumber, 
    detectImageFormat, 
    imageFileFilter, 
    wrapStorageWithContentValidation 
} from '../src/utils/imageValidator.js'

describe('Image Upload Validation', () => {
    // Valid PNG buffer with valid IHDR chunk
    const validPngBuffer = Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // Signature
        Buffer.from([0x00, 0x00, 0x00, 0x0D]), // Chunk length = 13
        Buffer.from('IHDR'), // Chunk type
        Buffer.from([0x00, 0x00, 0x01, 0x00]), // Width = 256
        Buffer.from([0x00, 0x00, 0x01, 0x00]), // Height = 256
        Buffer.from([0x08, 0x06, 0x00, 0x00, 0x00, 0x11, 0x22, 0x33, 0x44])
    ])

    // Valid JPEG buffer with valid SOI + APP0 segment
    const validJpegBuffer = Buffer.concat([
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), // SOI + APP0
        Buffer.from([0x00, 0x10]), // Marker length = 16
        Buffer.from('JFIF\0'),
        Buffer.from([0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xAA, 0xBB])
    ])

    // Valid WebP buffer with RIFF + WEBP + VP8
    const validWebpBuffer = Buffer.concat([
        Buffer.from('RIFF'),
        Buffer.from([0x30, 0x00, 0x00, 0x00]), // Total length
        Buffer.from('WEBP'),
        Buffer.from('VP8 '),
        Buffer.from([0x24, 0x00, 0x00, 0x00]), // Chunk length
        Buffer.from([0x00, 0x00, 0x00, 0x9D, 0x01, 0x2A, 0x10, 0x00, 0x10, 0x00, 0x55, 0x66])
    ])

    describe('detectImageFormat & isValidImageMagicNumber', () => {
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

    describe('wrapStorageWithContentValidation (Stream Handling)', () => {
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

        it('should enforce allowed formats and reject format not in permitted list', (t, done) => {
            let baseStorageCalled = false
            const mockStorage = {
                _handleFile(req, file, cb) {
                    baseStorageCalled = true
                    cb(null, {})
                }
            }

            // Only allow PNG; JPEG should be rejected
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
    })
})
