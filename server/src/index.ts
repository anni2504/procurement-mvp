import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB, getDBStatus } from './db.js'
import { seedDatabase } from './seed.js'
import workflowRoutes from './routes/workflows.js'
import vendorRoutes from './routes/vendors.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/workflows', workflowRoutes)
app.use('/api/vendors', vendorRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: getDBStatus() ? 'connected' : 'disconnected' })
})

// Start server — connect to DB first, but start even if DB fails
async function start() {
  await connectDB()
  if (getDBStatus()) {
    await seedDatabase()
  }
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

start()

