/**
 * Centralized Application Error Handling Middleware
 */

/**
 * Scrubs credentials and connection strings from error messages and logs.
 * @param {string} text 
 * @returns {string}
 */
function scrubSensitiveData(text) {
    if (typeof text !== 'string') return ''
    return text
        .replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, 'mongodb$1://***:***@')
        .replace(/(?:password|secret|key|token|auth)=[^&\s]+/gi, '$1=***')
}

export default function errorHandler(err, req, res, next) {
    // Determine effective status code
    let statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500)
    let message = err.message || 'Internal Server Error'

    // Server-side logging with scrubbed credentials
    const scrubbedStack = scrubSensitiveData(err.stack || String(err))
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, scrubbedStack)

    // Handle Mongoose Validation Error (client-facing 400)
    if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400
        const messages = Object.values(err.errors)
            .map(e => e.message)
            .filter(Boolean)
        message = messages.length > 0 ? messages.join(', ') : 'Validation failed'
    }

    // Handle Mongoose CastError (client-facing 400)
    else if (err.name === 'CastError') {
        statusCode = 400
        message = `Invalid identifier format for ${err.path || 'resource'}`
    }

    // Handle MongoDB duplicate key error (code 11000 -> 409)
    else if (err.code === 11000) {
        statusCode = 409
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field'
        message = `A record with this ${field} already exists`
    }

    // Handle Multer upload errors
    else if (err.name === 'MulterError') {
        statusCode = 400
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'Uploaded file exceeds the maximum allowed size limit'
        } else if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Too many files uploaded or unexpected file field'
        } else {
            message = err.message || 'File upload error'
        }
    }

    // Handle JWT Errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401
        message = 'Invalid token'
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401
        message = 'jwt expired'
    }

    // Handle CORS errors
    else if (err.message === 'Not allowed by CORS') {
        statusCode = 403
        message = 'CORS request blocked from this origin'
    }

    // Handle JSON syntax parse error from express.json()
    else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400
        message = 'Malformed JSON in request body'
    }

    // Production environment masking: NEVER expose database errors, connection strings, or 500 internals
    if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
        message = 'Internal Server Error'
    } else {
        // Scrub any accidental secret exposure from the message even in non-production
        message = scrubSensitiveData(message)
    }

    res.status(statusCode).json({
        status: 'failed',
        message
    })
}
