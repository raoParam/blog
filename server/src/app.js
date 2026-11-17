import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import compression from 'compression'
import mongoSanitize from 'express-mongo-sanitize'
import morgan from 'morgan'

import connectDB from './config/db.js'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'
import publicRouter from './routes/public.routes.js'
import adminRouter from './routes/admin.routes.js'
import errorHandler from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Configure reverse proxy trust when deployed (e.g. Render, Heroku)
if (process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY) {
  app.set('trust proxy', 1)
}

// Security headers with cross-origin compatibility for frontend and Cloudinary media
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
  })
)

// Gzip / deflate response compression
app.use(compression())

// Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Express 5 compatible NoSQL injection sanitizer (in-place mutation avoids getter reassignment error)
app.use((req, res, next) => {
  ['body', 'params', 'query'].forEach((key) => {
    if (req[key]) {
      mongoSanitize.sanitize(req[key])
    }
  })
  next()
})

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

const allowedOrigins = [
  'http://localhost:5173',
  'https://flagger-fawn.vercel.app',
  process.env.CLIENT_URL,
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

// API routes
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

if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
      })
    })
    .catch((err) => {
      console.error('DB connection failed', err)
    })
}

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

export default app
