// lib/guide.js — usage guide page
export const guidePage = () => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>pagest — Usage Guide</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f8fafc;--surface:#fff;--border:#e2e8f0;
  --text:#1e293b;--text-muted:#64748b;--primary:#6366f1;
  --primary-light:#eef2ff;--radius:12px;--radius-sm:8px;
  --shadow-md:0 4px 6px -1px rgba(0,0,0,.07),0 2px 4px -2px rgba(0,0,0,.05);
}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);padding:2rem 1rem;min-height:100vh;line-height:1.7}
main{max-width:640px;margin:0 auto}
h1{text-align:center;font-size:1.75rem;font-weight:700;letter-spacing:-.02em;margin-bottom:.25rem;background:linear-gradient(135deg,var(--primary),#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.subtitle{text-align:center;color:var(--text-muted);font-size:.875rem;margin-bottom:2rem}
.subtitle a{color:var(--primary);text-decoration:none}
.subtitle a:hover{text-decoration:underline}
.card{background:var(--surface);border-radius:var(--radius);box-shadow:var(--shadow-md);padding:1.75rem;margin-bottom:1.25rem;border:1px solid var(--border)}
h2{font-size:1.1rem;font-weight:700;margin-bottom:1rem;color:var(--primary)}
h3{font-size:.95rem;font-weight:600;margin:1.25rem 0 .5rem;color:var(--text)}
p,li{font-size:.875rem;color:var(--text);margin-bottom:.5rem}
ol,ul{padding-left:1.25rem}
ol li{margin-bottom:.75rem}
code{font-family:'SF Mono',Consolas,monospace;font-size:.8rem;background:var(--primary-light);padding:.15rem .4rem;border-radius:4px;color:var(--primary)}
pre{background:#1e293b;color:#e2e8f0;padding:1rem 1.25rem;border-radius:var(--radius-sm);overflow-x:auto;margin:.75rem 0;font-size:.8rem;line-height:1.6}
pre code{background:none;color:inherit;padding:0}
.badge{display:inline-block;font-size:.7rem;font-weight:600;padding:.15rem .5rem;border-radius:99px;background:var(--primary-light);color:var(--primary);margin-left:.5rem;vertical-align:middle}
.note{font-size:.8rem;color:var(--text-muted);background:var(--primary-light);padding:.75rem 1rem;border-radius:var(--radius-sm);margin:.75rem 0;border-left:3px solid var(--primary)}
.divider{border:none;border-top:1px solid var(--border);margin:1.5rem 0}
</style>
</head>
<body>
<main>
<h1>Usage Guide</h1>
<p class="subtitle"><a href="./">&larr; Back to pagest</a></p>

<div class="card">
<h2>Web UI</h2>

<h3>1. Register an Account</h3>
<ol>
<li>Open the homepage and click the <code>Register</code> tab</li>
<li>Choose a User ID (2-32 chars, alphanumeric / dash / underscore) and set a Password (min 4 chars)</li>
<li>Click <code>Create Account</code>, then switch to Login tab</li>
</ol>

<h3>2. Login</h3>
<ol>
<li>Enter your User ID and Password, click <code>Login</code></li>
<li>Credentials are saved in browser — you'll be auto-logged in next time</li>
</ol>

<h3>3. Publish a Page</h3>
<ol>
<li>Drag & drop an <code>.html</code> file onto the drop zone (or click to browse)</li>
<li>Optionally check <strong>Seal with access code</strong> to encrypt — viewers must enter the code to see the page</li>
<li>To <strong>update</strong> an existing page, pick it from the dropdown; otherwise a random URL is generated</li>
<li>Click <code>Publish</code> — you'll get a shareable URL (and access code if sealed)</li>
</ol>

<h3>4. Manage Pages</h3>
<p>After login, the <strong>Published pages</strong> list shows all hosted files. You can:</p>
<ul>
<li><code>update</code> — select the page and upload a new version</li>
<li><code>delete</code> — permanently remove the page (with confirmation)</li>
</ul>
</div>

<div class="card">
<h2>CLI <span class="badge">Terminal</span></h2>

<h3>Install</h3>
<pre><code>npm i -g pagest     # or use npx</code></pre>

<h3>Start a Server</h3>
<pre><code>pagest serve --port 3000 --dir ./pages --token YOUR_ADMIN_SECRET</code></pre>
<p>Options: <code>--tls-cert</code> / <code>--tls-key</code> for HTTPS, <code>--public-url</code> to override share link base, <code>--trust-proxy</code> behind a reverse proxy.</p>

<h3>Upload a Page</h3>
<pre><code># plain
pagest upload page.html --domain https://pages.example.com --api-key sp_xxx

# with encryption (access code)
pagest upload page.html --seal --domain https://pages.example.com --api-key sp_xxx</code></pre>
<p>Output: <code>{"url":"https://...","code":"XXXX-XXXX-XXXX-XXXX"}</code></p>

<h3>Delete a Page</h3>
<pre><code>pagest delete page_abc123.html --domain https://pages.example.com --api-key sp_xxx</code></pre>

<div class="note">
Create <code>~/.pagestrc.json</code> with <code>{"domain":"...","apiKey":"sp_..."}</code> to skip <code>--domain/--api-key</code> every time.
</div>
</div>

<div class="card">
<h2>AI Skill <span class="badge">Claude Code</span></h2>
<p>In Claude Code (or any AI assistant with the pagest skill), just say:</p>

<h3>Publish</h3>
<pre><code>"Share this HTML as a page"
"Publish this report to pagest"
"Upload index.html with a seal"</code></pre>
<p>The AI writes your content to a temp file, runs <code>npx pagest upload</code>, and returns the URL + access code.</p>

<h3>Update</h3>
<pre><code>"Update report_a1b2c3d4.html with the new version"</code></pre>

<h3>Delete</h3>
<pre><code>"Delete report_a1b2c3d4.html from pagest"</code></pre>

<h3>First-time Setup</h3>
<p>If <code>~/.pagestrc.json</code> is missing, the AI will walk you through:</p>
<ol>
<li>Server address (domain)</li>
<li>Register or login</li>
<li>Save config to <code>~/.pagestrc.json</code></li>
</ol>
</div>

<div class="card">
<h2>API Reference</h2>
<p>All API endpoints for programmatic use:</p>

<h3>POST /api/register</h3>
<pre><code>{"id": "myuser", "password": "mypass"}</code></pre>

<h3>POST /api/login</h3>
<pre><code>{"id": "myuser", "password": "mypass"}
=> {"ok": true, "id": "myuser", "apiKey": "sp_..."}</code></pre>

<h3>GET /api/list</h3>
<p>Returns all hosted pages as JSON array.</p>

<h3>PUT /{filename}?seal=true</h3>
<p>Upload HTML. Auth: <code>Bearer &lt;apiKey&gt;</code>. Add <code>?seal=true</code> for encryption.</p>

<h3>DELETE /{filename}</h3>
<p>Remove a page. Auth: <code>Bearer &lt;apiKey&gt;</code>.</p>
</div>

</main>
</body>
</html>`
