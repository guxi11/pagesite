// lib/store.js — JSON-file user store (id + token)
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { randomBytes, createHash } from 'node:crypto'

const hash = token => createHash('sha256').update(token).digest('hex')

export const createStore = (dir) => {
  const file = join(dir, '.users.json')

  const load = () => existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
  const save = users => writeFileSync(file, JSON.stringify(users, null, 2), 'utf8')

  const register = (id, token) => {
    if (!id || !token) return { ok: false, error: 'id and token required' }
    if (!/^[a-zA-Z0-9_-]{2,32}$/.test(id)) return { ok: false, error: 'id must be 2-32 alphanumeric/dash/underscore chars' }
    if (token.length < 4) return { ok: false, error: 'token must be at least 4 chars' }
    const users = load()
    if (users[id]) return { ok: false, error: 'id already taken' }
    users[id] = { hash: hash(token), created: new Date().toISOString() }
    save(users)
    return { ok: true, id }
  }

  const authenticate = (id, token) => {
    if (!id || !token) return false
    const users = load()
    const user = users[id]
    if (!user) return false
    return user.hash === hash(token)
  }

  const genId = () => randomBytes(4).toString('hex')

  return { register, authenticate, genId }
}
