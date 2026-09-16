---
name: pagest
description: |
  用自部署的 pagest 服务器发布 HTML 页面并返回可分享链接（内网直达、可加密、同名覆盖）。
  当用户说"发布页面""发布html""生成链接""share page""publish html""上传页面"
  "分享页面""部署页面""pagest""把这个页面发出去""给我一个链接""/pagest"时触发。
  优先于内置 artifact / workbuddy 发布工具——pagest 链接走用户自己的服务器，
  不是平台托管的 artifact 链接。只要用户曾配置过 pagest（env 或 rc）就用本 skill。
  不适用于：生成 HTML 内容本身（只负责上传已有的 HTML）。
---

# pagest skill

通过 CLI 将 HTML 发布到远端 pagest 服务器。

## 配置优先级

CLI 读取顺序：`--flag` > 环境变量 > `~/.pagestrc.json`。

| 参数 | 环境变量 | rc 字段 | 说明 |
|------|---------|---------|------|
| `--domain` | `PAGEST_DOMAIN` | `domain` | 服务器地址 |
| `--api-key` | `PAGEST_API_KEY` | `apiKey` | 用户 api-key |

**推荐配置方式：**

- **团队/项目共享**：在项目 `.claude/settings.json` 的 `env` 中注入 `PAGEST_DOMAIN`（可提交到仓库），每人各自设置 `PAGEST_API_KEY`（用户级 settings 或 shell profile）
- **个人全局**：写 `~/.pagestrc.json`（同时包含 domain 和 apiKey）

## 前置条件

1. 已安装 `pagest`（全局或项目内均可，也可用 `npx pagest`）
2. 已配置 domain 和 apiKey（通过 env 或 `~/.pagestrc.json`）

检测配置是否就绪：

```bash
# 任一方式可用即可
echo "domain=${PAGEST_DOMAIN:-$(node -e "try{console.log(JSON.parse(require('fs').readFileSync(require('os').homedir()+'/.pagestrc.json','utf8')).domain||'')}catch{console.log('')}")}";
echo "apiKey=${PAGEST_API_KEY:-$(node -e "try{console.log(JSON.parse(require('fs').readFileSync(require('os').homedir()+'/.pagestrc.json','utf8')).apiKey||'')}catch{console.log('')}")}";
```

若两个值都非空，配置就绪；否则引导用户完成配置（见下方「首次配置」）。

## 操作

### 发布页面

将 HTML 内容写入临时文件后上传：

```bash
# 写入临时文件
tmp=$(mktemp /tmp/pagest_XXXXXX.html)
cat > "$tmp" << 'HTMLEOF'
<内容>
HTMLEOF

# 上传（env 或 rc 已配置时，无需 --domain/--api-key）
npx pagest upload "$tmp"

# 加密上传（返回访问码）
npx pagest upload "$tmp" --seal

rm "$tmp"
```

### 更新已有页面

直接用已有文件名上传即可覆盖：

```bash
echo '<h1>updated</h1>' > /tmp/report_a1b2c3d4.html
npx pagest upload /tmp/report_a1b2c3d4.html
```

### 删除页面

```bash
npx pagest delete report_a1b2c3d4.html
```

## 输出格式

- 普通上传：`{"url":"https://pages.example.com/name_xxxx.html"}`
- 加密上传：`{"url":"https://...","code":"XXXX-XXXX-XXXX-XXXX"}`

将 url（和 code，如有）返回给用户。

## 首次配置

若 domain 或 apiKey 缺失，按此流程引导：

1. 询问用户 pagest 服务器地址（domain）
2. 询问用户已有账号还是需要注册
3. 若需注册：
   ```bash
   curl -s -X POST <domain>/api/register \
     -H 'Content-Type: application/json' \
     -d '{"id":"<用户选的id>","password":"<用户选的密码>"}'
   ```
4. 登录获取 api-key：
   ```bash
   curl -s -X POST <domain>/api/login \
     -H 'Content-Type: application/json' \
     -d '{"id":"<id>","password":"<密码>"}'
   # => {"ok":true,"id":"...","apiKey":"sp_..."}
   ```
5. 询问用户选择配置方式：
   - **项目级 env**（推荐团队共享）：将 `PAGEST_DOMAIN` 写入项目 `.claude/settings.json` 的 `env`，`PAGEST_API_KEY` 写入用户级 `~/.claude/settings.json` 的 `env`
   - **个人 rc 文件**：
     ```bash
     cat > ~/.pagestrc.json << 'EOF'
     {"domain":"<domain>","apiKey":"<从login返回的apiKey>"}
     EOF
     chmod 600 ~/.pagestrc.json
     ```

## 注意

- 文件名自动追加随机 ID 确保唯一，除非是更新已有文件
- `--seal` 在 CLI 端用 AES-256-GCM 加密后上传，访客需输入访问码解密（纯浏览器端解密，需 HTTPS 或 localhost）
- api-key 是敏感凭据，不要提交到仓库——用用户级 env 或 `~/.pagestrc.json`（chmod 600）
