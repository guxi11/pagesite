// lib/server.js — HTTP(S) static server + upload API + web UI + user auth
import http from 'node:http'
import https from 'node:https'
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { genCode, seal, sealedPage } from './seal.js'
import { uploadPage } from './ui.js'
import { guidePage } from './guide.js'
import { createStore } from './store.js'

const MAX_BODY = 50 * 1024 * 1024 // 50MB
const VALID_NAME = /^[a-zA-Z0-9_.-]+\.html?$/

const readBody = (req, limit) => new Promise((resolve, reject) => {
  const chunks = []
  let size = 0
  req.on('data', c => { size += c.length; size > limit ? reject(new Error('body too large')) : chunks.push(c) })
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  req.on('error', reject)
})

const json = (res, code, data) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(data)) }
const txt = (res, code, msg) => { res.writeHead(code, { 'content-type': 'text/plain' }); res.end(msg) }

export const createServer = ({ dir, port = 3000, token, tlsCert, tlsKey, publicUrl, trustProxy }) => {
  mkdirSync(dir, { recursive: true })
  const store = createStore(dir)

  const resolvePublicUrl = (req) => {
    if (publicUrl) return publicUrl.replace(/\/+$/, '')
    if (trustProxy) {
      const proto = req.headers['x-forwarded-proto'] || (tlsCert ? 'https' : 'http')
      const host = req.headers['x-forwarded-host'] || req.headers.host
      return `${proto}://${host}`
    }
    const scheme = tlsCert ? 'https' : 'http'
    return `${scheme}://${req.headers.host || `0.0.0.0:${port}`}`
  }

  const authorize = (req) => {
    const auth = req.headers.authorization
    if (!auth) return null
    const t = auth.replace(/^Bearer\s+/i, '')
    if (token && t === token) return '__admin__'
    return store.resolveApiKey(t)
  }

  const handler = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const path = decodeURIComponent(url.pathname)

    // --- API routes (POST) ---
    if (req.method === 'POST') {
      if (path === '/api/register') {
        let body
        try { body = JSON.parse(await readBody(req, 4096)) } catch { return json(res, 400, { ok: false, error: 'invalid json' }) }
        try {
          const password = body.password ?? body.token
          const result = store.register(body.id, password)
          return json(res, result.ok ? 201 : 400, result)
        } catch (e) { return json(res, 500, { ok: false, error: e.message }) }
      }
      if (path === '/api/login') {
        let body
        try { body = JSON.parse(await readBody(req, 4096)) } catch { return json(res, 400, { ok: false, error: 'invalid json' }) }
        const password = body.password ?? body.token
        if (!body.id || !password) return json(res, 400, { ok: false, error: 'id and password required' })
        try {
          const valid = store.authenticate(body.id, password)
          if (!valid) return json(res, 401, { ok: false, error: 'invalid id or password' })
          const apiKey = store.issueApiKey(body.id)
          return json(res, 200, { ok: true, id: body.id, apiKey })
        } catch (e) { return json(res, 500, { ok: false, error: e.message }) }
      }
      return json(res, 404, { ok: false, error: 'not found' })
    }

    // --- GET routes ---
    if (req.method === 'GET') {
      if (path === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
        return res.end(uploadPage())
      }
      if (path === '/guide') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
        return res.end(guidePage())
      }
      if (path === '/api/list') {
        const files = readdirSync(dir).filter(f => /\.html?$/.test(f)).map(f => {
          const s = statSync(join(dir, f))
          return { name: f, size: s.size, mtime: s.mtime.toISOString() }
        })
        return json(res, 200, files)
      }
      const name = path.slice(1)
      if (VALID_NAME.test(name) && !name.includes('..')) {
        try {
          const content = readFileSync(join(dir, name), 'utf8')
          res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
          return res.end(content)
        } catch { return txt(res, 404, 'not found') }
      }
      return txt(res, 404, 'not found')
    }

    // --- PUT upload ---
    if (req.method === 'PUT') {
      const name = path.slice(1)
      if (!VALID_NAME.test(name) || name.includes('..')) return txt(res, 400, 'invalid filename')
      const userId = authorize(req)
      if (!userId) return txt(res, 403, 'forbidden')

      let body
      try { body = await readBody(req, MAX_BODY) } catch (e) { return txt(res, 413, e.message) }

      const base = resolvePublicUrl(req)
      const doSeal = url.searchParams.get('seal') === 'true'
      let result
      if (doSeal) {
        const code = genCode()
        const sealed = sealedPage(seal(body, code))
        writeFileSync(join(dir, name), sealed, 'utf8')
        result = { url: `${base}/${name}`, code }
      } else {
        writeFileSync(join(dir, name), body, 'utf8')
        result = { url: `${base}/${name}` }
      }
      return json(res, 201, result)
    }

    // --- DELETE ---
    if (req.method === 'DELETE') {
      const name = path.slice(1)
      if (!VALID_NAME.test(name) || name.includes('..')) return txt(res, 400, 'invalid filename')
      const userId = authorize(req)
      if (!userId) return txt(res, 403, 'forbidden')
      try {
        unlinkSync(join(dir, name))
        return json(res, 200, { deleted: name })
      } catch { return txt(res, 404, 'not found') }
    }

    txt(res, 405, 'method not allowed')
  }

  const requestHandler = (req, res) => { handler(req, res).catch(e => json(res, 500, { ok: false, error: e.message })) }

  const server = tlsCert
    ? https.createServer({ cert: readFileSync(tlsCert), key: readFileSync(tlsKey) }, requestHandler)
    : http.createServer(requestHandler)

  server.listen(port, '0.0.0.0', () => {
    const scheme = tlsCert ? 'https' : 'http'
    console.error(`singlepage: serving ${dir} on ${scheme}://0.0.0.0:${port}`)
  })
  return server
}
