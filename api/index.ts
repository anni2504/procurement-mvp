import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB, getDBStatus } from '../server/src/db.js'
import { seedDatabase } from '../server/src/seed.js'
import workflowRoutes from '../server/src/routes/workflows.js'
import vendorRoutes from '../server/src/routes/vendors.js'
import authRoutes from '../server/src/routes/auth.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Middleware to ensure DB connection is active before handling routes
let isDbConnected = false
app.use(async (req, res, next) => {
  if (!isDbConnected) {
    try {
      await connectDB()
      if (getDBStatus()) {
        await seedDatabase()
      }
      isDbConnected = true
    } catch (err) {
      console.error('Database connection error in serverless function:', err)
    }
  }
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/workflows', workflowRoutes)
app.use('/api/vendors', vendorRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: getDBStatus() ? 'connected' : 'disconnected' })
})

export default app
