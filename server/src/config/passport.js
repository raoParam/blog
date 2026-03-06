import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/user.js'

const USERNAME_ALLOWED_REGEX = /^[a-z_]+$/

const randomLetters = (length = 4) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

const buildOauthUsername = async (profile) => {
    const emailPrefix = profile?.emails?.[0]?.value?.split('@')?.[0] || ''
    const givenName = profile?.name?.givenName || ''

    let base = (emailPrefix || givenName)
        .toLowerCase()
        .replace(/[^a-z_]/g, '')

    if (base.length < 5) {
        base = `${base}_user`
    }
    if (!base) {
        base = 'user_name'
    }
    base = base.slice(0, 40)

    if (!USERNAME_ALLOWED_REGEX.test(base)) {
        base = 'user_name'
    }

    let candidate = base
    let exists = await User.exists({ userName: candidate })
    let attempts = 0

    while (exists && attempts < 20) {
        const suffix = `_${randomLetters(4)}`
        const maxBaseLen = 40 - suffix.length
        candidate = `${base.slice(0, maxBaseLen)}${suffix}`
        exists = await User.exists({ userName: candidate })
        attempts += 1
    }

    if (exists) {
        const fallbackSuffix = `_${randomLetters(6)}`
        const maxBaseLen = 40 - fallbackSuffix.length
        candidate = `${'username'.slice(0, maxBaseLen)}${fallbackSuffix}`
    }

    return candidate
}

const sanitizeName = (value = '') => {
    const cleaned = value.trim().replace(/[^A-Za-z_]/g, '')
    return cleaned.length >= 3 ? cleaned : undefined
}

const fallbackBackendUrl = 'https://blog-6isi.onrender.com'
const backendUrlFromEnv = process.env.BACKEND_URL?.trim()
const backendUrl =
  backendUrlFromEnv && !backendUrlFromEnv.includes('localhost')
    ? backendUrlFromEnv.replace(/\/+$/, '')
    : fallbackBackendUrl

const safeFallbackCallbackURL = `${backendUrl}/api/auth/google/callback`
const callbackFromEnv = process.env.GOOGLE_CALLBACK_URL?.trim()

const isUnsafeCallbackUrl =
  !callbackFromEnv ||
  callbackFromEnv.includes('localhost') ||
  !callbackFromEnv.includes('/api/auth/google/callback')

const callbackURL = isUnsafeCallbackUrl ? safeFallbackCallbackURL : callbackFromEnv

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists with this googleId
        let user = await User.findOne({ googleId: profile.id })
        
        if (user) {
            return done(null, user)
        }

        // Check if user exists with same email
        user = await User.findOne({ emailId: profile.emails[0].value })
        
        if (user) {
            // Link Google account to existing user
            user.googleId = profile.id
            await user.save()
            return done(null, user)
        }

        const generatedUserName = await buildOauthUsername(profile)

        // Create new user
        const newUser = await User.create({
            firstName: sanitizeName(profile.name.givenName),
            lastName: sanitizeName(profile.name.familyName),
            emailId: profile.emails[0].value,
            userName: generatedUserName,
            googleId: profile.id,
            avatar: profile.photos[0]?.value || '',
            isEmailVerified: true, // Google emails are pre-verified
            role: 'user',
            bio: 'Hey there! I am using Flagger',
            accountStatus: 'active',
            followers: [],
            following: [],
            savedPosts: [],
            refreshTokenVersion: 0
        })

        done(null, newUser)
    } catch (error) {
        done(error, null)
    }
}))

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})

export default passport
