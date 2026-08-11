# pagesite

Self-hosted HTML sharing with optional access codes — server, CLI, and AI skill in one zero-dep package.

## Quickstart

### 1. Start server

```bash
npx pagesite serve --port 3000 --dir ./pages
```

Options:

```bash
npx pagesite serve --port 8080 --dir /data/pages --token ADMIN_SECRET \
  --public-url https://pages.example.com --trust-proxy
```

| Flag | Env | Description |
|------|-----|-------------|
| `--port` | `PAGESITE_PORT` | Listen port (default 3000) |
| `--dir` | `PAGESITE_DIR` | Storage directory (default `./pages`) |
| `--token` | `PAGESITE_TOKEN` | Optional admin token (bypasses user auth) |
| `--public-url` | `PAGESITE_PUBLIC_URL` | Base URL for generated share links |
| `--trust-proxy` | `PAGESITE_TRUST_PROXY` | Honor `X-Forwarded-Proto/Host` headers |
| `--tls-cert` / `--tls-key` | — | Direct TLS (skip if behind reverse proxy) |

> Access code decryption uses WebCrypto — requires HTTPS or localhost.

### 2. Register & Login

Anyone can register via the Web UI (`GET /`) or API:

```bash
curl -X POST https://pages.example.com/api/register \
  -H 'Content-Type: application/json' \
  -d '{"id":"myname","token":"mysecret"}'
```

- `id`: 2–32 chars, alphanumeric/dash/underscore
- `token`: min 4 chars, hashed with SHA-256 on server

After registration, authenticate uploads with `Authorization: Bearer <id>:<token>`.

### 3. Upload from CLI

```bash
npx pagesite upload report.html --domain https://pages.example.com --user myname --pass mysecret

# With access code encryption
npx pagesite upload report.html --domain https://pages.example.com --user myname --pass mysecret --seal
# => {"url":"https://pages.example.com/report.html","code":"XXXX-XXXX-XXXX-XXXX"}
```

Delete:
```bash
npx pagesite delete report.html --domain https://pages.example.com --user myname --pass mysecret
```

Configure `~/.pagesiterc.json` to skip flags:
```json
{"domain": "https://pages.example.com", "id": "myname", "token": "mysecret"}
```

Then: `npx pagesite upload report.html --seal`

### 4. AI Skill (Claude Code / Codebuddy)

对 AI 说：

> 帮我安装 pagesite skill：先问我装全局还是当前项目，然后 npm install pagesite，把安装路径下的 SKILL.md 注册到对应的 settings.json 的 skills 数组里，最后读取 SKILL.md 中的「首次配置」章节引导我完成 ~/.pagesiterc.json 的配置。

完成后对 AI 说「发布这个页面」「share this html」即可触发 skill。

### 5. Web UI

Open `http://your-server:3000` — register/login, then drag & drop HTML files. Supports seal, update existing pages, and delete.

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | — | Web UI |
| `GET` | `/<name>.html` | — | Serve page |
| `GET` | `/api/list` | — | List all pages |
| `POST` | `/api/register` | — | Register `{id, token}` |
| `POST` | `/api/login` | — | Verify credentials `{id, token}` |
| `PUT` | `/<name>.html` | Bearer | Upload/update (`?seal=true` for encryption) |
| `DELETE` | `/<name>.html` | Bearer | Delete page |

## Access Control

1. **User auth** — register with id+token, authenticate via `Bearer id:token`
2. **Admin token** — optional `--token` on server, grants upload/delete without user registration
3. **Access code** — per-page AES-256-GCM client-side encryption, viewer enters code to decrypt

## License

MIT
