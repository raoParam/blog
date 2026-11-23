import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { PassThrough } from 'stream'
import { wrapStorageWithContentValidation } from '../src/utils/imageValidator.js'

describe('Image upload size guard', () => {
    it('rejects a stream that exceeds its configured byte limit before storage is called', async () => {
        let storageCalled = false
        const storage = {
            _handleFile(req, file, cb) {
                storageCalled = true
                cb(null, {})
            }
        }
        const stream = new PassThrough()
        const wrappedStorage = wrapStorageWithContentValidation(storage, undefined, 4)

        const result = new Promise(resolve => {
            wrappedStorage._handleFile({}, { stream }, err => resolve(err))
        })

        stream.end(Buffer.from('12345'))

        const err = await result
        assert.equal(err.code, 'LIMIT_FILE_SIZE')
        assert.equal(err.statusCode, 413)
        assert.equal(storageCalled, false)
    })

})
