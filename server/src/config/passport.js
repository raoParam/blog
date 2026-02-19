import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/user.js'

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
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

        // Create new user
        const newUser = await User.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            emailId: profile.emails[0].value,
            userName: profile.emails[0].value.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
            googleId: profile.id,
            avatar: profile.photos[0]?.value || '',
            isEmailVerified: true, // Google emails are pre-verified
            role: 'user',
            bio: 'Hey there! I am using Flagged',
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