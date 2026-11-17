import mongoose from 'mongoose'

const { Schema } = mongoose

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        default: ''
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

// Generate slug before validation to satisfy required constraint
categorySchema.pre('validate', function() {
    if (this.name && (!this.slug || this.isModified('name'))) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }
})

// Ensure slug is kept in sync on direct save
categorySchema.pre('save', function() {
    if (this.isModified('name') || !this.slug) {
        if (this.name) {
            this.slug = this.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
        }
    }
})

export default mongoose.model('Category', categorySchema)
