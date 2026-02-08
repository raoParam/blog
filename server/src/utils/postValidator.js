
export default function validatePost(postInfo) {
    const requiredFields = ['title','content']

    const hasAllFields = requiredFields.every(field =>
        Object.keys(postInfo).includes(field)
    )

    if (!hasAllFields) {
        const err = new Error('Required fields are missing')
        err.statusCode = 400
        throw err
    }

    const { title, content, author } = postInfo

    if (title.length < 5 || title.length > 100) {
        const err = new Error('Title must be 5–100 characters long')
        err.statusCode = 400
        throw err
    }

    if (content.length > 7000 || content.length < 10) {
        const err = new Error('Content must be 10-7000 characters long')
        err.statusCode = 400
        throw err
    }
}
