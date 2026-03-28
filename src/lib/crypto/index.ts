import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET
  if (!secret) throw new Error('ENCRYPTION_SECRET env var is not set')
  // Accept hex string (64 chars = 32 bytes) or raw 32-char string
  if (secret.length === 64) return Buffer.from(secret, 'hex')
  if (secret.length === 32) return Buffer.from(secret, 'utf8')
  throw new Error('ENCRYPTION_SECRET must be 32 UTF-8 chars or 64 hex chars')
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a base64 string: IV (12 bytes) + AuthTag (16 bytes) + Ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

/**
 * Decrypts a base64 string produced by encrypt().
 */
export function decrypt(ciphertext: string): string {
  const key = getKey()
  const data = Buffer.from(ciphertext, 'base64')
  const iv = data.subarray(0, IV_LENGTH)
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted) + decipher.final('utf8')
}
