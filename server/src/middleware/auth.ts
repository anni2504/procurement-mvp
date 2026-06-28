import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/crypto.js'

export interface AuthRequest extends Request {
  user?: {
    id: string
    name: string
    email: string
    role: 'admin' | 'requester' | 'manager' | 'procurement' | 'warehouse' | 'vendor' | 'finance'
  }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' })
  }

  const token = authHeader.split(' ')[1]
  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired authorization token' })
  }

  req.user = decoded as AuthRequest['user']
  next()
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    if (req.user.role === 'admin') {
      return next() // Admin always has full access
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: role ${req.user.role} does not have access to this action` })
    }
    next()
  }
}
