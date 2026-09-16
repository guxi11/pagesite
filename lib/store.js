// lib/store.js — JSON-file user store (id + password + api-key)
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { randomBytes, createHash } from 'node:crypto'

const hash = s => createHash('sha256').update(s).digest('hex')

export const createStore = (dir) => {
  const file = join(dir, '.users.json')

  const load = () => existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
  const save = users => writeFileSync(file, JSON.stringify(users, null, 2), 'utf8')

  const register = (id, password) => {
    if (!id || !password) return { ok: false, error: 'id and password required' }
    if (!/^[a-zA-Z0-9_-]{2,32}$/.test(id)) return { ok: false, error: 'id must be 2-32 alphanumeric/dash/underscore chars' }
    if (password.length < 4) return { ok: false, error: 'password must be at least 4 chars' }
    const users = load()
    if (users[id]) return { ok: false, error: 'id already taken' }
    users[id] = { hash: hash(password), created: new Date().toISOString() }
    save(users)
    return { ok: true, id }
  }

  const authenticate = (id, password) => {
    if (!id || !password) return false
    const users = load()
    const user = users[id]
    if (!user) return false
    return user.hash === hash(password)
  }

  const issueApiKey = (id) => {
    const users = load()
    if (!users[id]) return null
    const apiKey = `sp_${randomBytes(16).toString('hex')}`
    users[id].apiKey = apiKey
    users[id].apiKeyIssuedAt = new Date().toISOString()
    save(users)
    return apiKey
  }

  const resolveApiKey = (key) => {
    if (!key?.startsWith('sp_')) return null
    const users = load()
    return Object.keys(users).find(id => users[id].apiKey === key) ?? null
  }

  return { register, authenticate, issueApiKey, resolveApiKey }
}
