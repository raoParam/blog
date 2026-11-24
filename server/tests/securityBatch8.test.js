import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'stream'
import { wrapStorageWithContentValidation } from '../src/utils/imageValidator.js'

describe('Batch 8: upload stream failure handling', () => {
    it('absorbs an error emitted synchronously while an oversized stream is drained', async () => {
        const { EventEmitter } = await import('events')
        let baseStorageCalled = false
        const storage = wrapStorageWithContentValidation({
            _handleFile(req, file, cb) {
                baseStorageCalled = true
                cb(null, {})
            }
        }, undefined, 4)
        const stream = new EventEmitter()
        stream.resume = () => {
            stream.emit('error', new Error('drain failed'))
            stream.emit('close')
        }

        const err = await new Promise(resolve => {
            storage._handleFile({}, { stream }, resolve)
            stream.emit('data', Buffer.from('oversized'))
        })

        assert.equal(err.code, 'LIMIT_FILE_SIZE')
        assert.equal(baseStorageCalled, false)
        assert.equal(stream.listenerCount('error'), 0)
        assert.equal(stream.listenerCount('data'), 0)
        assert.equal(stream.listenerCount('end'), 0)
        assert.equal(stream.listenerCount('limit'), 0)
    })

    it('does not invoke base storage when the incoming stream errors before size limit', async () => {
        let baseStorageCalled = false
        const storage = wrapStorageWithContentValidation({
            _handleFile(req, file, cb) { baseStorageCalled = true; cb(null, {}) }
        })
        const stream = new Readable({
            read() { this.destroy(new Error('connection dropped')) }
        })
        const err = await new Promise(resolve => storage._handleFile({}, { stream }, resolve))
        assert.equal(err.message, 'connection dropped')
        assert.equal(baseStorageCalled, false)
    })
})
