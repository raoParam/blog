import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'
import publicRouter from './routes/public.routes.js'
import errorHandler from './middleware/errorHandler.js'

dotenv.config()

const app = express()
app.use(express.json())

// routes
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/public', publicRouter)

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' })
})

app.use(errorHandler)

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`)
        })
    })
    .catch(err => {
        console.error('DB connection failed', err)
    })
