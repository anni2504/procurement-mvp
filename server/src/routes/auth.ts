import { Router } from 'express'
import User from '../models/User.js'
import { verifyPassword, generateToken } from '../lib/crypto.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'

import { getDBStatus } from '../db.js'

const MOCK_USERS = [
  { id: 'mock-alice', name: 'Alice Requester', email: 'alice@company.com', role: 'requester' },
  { id: 'mock-bob', name: 'Bob Manager', email: 'bob@company.com', role: 'manager' },
  { id: 'mock-charlie', name: 'Charlie Procurement', email: 'charlie@company.com', role: 'procurement' },
  { id: 'mock-dave', name: 'Dave Warehouse', email: 'dave@company.com', role: 'warehouse' },
  { id: 'mock-victor', name: 'Victor Vendor', email: 'victor@company.com', role: 'vendor' },
  { id: 'mock-frank', name: 'Frank Finance', email: 'frank@company.com', role: 'finance' },
  { id: 'mock-admin', name: 'System Admin', email: 'admin@company.com', role: 'admin' },
]

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    let user = null
    let isMatch = false
    let userId = ''
    let userName = ''
    let userEmail = ''
    let userRole = ''

    if (getDBStatus()) {
      try {
        const dbUser = await User.findOne({ email: email.toLowerCase() })
        if (dbUser) {
          user = dbUser
          isMatch = verifyPassword(password, dbUser.passwordHash)
          userId = dbUser._id.toString()
          userName = dbUser.name
          userEmail = dbUser.email
          userRole = dbUser.role
        }
      } catch (dbErr) {
        console.warn('Database query failed, using mock auth fallback')
      }
    }

    if (!user) {
      const mockUser = MOCK_USERS.find(u => u.email === email.toLowerCase())
      if (mockUser && password === 'password123') {
        isMatch = true
        userId = mockUser.id
        userName = mockUser.name
        userEmail = mockUser.email
        userRole = mockUser.role
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken({
      id: userId,
      name: userName,
      email: userEmail,
      role: userRole,
    })

    res.json({
      token,
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole,
      },
    })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me
router.get('/me', authenticate as any, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  res.json({ user: req.user })
})

export default router
