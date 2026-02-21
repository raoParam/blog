export default function adminAuth(req, res, next) {
    try {
        if (req.user.role !== 'admin') {
            const err = new Error('Admin access required')
            err.statusCode = 403
            throw err
        }
        next()
    } catch (err) {
        next(err)
    }
}