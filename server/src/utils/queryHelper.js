import mongoose from 'mongoose'

/**
 * Escapes regex special characters to prevent ReDoS and regex injection.
 * @param {string} str
 * @returns {string}
 */
export function escapeRegex(str) {
    if (typeof str !== 'string') return ''
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Normalizes and bounds pagination parameters.
 * @param {any} page 
 * @param {any} limit 
 * @param {number} defaultLimit 
 * @param {number} maxLimit 
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function normalizePagination(page, limit, defaultLimit = 10, maxLimit = 100) {
    const parsedPage = parseInt(page, 10)
    const validPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1

    const parsedLimit = parseInt(limit, 10)
    let validLimit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : defaultLimit
    if (validLimit > maxLimit) {
        validLimit = maxLimit
    }

    return {
        page: validPage,
        limit: validLimit,
        skip: (validPage - 1) * validLimit
    }
}

/**
 * Validates whether the given value is a valid 24-character hex MongoDB ObjectId.
 * @param {any} id 
 * @returns {boolean}
 */
export function isValidObjectId(id) {
    if (!id) return false
    return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id.toString()
}

/**
 * Validates whether the given string or value represents a valid date.
 * @param {any} dateStr 
 * @returns {boolean}
 */
export function isValidDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string' && !(dateStr instanceof Date)) return false
    const d = new Date(dateStr)
    return d instanceof Date && !isNaN(d.getTime())
}
