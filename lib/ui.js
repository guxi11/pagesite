// lib/ui.js — web UI with modern design
export const uploadPage = () => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>singlepage</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f8fafc;--surface:#fff;--border:#e2e8f0;--border-focus:#6366f1;
  --text:#1e293b;--text-muted:#64748b;--primary:#6366f1;--primary-hover:#4f46e5;
  --primary-light:#eef2ff;--success:#10b981;--danger:#ef4444;--danger-hover:#dc2626;
  --radius:12px;--radius-sm:8px;--shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
  --shadow-md:0 4px 6px -1px rgba(0,0,0,.07),0 2px 4px -2px rgba(0,0,0,.05);
  --shadow-lg:0 10px 15px -3px rgba(0,0,0,.08),0 4px 6px -4px rgba(0,0,0,.04);
  --transition:all .2s cubic-bezier(.4,0,.2,1);
}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);padding:2rem 1rem;min-height:100vh;line-height:1.6}
main{max-width:480px;margin:0 auto}
h1{text-align:center;font-size:1.75rem;font-weight:700;letter-spacing:-.02em;margin-bottom:2rem;background:linear-gradient(135deg,var(--primary),#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.card{background:var(--surface);border-radius:var(--radius);box-shadow:var(--shadow-md);padding:1.75rem;margin-bottom:1.5rem;border:1px solid var(--border);transition:var(--transition)}
.tabs{display:flex;gap:0;margin-bottom:1.5rem;background:var(--bg);border-radius:var(--radius-sm);padding:4px;border:1px solid var(--border)}
.tabs button{flex:1;padding:.6rem 1rem;border:none;background:transparent;font-size:.875rem;font-weight:500;color:var(--text-muted);cursor:pointer;border-radius:6px;transition:var(--transition)}
.tabs button[aria-selected="true"]{background:var(--surface);color:var(--primary);box-shadow:var(--shadow)}
.tabs button:hover:not([aria-selected="true"]){color:var(--text)}
input,select{width:100%;padding:.75rem 1rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:.9rem;font-family:inherit;background:var(--bg);color:var(--text);transition:var(--transition);outline:none;margin-bottom:.75rem}
input:focus,select:focus{border-color:var(--border-focus);box-shadow:0 0 0 3px rgba(99,102,241,.12)}
input::placeholder{color:var(--text-muted)}
button,.btn{display:inline-flex;align-items:center;justify-content:center;padding:.75rem 1.25rem;border:none;border-radius:var(--radius-sm);font-size:.875rem;font-weight:600;font-family:inherit;cursor:pointer;transition:var(--transition);text-decoration:none}
.btn-primary{width:100%;background:var(--primary);color:#fff}
.btn-primary:hover:not(:disabled){background:var(--primary-hover);transform:translateY(-1px);box-shadow:var(--shadow-md)}
.btn-primary:active{transform:translateY(0)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-secondary{background:transparent;color:var(--primary);border:1.5px solid var(--primary)}
.btn-secondary:hover{background:var(--primary-light)}
.btn-outline{background:transparent;color:var(--text-muted);border:1.5px solid var(--border);padding:.4rem .75rem;font-size:.8rem}
.btn-outline:hover{border-color:var(--text-muted);color:var(--text)}
.btn-danger{background:transparent;color:var(--danger);border:1.5px solid var(--danger);padding:.4rem .75rem;font-size:.75rem}
.btn-danger:hover{background:var(--danger);color:#fff}
.logged-bar{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;background:var(--surface);border-radius:var(--radius);border:1px solid var(--border);margin-bottom:1.5rem;box-shadow:var(--shadow)}
.logged-bar span{font-size:.875rem;color:var(--text-muted)}
.logged-bar strong{color:var(--text);font-weight:600}
.drop-zone{border:2px dashed var(--border);border-radius:var(--radius);padding:3rem 1.5rem;text-align:center;cursor:pointer;transition:var(--transition);margin-bottom:1.25rem;background:var(--bg)}
.drop-zone:hover{border-color:var(--primary);background:var(--primary-light)}
.drop-zone.over{border-color:var(--primary);background:var(--primary-light);transform:scale(1.01)}
.drop-zone svg{width:40px;height:40px;margin-bottom:.75rem;color:var(--text-muted)}
.drop-zone p{color:var(--text-muted);font-size:.875rem;line-height:1.5}
.drop-zone .filename{margin-top:.75rem;font-weight:600;color:var(--primary);font-size:.9rem}
.switch-row{display:flex;align-items:center;gap:.75rem;margin-bottom:1rem;font-size:.875rem;color:var(--text-muted)}
.switch-row input[type=checkbox]{width:auto;margin:0;accent-color:var(--primary)}
.alert{font-size:.8rem;margin-top:.5rem;padding:.5rem .75rem;border-radius:6px;min-height:0}
.alert:empty{display:none}
.alert-err{color:var(--danger);background:rgba(239,68,68,.06)}
.alert-ok{color:var(--success);background:rgba(16,185,129,.06)}
.result-box{background:var(--primary-light);border:1px solid rgba(99,102,241,.2);border-radius:var(--radius-sm);padding:1rem 1.25rem;margin-top:1rem;word-break:break-all;font-size:.875rem;animation:slideDown .3s ease}
.result-box a{color:var(--primary);font-weight:500;text-decoration:none}
.result-box a:hover{text-decoration:underline}
.result-box .code{color:var(--success);font-family:'SF Mono',Consolas,monospace;margin-top:.5rem;font-size:.8rem}
.page-list{margin-top:1.5rem}
.page-list h6{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:.75rem;font-weight:600}
.page-list ul{list-style:none;display:flex;flex-direction:column;gap:.5rem}
.page-list li{display:flex;align-items:center;justify-content:space-between;padding:.6rem .75rem;background:var(--bg);border-radius:var(--radius-sm);border:1px solid var(--border);transition:var(--transition)}
.page-list li:hover{border-color:var(--primary);box-shadow:var(--shadow)}
.page-list li a{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text);text-decoration:none;font-size:.85rem;font-weight:500}
.page-list li a:hover{color:var(--primary)}
.page-list .btn-group{display:flex;gap:.35rem;flex-shrink:0;margin-left:.75rem}
.hidden{display:none!important}
[aria-busy="true"]{position:relative;color:transparent!important}
[aria-busy="true"]::after{content:'';position:absolute;width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<main>
<h1>singlepage</h1>
<div style="text-align:center;margin-top:-1.5rem;margin-bottom:1.5rem"><a href="guide" style="color:var(--text-muted);font-size:.8rem;text-decoration:none;border-bottom:1px dashed var(--border)">Usage Guide</a></div>

<div class="card" id="auth-card">
  <div class="tabs" role="tablist">
    <button role="tab" aria-selected="true" id="tab-login" onclick="switchTab('login')">Login</button>
    <button role="tab" aria-selected="false" id="tab-register" onclick="switchTab('register')">Register</button>
  </div>
  <div id="panel-login">
    <input type="text" id="login-id" placeholder="User ID" autocomplete="username">
    <input type="password" id="password" placeholder="Password" autocomplete="current-password">
    <button class="btn btn-primary" onclick="doLogin()">Login</button>
  </div>
  <div id="panel-register" class="hidden">
    <input type="text" id="reg-id" placeholder="Choose a user ID" autocomplete="off">
    <input type="password" id="reg-password" placeholder="Set a password (min 4 chars)" autocomplete="new-password">
    <button class="btn btn-primary" onclick="doRegister()">Create Account</button>
  </div>
  <div class="alert alert-err" id="auth-err"></div>
  <div class="alert alert-ok" id="auth-msg"></div>
</div>

<div id="logged-bar" class="logged-bar hidden">
  <span>Logged in as <strong id="user-id"></strong></span>
  <button class="btn btn-outline" onclick="doLogout()">Logout</button>
</div>

<div id="upload-area" class="hidden">
  <div class="card">
    <div class="drop-zone" id="drop">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>
      <p>Drag & drop .html file here<br><span style="opacity:.7">or click to browse</span></p>
      <input type="file" id="file" accept=".html,.htm" style="display:none">
      <div class="filename" id="fname"></div>
    </div>

    <div class="switch-row">
      <input type="checkbox" id="seal">
      <label for="seal">Seal with access code</label>
    </div>

    <select id="target-select" aria-label="Target">
      <option value="">New page (random URL)</option>
    </select>

    <button class="btn btn-primary" id="btn" disabled onclick="doPublish()">Publish</button>

    <div class="alert alert-err" id="err"></div>

    <div class="result-box hidden" id="res">
      <div>URL: <a id="rurl" target="_blank"></a> <a href="#" id="curl" onclick="copyUrl(event)" style="margin-left:.5rem;opacity:.7">[copy]</a></div>
      <div class="code" id="rcode"></div>
    </div>
  </div>

  <nav class="page-list" id="pages"></nav>
</div>
</main>

<script>
const $ = id => document.getElementById(id)
const basePath = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/'
let selected = null, loggedId = null, apiKey = null

const savedApiKey = localStorage.getItem('singlepage_apikey')
const savedId = localStorage.getItem('singlepage_id')
if (savedApiKey && savedId) { loggedId = savedId; apiKey = savedApiKey; showLoggedIn(savedId) }

function showLoggedIn(id) {
  $('user-id').textContent = id
  $('auth-card').classList.add('hidden')
  $('logged-bar').classList.remove('hidden')
  $('upload-area').classList.remove('hidden')
  loadPages()
}

function switchTab(tab) {
  $('tab-login').setAttribute('aria-selected', tab === 'login')
  $('tab-register').setAttribute('aria-selected', tab === 'register')
  $('panel-login').classList.toggle('hidden', tab !== 'login')
  $('panel-register').classList.toggle('hidden', tab !== 'register')
  $('auth-err').textContent = ''; $('auth-msg').textContent = ''
}

async function doLogin() {
  const id = $('login-id').value.trim()
  const password = $('password').value.trim()
  if (!id || !password) { $('auth-err').textContent = 'ID and password required'; return }
  try {
    const res = await fetch(basePath + 'api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    })
    const j = await res.json()
    if (!j.ok) { $('auth-err').textContent = j.error; return }
    loggedId = id; apiKey = j.apiKey
    localStorage.setItem('singlepage_id', id)
    localStorage.setItem('singlepage_apikey', j.apiKey)
    showLoggedIn(id)
  } catch(e) { $('auth-err').textContent = e.message }
}

async function doRegister() {
  const id = $('reg-id').value.trim()
  const password = $('reg-password').value.trim()
  if (!id || !password) { $('auth-err').textContent = 'ID and password required'; return }
  try {
    const res = await fetch(basePath + 'api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    })
    const j = await res.json()
    if (!j.ok) { $('auth-err').textContent = j.error; return }
    $('auth-msg').textContent = 'Registered! You can now login.'
    $('login-id').value = id; $('password').value = password
    switchTab('login')
  } catch(e) { $('auth-err').textContent = e.message }
}

function doLogout() {
  loggedId = null; apiKey = null
  localStorage.removeItem('singlepage_id')
  localStorage.removeItem('singlepage_apikey')
  $('auth-card').classList.remove('hidden')
  $('logged-bar').classList.add('hidden')
  $('upload-area').classList.add('hidden')
  $('login-id').value = ''; $('password').value = ''
  switchTab('login')
}

const drop = $('drop'), fileInput = $('file')
drop.onclick = () => fileInput.click()
drop.ondragover = e => { e.preventDefault(); drop.classList.add('over') }
drop.ondragleave = () => drop.classList.remove('over')
drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); pick(e.dataTransfer.files[0]) }
fileInput.onchange = () => pick(fileInput.files[0])

function pick(f) { if (!f) return; selected = f; $('fname').textContent = f.name; $('btn').disabled = false }

function randId() { return Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(36).padStart(2,'0')).join('').slice(0,8) }

async function doPublish() {
  if (!selected || !loggedId) return
  $('btn').setAttribute('aria-busy', 'true'); $('btn').disabled = true
  $('err').textContent = ''; $('res').classList.add('hidden')
  try {
    const targetVal = $('target-select').value
    const name = targetVal || (selected.name.replace(/\\.html?$/i, '').replace(/[^a-zA-Z0-9_.-]/g, '_') + '_' + randId() + '.html')
    const qs = $('seal').checked ? '?seal=true' : ''
    const body = await selected.text()
    const res = await fetch(basePath + name + qs, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'text/html' },
      body
    })
    if (!res.ok) throw new Error(await res.text() || res.status)
    const j = await res.json()
    $('rurl').href = j.url; $('rurl').textContent = j.url
    $('rcode').textContent = j.code ? 'Access code: ' + j.code : ''
    $('res').classList.remove('hidden')
    loadPages()
  } catch(e) { $('err').textContent = e.message }
  $('btn').removeAttribute('aria-busy'); $('btn').disabled = false
}

function copyUrl(e) { e.preventDefault(); navigator.clipboard.writeText($('rurl').textContent) }

async function loadPages() {
  try {
    const res = await fetch(basePath + 'api/list')
    if (!res.ok) return
    const files = await res.json()
    const sel = $('target-select')
    sel.innerHTML = '<option value="">New page (random URL)</option>' +
      files.map(f => '<option value="' + f.name + '">Update: ' + f.name + '</option>').join('')
    if (!files.length) { $('pages').innerHTML = ''; return }
    $('pages').innerHTML = '<h6>Published pages</h6><ul>' +
      files.map(f => '<li><a href="' + basePath + f.name + '" target="_blank">' + f.name + '</a>' +
        '<span class="btn-group">' +
        '<button class="btn btn-outline" onclick="selectUpdate(\\'' + f.name + '\\')">update</button>' +
        '<button class="btn btn-danger" onclick="deletePage(\\'' + f.name + '\\')">delete</button>' +
        '</span></li>').join('') + '</ul>'
  } catch {}
}

function selectUpdate(name) { $('target-select').value = name }

async function deletePage(name) {
  if (!loggedId) return
  if (!confirm('Delete ' + name + '?')) return
  try {
    const res = await fetch(basePath + name, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + apiKey }
    })
    if (!res.ok) throw new Error(await res.text() || res.status)
    loadPages()
  } catch(e) { $('err').textContent = e.message }
}
</script>
</body>
</html>`
