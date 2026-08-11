// lib/seal.js — AES-256-GCM page encryption (pure, zero side effects)
import { randomBytes, randomInt, pbkdf2Sync, createCipheriv } from 'node:crypto'

export const ITERATIONS = 600_000

const b64 = buf => buf.toString('base64')
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const genCode = () => {
  const group = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
  return [group(), group(), group(), group()].join('-')
}

export const seal = (html, code) => {
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const key = pbkdf2Sync(code, salt, ITERATIONS, 32, 'sha256')
  const c = createCipheriv('aes-256-gcm', key, iv)
  const data = Buffer.concat([c.update(html, 'utf8'), c.final(), c.getAuthTag()])
  return { salt: b64(salt), iv: b64(iv), data: b64(data) }
}

export const sealedPage = payload => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>sealed page</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f1115;color:#e6e6e6;font:15px/1.5 system-ui,sans-serif}
form{display:flex;flex-direction:column;gap:12px;width:min(320px,80vw)}
input,button{padding:10px 14px;border-radius:8px;border:1px solid #333;background:#181b22;color:inherit;font:inherit}
button{cursor:pointer;background:#2d6cdf;border-color:#2d6cdf;color:#fff}
button:hover{background:#3a78e8}
#e{color:#e5534b;min-height:1.2em;font-size:13px;text-align:center}
</style></head>
<body>
<form id="f"><input id="p" type="password" placeholder="access code" autocomplete="off" autofocus><button>unlock</button><div id="e"></div></form>
<script id="payload" type="application/json">${JSON.stringify(payload)}</script>
<script>
if (!window.isSecureContext) document.getElementById('e').textContent = 'Warning: decryption requires HTTPS or localhost (secure context)'
const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0))
document.getElementById('f').onsubmit = async ev => {
  ev.preventDefault()
  if (!window.isSecureContext) { document.getElementById('e').textContent = 'Cannot decrypt: page must be served over HTTPS or localhost'; return }
  const { salt, iv, data } = JSON.parse(document.getElementById('payload').textContent)
  try {
    const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(document.getElementById('p').value), 'PBKDF2', false, ['deriveKey'])
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b64d(salt), iterations: ${ITERATIONS}, hash: 'SHA-256' },
      km, { name: 'AES-GCM', length: 256 }, false, ['decrypt'])
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(iv) }, key, b64d(data))
    document.open(); document.write(new TextDecoder().decode(plain)); document.close()
  } catch { document.getElementById('e').textContent = 'wrong access code' }
}
</script></body></html>`
