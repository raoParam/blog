// utils/cloudinaryHelper.js
export const getPublicIdFromUrl = (url, folder) => {
    try {
        // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.jpg
        const urlParts = url.split('/')
        const publicIdWithExtension = urlParts[urlParts.length - 1]
        const publicId = `${folder}/${publicIdWithExtension.split('.')[0]}`
        return publicId
    } catch (error) {
        return null
    }
}