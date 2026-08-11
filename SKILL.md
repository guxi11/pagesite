---
name: pagesite
description: 发布 HTML 页面到自部署的 pagesite 服务器，返回可分享链接。当用户要"分享页面 / 发布 html / 生成链接 / share page / publish html / 上传页面"时使用。
---

# pagesite skill

通过 CLI 将 HTML 发布到远端 pagesite 服务器。

## 前置条件

1. 已安装 `pagesite`（全局或项目内均可，也可用 `npx pagesite`）
2. 存在配置文件 `~/.pagesiterc.json`：

```json
{"domain": "https://pages.example.com", "id": "your-user-id", "token": "your-token"}
```

若配置缺失，引导用户完成配置（见下方「首次配置」）。

## 操作

### 发布页面

将 HTML 内容写入临时文件后上传：

```bash
# 写入临时文件
tmp=$(mktemp /tmp/pagesite_XXXXXX.html)
cat > "$tmp" << 'HTMLEOF'
<内容>
HTMLEOF

# 上传（不加密）
npx pagesite upload "$tmp" --domain <domain> --user <id> --pass <token>

# 上传（加密，返回访问码）
npx pagesite upload "$tmp" --seal --domain <domain> --user <id> --pass <token>

rm "$tmp"
```

如果 `~/.pagesiterc.json` 已配置，可省略 `--domain/--user/--pass`：

```bash
npx pagesite upload "$tmp"
npx pagesite upload "$tmp" --seal
```

### 更新已有页面

直接用已有文件名上传即可覆盖：

```bash
echo '<h1>updated</h1>' > /tmp/report_a1b2c3d4.html
npx pagesite upload /tmp/report_a1b2c3d4.html
```

### 删除页面

```bash
npx pagesite delete report_a1b2c3d4.html
```

## 输出格式

- 普通上传：`{"url":"https://pages.example.com/name_xxxx.html"}`
- 加密上传：`{"url":"https://...","code":"XXXX-XXXX-XXXX-XXXX"}`

将 url（和 code，如有）返回给用户。

## 首次配置

若 `~/.pagesiterc.json` 不存在或缺少字段，按此流程引导：

1. 询问用户 pagesite 服务器地址（domain）
2. 询问用户已有账号还是需要注册
3. 若需注册：
   ```bash
   curl -s -X POST <domain>/api/register \
     -H 'Content-Type: application/json' \
     -d '{"id":"<用户选的id>","token":"<用户选的密码>"}'
   ```
4. 写入配置：
   ```bash
   cat > ~/.pagesiterc.json << 'EOF'
   {"domain":"<domain>","id":"<id>","token":"<token>"}
   EOF
   chmod 600 ~/.pagesiterc.json
   ```

## 注意

- 文件名自动追加随机 ID 确保唯一，除非是更新已有文件
- `--seal` 使用服务端 AES-256-GCM 加密，访客需输入访问码
- 所有凭据从 `~/.pagesiterc.json` 读取，不要硬编码到命令历史
