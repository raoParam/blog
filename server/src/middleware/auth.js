export default function auth(req, res, next) {
    try {
        console.log('Auth middleware placeholder')
        next()
    } catch (error) {
        res.status(401).json({
            status: 'Failed',
            message: 'Unauthorized access'
        })
    }
}
