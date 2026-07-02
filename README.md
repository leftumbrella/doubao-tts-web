# MiniMax 长文本语音合成工作台

这是一个可以部署到 GitHub Pages 的静态网页。前端先把长文本交给 DeepSeek 根据上下文添加 MiniMax 语气词标签，然后通过 Cloudflare Worker 创建 MiniMax 异步语音合成任务，最后使用 MiniMax 返回的音频 URL 播放和下载。

## 功能

- 长文本输入框，支持直接粘贴，单次最多 50000 字符。
- 前端可选择 `speech-2.8-turbo` 或 `speech-2.8-hd`，默认只保留中文普通话女声系统音色。
- 支持填写 MiniMax 自定义 `voice`，用于复刻音色或其他账号可用音色。
- 支持在前端填写 `pronunciation_dict.tone` 读音规则，并保存在当前浏览器。
- DeepSeek 添加语气词后的 MiniMax 文本会在页面底部展示。
- TTS 使用 MiniMax 异步长文本语音合成 API。
- 合成成功后返回音频文件 URL，页面支持播放和下载。

## GitHub Pages 部署

1. 把这些文件推送到 GitHub 仓库的 `main` 分支。
2. 进入仓库 `Settings` -> `Pages`。
3. 在 `Build and deployment` 中选择 `GitHub Actions`。
4. 推送后会自动运行 `.github/workflows/pages.yml` 并发布页面。

## Cloudflare Worker 部署

前端不能直接保存 DeepSeek API Key 或 MiniMax API Key，必须通过 Worker 代理。

部署 Worker：

```bash
npx wrangler deploy worker/doubao-tts-proxy.js \
  --name doubao-tts-proxy \
  --compatibility-date 2026-07-02
```

配置生产密钥：

```bash
npx wrangler secret put DEEPSEEK_API_KEY --name doubao-tts-proxy
npx wrangler secret put MINIMAX_API_KEY --name doubao-tts-proxy
npx wrangler secret put ALLOWED_ORIGIN --name doubao-tts-proxy
```

推荐值：

```text
MINIMAX_API_KEY=你的 MiniMax API Key
ALLOWED_ORIGIN=https://你的用户名.github.io
```

如果你的 GitHub Pages 地址是：

```text
https://leftumbrella.github.io/doubao-tts-web/
```

`ALLOWED_ORIGIN` 应填：

```text
https://leftumbrella.github.io
```

不要带 `/doubao-tts-web/` 路径。

## 前端代理地址

部署 Worker 后，把 `config.js` 里的 `proxyUrl` 改为 Worker 地址：

```js
window.MINIMAX_TTS_CONFIG = {
  proxyUrl: "https://doubao-tts-proxy.lefthhau.workers.dev"
};
```

## 后端路由

Worker 暴露两个路由：

- `POST /optimize`：调用 DeepSeek，在长文本中根据上下文插入 MiniMax 语气词标签。
- `POST /stream`：调用 MiniMax 异步语音合成 API，轮询任务状态，成功后通过文件检索接口返回 NDJSON 格式的音频 URL 事件。
- `GET /audio?file_id=...`：下载 MiniMax 返回的 `.tar` 结果包，解包出其中真正的音频文件，并以可在线播放的音频响应返回。

## 本地测试

Windows 可以直接双击：

```text
start-local-test.bat
```

脚本会启动本地 Worker、前端静态服务器，并自动打开：

```text
http://localhost:5173/?proxy=http%3A%2F%2Flocalhost%3A8787
```

首次运行时，如果 `.dev.vars` 不存在，脚本会创建模板并用记事本打开。填入真实密钥后再运行一次。

本地 `.dev.vars` 示例：

```env
DEEPSEEK_API_KEY=你的 DeepSeek API Key
MINIMAX_API_KEY=你的 MiniMax API Key
ALLOWED_ORIGIN=http://localhost:5173
```

启动前端：

```bash
python3 -m http.server 5173
```

启动 Worker：

```bash
npx wrangler dev worker/doubao-tts-proxy.js --local --port 8787
```

本地页面代理地址填：

```text
http://localhost:8787
```
