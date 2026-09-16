# pagest

Self-hosted HTML sharing with optional access codes — server, CLI, and AI skill in one zero-dep package.

## Quickstart

### 1. Start server

```bash
npx pagest serve --port 3000 --dir ./pages
```

Options:

```bash
npx pagest serve --port 8080 --dir /data/pages --token ADMIN_SECRET \
  --public-url https://pages.example.com --trust-proxy
```

| Flag | Env | Description |
|------|-----|-------------|
| `--port` | `PAGEST_PORT` | Listen port (default 3000) |
| `--dir` | `PAGEST_DIR` | Storage directory (default `./pages`) |
| `--token` | `PAGEST_TOKEN` | Admin token (bypasses user auth for uploads) |
| `--public-url` | `PAGEST_PUBLIC_URL` | Base URL for generated share links |
| `--trust-proxy` | `PAGEST_TRUST_PROXY` | Honor `X-Forwarded-Proto/Host` headers |
| `--tls-cert` / `--tls-key` | — | Direct TLS termination (skip if behind reverse proxy) |

CLI upload/delete also reads: `PAGEST_DOMAIN`, `PAGEST_API_KEY`.

> Access code decryption uses WebCrypto — requires HTTPS or localhost.

### 2. Register & login

Register via the Web UI (`GET /`) or API:

```bash
curl -X POST https://pages.example.com/api/register \
  -H 'Content-Type: application/json' \
  -d '{"id":"myname","password":"mysecret"}'
```

- `id` — 2–32 chars, `[a-zA-Z0-9_-]`
- `password` — min 4 chars, stored as SHA-256 hash

Login to get an API key:

```bash
curl -X POST https://pages.example.com/api/login \
  -H 'Content-Type: application/json' \
  -d '{"id":"myname","password":"mysecret"}'
# => {"ok":true,"id":"myname","apiKey":"sp_a1b2c3d4..."}
```

Use the API key for all subsequent requests: `Authorization: Bearer <apiKey>`.

### 3. Upload from CLI

```bash
npx pagest upload report.html --domain https://pages.example.com --api-key sp_xxx

# With access code (AES-256-GCM client-side encryption)
npx pagest upload report.html --domain https://pages.example.com --api-key sp_xxx --seal
# => {"url":"https://pages.example.com/report.html","code":"XXXX-XXXX-XXXX-XXXX"}

# Supply your own code instead of auto-generated
npx pagest upload report.html --seal --code MY-CUSTOM-CODE
```

Delete:
```bash
npx pagest delete report.html --domain https://pages.example.com --api-key sp_xxx
```

Shorthand — `pagest <file.html>` is equivalent to `pagest upload <file.html>`.

Configure `~/.pagestrc.json` to skip `--domain/--api-key`:
```json
{"domain": "https://pages.example.com", "apiKey": "sp_a1b2c3d4..."}
```

Then: `npx pagest upload report.html --seal`

### 4. AI Skill (Claude Code / Codebuddy)

对 AI 说：

> 帮我安装 pagest skill：先问我装全局还是当前项目，然后 npm install pagest，把安装路径下的 SKILL.md 注册到对应的 settings.json 的 skills 数组里，最后读取 SKILL.md 中的「首次配置」章节引导我完成 ~/.pagestrc.json 的配置。

完成后对 AI 说「发布这个页面」「share this html」即可触发 skill。

### 5. Web UI

Open `http://your-server:3000` — register/login, then drag & drop HTML files. Supports seal (access code encryption), update existing pages, and delete.

Upload target dropdown lets you overwrite an existing page or create a new one with a random URL suffix.

## API

| Method | Path | Auth | Body / Query | Description |
|--------|------|------|--------------|-------------|
| `GET` | `/` | — | — | Web UI |
| `GET` | `/<name>.html` | — | — | Serve page (or sealed unlock form) |
| `GET` | `/api/list` | — | — | List all pages `[{name, size, mtime}]` |
| `POST` | `/api/register` | — | `{id, password}` | Register new user |
| `POST` | `/api/login` | — | `{id, password}` | Login, returns `{ok, id, apiKey}` |
| `PUT` | `/<name>.html` | Bearer | HTML body; `?seal=true` | Upload/update (server-side seal) |
| `DELETE` | `/<name>.html` | Bearer | — | Delete page |

Body size limit: 50 MB.

## Access Control

1. **User auth** — register with id+password, login to get an API key (`sp_...`), authenticate via `Bearer <apiKey>`
2. **Admin token** — optional `--token` on server start, grants upload/delete without user registration
3. **Access code (seal)** — AES-256-GCM encryption with PBKDF2 key derivation (600k iterations); decryption happens entirely in the browser via WebCrypto (requires HTTPS or localhost)

## License

MIT
