# 豆包长文本语音合成工作台

这是一个可以部署到 GitHub Pages 的静态网页，用豆包语音合成大模型 2.0 的长文本异步接口完成语音合成。

## 功能

- 长文本输入框，支持直接粘贴，单次最多 100000 字符。
- 音色下拉框，内置 `seed-tts-2.0` 中文女声音色列表，并支持自定义音色 ID。
- 调用 `/api/v3/tts/submit` 提交任务，再轮询 `/api/v3/tts/query`。
- 合成完成后显示音频控制条，支持播放、复制音频链接和下载。
- 默认输出 MP3，支持采样率、语速、音量和语种参数。

## GitHub Pages 部署

1. 把这些文件推送到 GitHub 仓库的 `main` 分支。
2. 进入仓库 `Settings` -> `Pages`。
3. 在 `Build and deployment` 中选择 `GitHub Actions`。
4. 推送后会自动运行 `.github/workflows/pages.yml` 并发布页面。

## 调用方式

页面支持两种方式。

### 方式一：临时浏览器直连

在页面的“接口连接”里填写 `App ID` 和 `Access Key`。这些值只保存在当前浏览器中，不会写进仓库。

注意：公开部署时不建议这样使用，因为浏览器请求可能被 CORS 拦截，而且访问者可以看到自己输入的凭据。

### 方式二：安全代理

推荐公开部署时使用 `worker/doubao-tts-proxy.js`。它会把密钥保存在 Cloudflare Worker 环境变量中，GitHub Pages 只调用代理地址。

Cloudflare Worker 需要配置：

```bash
wrangler secret put DOUBAO_APP_ID
wrangler secret put DOUBAO_ACCESS_KEY
wrangler secret put DOUBAO_RESOURCE_ID
wrangler secret put DOUBAO_ALLOWED_ORIGIN
```

推荐值：

```text
DOUBAO_RESOURCE_ID=seed-tts-2.0
DOUBAO_ALLOWED_ORIGIN=https://你的用户名.github.io
```

部署 Worker 后，把 `config.js` 里的 `proxyUrl` 改为 Worker 地址：

```js
window.DOUBAO_TTS_CONFIG = {
  proxyUrl: "https://your-worker.example.workers.dev",
  resourceId: "seed-tts-2.0"
};
```

## 豆包接口说明

本项目使用长文本异步接口：

- 提交任务：`https://openspeech.bytedance.com/api/v3/tts/submit`
- 查询任务：`https://openspeech.bytedance.com/api/v3/tts/query`
- 资源 ID：`seed-tts-2.0`

音频链接由 query 接口返回，通常 1 小时内有效。服务端合成数据按官方说明可保存 7 天。
