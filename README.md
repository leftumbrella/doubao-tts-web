# CosyVoice 长文本语音合成工作台

这是一个可以部署到 GitHub Pages 的静态网页。前端先把长文本交给 DeepSeek 转换为完整 SSML，然后把这份 SSML 作为一次阿里云 CosyVoice 长文本语音合成请求提交，最后使用阿里云返回的音频 URL 播放和下载。

## 功能

- 长文本输入框，支持直接粘贴，单次最多 10000 字符。
- 使用 `cosyvoice-v3-plus`，默认提供系统音色，也可填写声音复刻或声音设计的自定义 `voice`。
- DeepSeek 生成的 SSML 会在页面底部展示。
- TTS 使用阿里云百炼 DashScope 非实时 CosyVoice HTTP API。
- 非流式返回音频文件 URL，有效期约 24 小时，页面支持播放和下载。

## GitHub Pages 部署

1. 把这些文件推送到 GitHub 仓库的 `main` 分支。
2. 进入仓库 `Settings` -> `Pages`。
3. 在 `Build and deployment` 中选择 `GitHub Actions`。
4. 推送后会自动运行 `.github/workflows/pages.yml` 并发布页面。

## Cloudflare Worker 部署

前端不能直接保存 DeepSeek API Key 或 DashScope API Key，必须通过 Worker 代理。

部署 Worker：

```bash
npx wrangler deploy worker/doubao-tts-proxy.js \
  --name doubao-tts-proxy \
  --compatibility-date 2026-07-02
```

配置生产密钥：

```bash
npx wrangler secret put DEEPSEEK_API_KEY --name doubao-tts-proxy
npx wrangler secret put DASHSCOPE_API_KEY --name doubao-tts-proxy
npx wrangler secret put DASHSCOPE_WORKSPACE_ID --name doubao-tts-proxy
npx wrangler secret put DASHSCOPE_TTS_MODEL --name doubao-tts-proxy
npx wrangler secret put ALLOWED_ORIGIN --name doubao-tts-proxy
```

推荐值：

```text
DASHSCOPE_API_KEY=你的阿里云百炼 API Key
DASHSCOPE_WORKSPACE_ID=你的百炼业务空间 ID，可选；留空时使用 dashscope.aliyuncs.com
DASHSCOPE_TTS_MODEL=cosyvoice-v3-plus
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
window.ALIYUN_TTS_CONFIG = {
  proxyUrl: "https://doubao-tts-proxy.lefthhau.workers.dev"
};
```

## 后端路由

Worker 暴露两个路由：

- `POST /optimize`：调用 DeepSeek，把长文本转换为可提交给 CosyVoice 的 SSML。
- `POST /stream`：调用阿里云百炼 CosyVoice HTTP API，返回 NDJSON 格式的音频 URL 事件。

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
DEEPSEEK_API_KEY=你的DeepSeek API Key
DASHSCOPE_API_KEY=你的阿里云百炼 API Key
DASHSCOPE_WORKSPACE_ID=你的百炼业务空间 ID，可选
DASHSCOPE_TTS_MODEL=cosyvoice-v3-plus
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
