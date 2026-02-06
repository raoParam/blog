import validator from 'validator'

export default function validate(userInfo) {
    const requiredFields = ['userName', 'emailId', 'password']

    const hasAllFields = requiredFields.every(field =>
        Object.keys(userInfo).includes(field)
    )

    if (!hasAllFields) {
        const err = new Error('Required fields are missing')
        err.statusCode = 400
        throw err
    }

    const { userName, emailId, password } = userInfo

    if (userName.length < 5 || userName.length > 40) {
        const err = new Error('Username must be 5–40 characters long')
        err.statusCode = 400
        throw err
    }

    if (!validator.isEmail(emailId)) {
        const err = new Error('Invalid email address')
        err.statusCode = 400
        throw err
    }

    if (!validator.isStrongPassword(password)) {
        const err = new Error('Password is not strong enough')
        err.statusCode = 400
        throw err
    }
}
