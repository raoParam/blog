import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'stream'
import { isValidImageMagicNumber, imageFileFilter, wrapStorageWithContentValidation } from '../src/utils/imageValidator.js'

describe('Image Upload Validation', () => {
    describe('isValidImageMagicNumber', () => {
        it('should return true for valid JPEG signature (FF D8 FF)', () => {
            const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01])
            assert.equal(isValidImageMagicNumber(jpegBuffer), true)
        })

        it('should return true for valid PNG signature (89 50 4E 47)', () => {
            const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D])
            assert.equal(isValidImageMagicNumber(pngBuffer), true)
        })

        it('should return true for valid WebP signature (RIFF ... WEBP)', () => {
            const webpBuffer = Buffer.from([
                0x52, 0x49, 0x46, 0x46, // RIFF
                0x24, 0x00, 0x00, 0x00,
                0x57, 0x45, 0x42, 0x50  // WEBP
            ])
            assert.equal(isValidImageMagicNumber(webpBuffer), true)
        })

        it('should reject text files or executables disguised as images', () => {
            const textBuffer = Buffer.from('<!DOCTYPE html><html><body><h1>Malicious</h1></body></html>')
            assert.equal(isValidImageMagicNumber(textBuffer), false)

            const exeBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]) // MZ
            assert.equal(isValidImageMagicNumber(exeBuffer), false)
        })

        it('should reject short or empty buffers', () => {
            assert.equal(isValidImageMagicNumber(Buffer.alloc(0)), false)
            assert.equal(isValidImageMagicNumber(Buffer.from([0xFF, 0xD8])), false)
            assert.equal(isValidImageMagicNumber(null), false)
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

    describe('wrapStorageWithContentValidation', () => {
        it('should allow stream with valid image content', (t, done) => {
            const mockStorage = {
                _handleFile(req, file, cb) {
                    let total = 0
                    file.stream.on('data', chunk => total += chunk.length)
                    file.stream.on('end', () => cb(null, { size: total, path: 'http://cdn/img' }))
                }
            }

            const secureStorage = wrapStorageWithContentValidation(mockStorage)
            const validBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0xAA, 0xBB])
            const stream = Readable.from([validBuffer])

            secureStorage._handleFile({}, { stream }, (err, info) => {
                assert.equal(err, null)
                assert.equal(info.size, 14)
                done()
            })
        })

        it('should reject stream with non-image content and abort upload', (t, done) => {
            let baseStorageCalled = false
            const mockStorage = {
                _handleFile(req, file, cb) {
                    baseStorageCalled = true
                    cb(null, {})
                }
            }

            const secureStorage = wrapStorageWithContentValidation(mockStorage)
            const fakeBuffer = Buffer.from('Plain text file masquerading as image')
            const stream = Readable.from([fakeBuffer])

            secureStorage._handleFile({}, { stream }, (err) => {
                assert.ok(err)
                assert.equal(err.statusCode, 400)
                assert.equal(baseStorageCalled, false)
                done()
            })
        })
    })
})
