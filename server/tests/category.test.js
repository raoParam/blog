import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Category from '../src/models/category.js'

describe('Category Model & Pre-save Hook', () => {
    it('should automatically generate slug from name during validation', async () => {
        const cat = new Category({
            name: 'Cloud Computing & DevOps'
        })

        // validate() triggers pre('validate') hook
        await cat.validate()

        assert.equal(cat.name, 'cloud computing & devops')
        assert.equal(cat.slug, 'cloud-computing-devops')
    })

    it('should update slug when category name is modified', async () => {
        const cat = new Category({
            name: 'Cybersecurity'
        })
        await cat.validate()
        assert.equal(cat.slug, 'cybersecurity')

        // Update name
        cat.name = 'Advanced Cybersecurity & Pentesting'
        await cat.validate()
        assert.equal(cat.slug, 'advanced-cybersecurity-pentesting')
    })

    it('should execute pre-save hook synchronously without hanging', async () => {
        const cat = new Category({
            name: 'Artificial Intelligence'
        })
        
        // Ensure that executing the pre-save hooks does not hang
        const startTime = Date.now()
        await cat.validate()
        const duration = Date.now() - startTime

        assert.equal(cat.slug, 'artificial-intelligence')
        assert.ok(duration < 500, `Execution took ${duration}ms, should complete immediately`)
    })
})
