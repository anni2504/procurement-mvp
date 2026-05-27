import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { MongoMemoryServer } from 'mongodb-memory-server'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/accounts_payable'

let isConnected = false

export async function connectDB() {
  try {
    // Try the configured URI first
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    })
    isConnected = true
    console.log('✅ Connected to MongoDB')
  } catch (err) {
    console.error('❌ MongoDB connection error with primary URI:', (err as Error).message)

    console.log('🔄 Trying local MongoDB fallback...')
    try {
      await mongoose.connect('mongodb://localhost:27017/accounts_payable', {
        serverSelectionTimeoutMS: 2000,
      })
      isConnected = true
      console.log('✅ Connected to local MongoDB')
    } catch (fallbackErr) {
      console.error('❌ Local MongoDB also failed:', (fallbackErr as Error).message)
      console.log('🔄 Starting In-Memory MongoDB as final fallback...')
      try {
        const mongod = await MongoMemoryServer.create()
        const uri = mongod.getUri()
        await mongoose.connect(uri)
        isConnected = true
        console.log('✅ Connected to In-Memory MongoDB (Data will be lost on restart)')
      } catch (memErr) {
        console.error('❌ In-Memory MongoDB also failed:', (memErr as Error).message)
        console.error('⚠️ Server will start without DB — API calls will fail')
      }
    }
  }
}

export function getDBStatus() {
  return isConnected && mongoose.connection.readyState === 1
}

export default mongoose

