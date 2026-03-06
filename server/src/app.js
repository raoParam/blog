import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'
import publicRouter from './routes/public.routes.js'
import adminRouter from './routes/admin.routes.js'
import errorHandler from './middleware/errorHandler.js'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import compression from 'compression'
import morgan from 'morgan'
import passport from './config/passport.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(passport.initialize())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

const allowedOrigins = [
  'http://localhost:5173',
  'https://flagger-fawn.vercel.app',
  process.env.CLIENT_ORIGIN,
  process.env.VERCEL_FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error('Not allowed by CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
)

// routes
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/public', publicRouter)
app.use('/api/admin', adminRouter)

app.get('/', (req, res) => {
  res.send('Backend running')
})

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' })
})

app.use(/.*/, (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot ${req.method} ${req.originalUrl}`
  })
})

app.use(errorHandler)

let server

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('DB connection failed', err)
  })

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing gracefully')
  if (!server) {
    process.exit(0)
    return
  }

  server.close(() => {
    console.log('Process terminated')
    process.exit(0)
  })
})
