import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-procurement-mvp-key-2026'

// ─── Password Hashing ───

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':')
  if (!salt || !hash) return false
  const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'))
}

// ─── JWT Sign / Verify (HS256 compliant) ───

function base64url(str: string | Buffer): string {
  return (typeof str === 'string' ? Buffer.from(str) : str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function fromBase64url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  return Buffer.from(base64, 'base64').toString('utf8')
}

export function generateToken(payload: Record<string, any>, expiresInSeconds = 86400): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds
  const fullPayload = { ...payload, exp }

  const part1 = base64url(JSON.stringify(header))
  const part2 = base64url(JSON.stringify(fullPayload))

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${part1}.${part2}`)
    .digest()

  const part3 = base64url(signature)
  return `${part1}.${part2}.${part3}`
}

export function verifyToken(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [part1, part2, part3] = parts
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${part1}.${part2}`)
      .digest()

    const expectedPart3 = base64url(signature)
    if (part3 !== expectedPart3) return null

    const payload = JSON.parse(fromBase64url(part2))
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null // Expired
    }
    return payload
  } catch (err) {
    return null
  }
}
