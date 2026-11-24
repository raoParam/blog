import mongoose from 'mongoose'

const DEFAULT_MAX_LIMIT = 100
const DEFAULT_MAX_PAGE = 10000

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
 * Handles malformed strings, negative values, decimals, NaN, Infinity, and huge numbers safely.
 * @param {any} rawPage
 * @param {any} rawLimit
 * @param {number} defaultLimit
 * @param {number} maxLimit
 * @param {number} maxPage
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function normalizePagination(
    rawPage,
    rawLimit,
    defaultLimit = 10,
    maxLimit = DEFAULT_MAX_LIMIT,
    maxPage = DEFAULT_MAX_PAGE
) {
    const safeMaxLimit = (typeof maxLimit === 'number' && Number.isFinite(maxLimit) && maxLimit > 0)
        ? Math.floor(maxLimit)
        : 100

    const safeDefaultLimit = (typeof defaultLimit === 'number' && Number.isFinite(defaultLimit) && defaultLimit > 0)
        ? Math.min(Math.floor(defaultLimit), safeMaxLimit)
        : 10

    const safeMaxPage = (typeof maxPage === 'number' && Number.isFinite(maxPage) && maxPage > 0)
        ? Math.floor(maxPage)
        : DEFAULT_MAX_PAGE

    let page = 1
    const numPage = Number(rawPage)
    if (Number.isFinite(numPage)) {
        const intPage = Math.floor(numPage)
        if (intPage >= 1) {
            page = Math.min(intPage, safeMaxPage)
        }
    }

    let limit = safeDefaultLimit
    const numLimit = Number(rawLimit)
    if (Number.isFinite(numLimit)) {
        const intLimit = Math.floor(numLimit)
        if (intLimit >= 1) {
            limit = Math.min(intLimit, safeMaxLimit)
        }
    }

    const skip = (page - 1) * limit

    return {
        page,
        limit,
        skip
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
