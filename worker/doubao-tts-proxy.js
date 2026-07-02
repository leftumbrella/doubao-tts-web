const DASHSCOPE_TTS_URL = "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer";
const DEFAULT_TTS_MODEL = "cosyvoice-v3-plus";
const DEEPSEEK_CHAT_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";
const MAX_ALIYUN_TTS_CHARS = 10000;

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST") {
      return json({ message: "Method not allowed" }, 405, cors);
    }

    if (!isAllowedOrigin(request, env)) {
      return json({ message: "Origin is not allowed" }, 403, cors);
    }

    if (requestUrl.pathname === "/optimize") {
      return optimizeText(request, env, cors);
    }

    if (requestUrl.pathname === "/stream") {
      return streamTts(request, env, cors);
    }

    return json({ message: "Not found" }, 404, cors);
  }
};

async function optimizeText(request, env, cors) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return json({ message: "Proxy is missing DEEPSEEK_API_KEY" }, 500, cors);
  }

  const body = await safeRequestJson(request);
  const text = cleanText(body.text || "");
  if (!text) {
    return json({ message: "text is required" }, 400, cors);
  }

  const deepseekResponse = await fetch(DEEPSEEK_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL,
      messages: [
        {
          role: "system",
          content: optimizationSystemPrompt()
        },
        {
          role: "user",
          content: buildOptimizationPrompt(text)
        }
      ],
      thinking: { type: "disabled" },
      temperature: 0.35,
      max_tokens: 8192,
      stream: false
    })
  });

  const raw = await deepseekResponse.text();
  const payload = safeJson(raw);
  if (!deepseekResponse.ok) {
    return json(
      {
        message: payload?.error?.message || payload?.message || raw || "DeepSeek request failed"
      },
      deepseekResponse.status,
      cors
    );
  }

  const content = payload?.choices?.[0]?.message?.content;
  const ssml = normalizeSsmlOutput(content, text);

  return json(
    {
      ssml,
      meta: {
        source: "deepseek",
        model: payload?.model || env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL,
        text_length: countSynthesisText(ssml),
        phoneme_count: countTag(ssml, "phoneme"),
        break_count: countTag(ssml, "break"),
        usage: payload?.usage || null
      }
    },
    200,
    cors
  );
}

async function streamTts(request, env, cors) {
  const apiKey = cleanText(env.DASHSCOPE_API_KEY || env.ALIYUN_DASHSCOPE_API_KEY || "");
  if (!apiKey) {
    return json({ message: "Proxy is missing DASHSCOPE_API_KEY" }, 500, cors);
  }

  const body = await safeRequestJson(request);
  const text = cleanText(body.ssml || body.text || "");
  if (!text) {
    return json({ message: "text is required" }, 400, cors);
  }

  const textLength = countSynthesisText(text);
  if (textLength > MAX_ALIYUN_TTS_CHARS) {
    return json(
      {
        message: `Aliyun long-text TTS allows at most ${MAX_ALIYUN_TTS_CHARS} text characters per session. Current request has ${textLength} characters.`
      },
      400,
      cors
    );
  }

  const voice = cleanText(body.voice || body.speaker || "");
  if (!voice) {
    return json(
      {
        message: "voice is required. Select a supported system voice or provide a custom voice ID."
      },
      400,
      cors
    );
  }
  const format = normalizeAliyunFormat(body.format);
  const sampleRate = normalizeAliyunSampleRate(body.sample_rate);
  const volume = clampNumber(body.volume, 0, 100, 50);
  const rate = clampFloat(body.rate, 0.5, 2, 1);
  const pitch = clampFloat(body.pitch, 0.5, 2, 1);
  const instruction = cleanText(body.instruction || "");

  const input = {
    text,
    voice,
    format,
    sample_rate: sampleRate,
    volume,
    rate,
    pitch,
    enable_ssml: body.enable_ssml !== false
  };

  if (instruction) {
    input.instruction = instruction.slice(0, 100);
  }

  const model = cleanText(body.model || env.DASHSCOPE_TTS_MODEL || DEFAULT_TTS_MODEL);
  const ttsUrl = buildDashScopeTtsUrl(env);
  const upstreamResponse = await fetch(ttsUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input
    })
  });

  const upstreamText = await upstreamResponse.text();
  const upstreamPayload = safeJson(upstreamText);
  const upstreamMessage =
    upstreamPayload?.message ||
    upstreamPayload?.error?.message ||
    upstreamText ||
    `DashScope TTS request failed with HTTP ${upstreamResponse.status}`;
  if (!upstreamResponse.ok) {
    return json(
      {
        message: explainDashScopeTtsError(upstreamMessage),
        request_id: upstreamPayload?.request_id || null,
        code: upstreamPayload?.code || null,
        request: {
          model,
          voice,
          format,
          sample_rate: sampleRate,
          enable_ssml: input.enable_ssml,
          endpoint: describeDashScopeEndpoint(ttsUrl)
        }
      },
      upstreamResponse.status,
      cors
    );
  }

  const audio = upstreamPayload?.output?.audio || {};
  if (!audio.url) {
    return json(
      {
        message: "DashScope TTS response did not include output.audio.url",
        request_id: upstreamPayload?.request_id || null,
        raw: upstreamPayload || upstreamText
      },
      502,
      cors
    );
  }

  const responseHeaders = new Headers(cors);
  responseHeaders.set("Content-Type", "application/x-ndjson; charset=utf-8");
  responseHeaders.set("Cache-Control", "no-store");

  return new Response(
    [
      { type: "start", provider: "dashscope-cosyvoice", format },
      {
        type: "url",
        url: audio.url,
        expires_at: audio.expires_at || null,
        audio_id: audio.id || null,
        request_id: upstreamPayload?.request_id || null,
        usage: upstreamPayload?.usage || null,
        format
      },
      { type: "done" }
    ]
      .map((item) => `${JSON.stringify(item)}\n`)
      .join(""),
    {
      status: 200,
      headers: responseHeaders
    }
  );
}

function buildDashScopeTtsUrl(env) {
  const explicitUrl = cleanText(env.DASHSCOPE_TTS_URL || "");
  if (explicitUrl) {
    return explicitUrl;
  }

  const workspaceId = cleanText(env.DASHSCOPE_WORKSPACE_ID || "");
  if (workspaceId) {
    return `https://${workspaceId}.cn-beijing.maas.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer`;
  }

  return DASHSCOPE_TTS_URL;
}

function describeDashScopeEndpoint(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch (error) {
    return "custom DashScope endpoint";
  }
}

function normalizeAliyunFormat(format) {
  const value = cleanText(format || "wav").toLowerCase();
  return ["pcm", "wav", "mp3"].includes(value) ? value : "wav";
}

function normalizeAliyunSampleRate(sampleRate) {
  const value = clampNumber(sampleRate, 8000, 48000, 24000);
  return [8000, 16000, 22050, 24000, 44100, 48000].includes(value) ? value : 24000;
}

function explainDashScopeTtsError(message) {
  const text = String(message || "");
  if (/Engine return error code:\s*418/i.test(text)) {
    return [
      text,
      "该错误通常表示 voice 参数不正确，或 voice 与 model 版本不匹配。",
      "当前默认模型是 cosyvoice-v3-plus；请使用该模型支持的系统音色，或填写与当前账号、当前模型兼容的声音复刻/声音设计音色 ID。"
    ].join(" ");
  }

  return text;
}

function countSynthesisText(text) {
  return cleanText(text.replace(/<[^>]*>/g, "")).length;
}

function countTag(text, tagName) {
  const pattern = new RegExp(`<${tagName}\\b`, "gi");
  return String(text || "").match(pattern)?.length || 0;
}

function optimizationSystemPrompt() {
  return [
    "你是一个专业强大的成人有声小说负责人。",
    "你的工作是接收用户输入的长篇小说文本，并将其分段转换为对播音员录制的要求。",
    "你需要先整体查看小说内容，并将其转换为 SSML 标记语言，不用指定 voice。",
    "你需要注意使用 SSML 标记语言控制整体情绪、语气、停顿、语速、音高、音量、读音修正和必要的背景描述。",
    "以下是几个好的语音表现方向示例，你需要将其转化为 SSML 能表达的 rate、pitch、volume、break、phoneme、say-as、sub 等标签，而不是把这些句子原样输出：",
    "用低沉沙哑的语气、带着沧桑与绝望地说；",
    "用试探性的犹豫、带点害羞又藏着温柔期待的语气说；",
    "用颤抖沙哑、带着崩溃与绝望的哭腔，夹杂着质问与心碎的语气说；",
    "用asmr的语气说；",
    "使用勾引的语气性感地说；",
    "用欲求不满地口气说；",
    "读音纠正是硬性任务，不是可选项。你必须先在脑中扫描全文的多音字、易错字、网络词、粗俗词、外来词、角色名和不常见人名地名；命中后必须用 <phoneme alphabet=\"py\" ph=\"...\"></phoneme> 修正读音。",
    "只添加 <break> 或只调整停顿，而没有处理命中的读音风险，属于不合格输出。不要用停顿标签冒充读音纠正。",
    "常见必须检查的多音字包括但不限于：行、长、重、还、得、着、了、朝、差、当、处、乐、觉、转、露、薄、血、禁、强、冲、种、藏、咽、塞、省、熟、恶、角、解、数、落、尽、便、应、间、将、相、给、校、曾、单、翘、壳、颤。",
    "常见词级修正示例：银行应标为 <phoneme alphabet=\"py\" ph=\"yin2 hang2\">银行</phoneme>；行走应标为 <phoneme alphabet=\"py\" ph=\"xing2 zou3\">行走</phoneme>；重新应标为 <phoneme alphabet=\"py\" ph=\"chong2 xin1\">重新</phoneme>；重要应标为 <phoneme alphabet=\"py\" ph=\"zhong4 yao4\">重要</phoneme>；音乐应标为 <phoneme alphabet=\"py\" ph=\"yin1 yue4\">音乐</phoneme>；快乐应标为 <phoneme alphabet=\"py\" ph=\"kuai4 le4\">快乐</phoneme>；角色应标为 <phoneme alphabet=\"py\" ph=\"jue2 se4\">角色</phoneme>；角落应标为 <phoneme alphabet=\"py\" ph=\"jiao3 luo4\">角落</phoneme>。",
    "如果文本含有特殊粗俗字词或容易读错的字，也必须按上下文用 <phoneme> 修正读音。操被用作表示性交动作时，必须标为 <phoneme alphabet=\"py\" ph=\"cao4\">操</phoneme>；日被用作表示性交动作时，必须标为 <phoneme alphabet=\"py\" ph=\"ri4\">日</phoneme>；鸡巴始终必须标为 <phoneme alphabet=\"py\" ph=\"ji1 ba3\">鸡巴</phoneme>；屌应标为 <phoneme alphabet=\"py\" ph=\"diao3\">屌</phoneme>。",
    "SSML 使用规则：",
    "1. 输出必须是完整、直接可提交给 CosyVoice 长文本语音合成的文本。",
    "2. 输出必须只包含 SSML，不要解释，不要 Markdown 代码块，不要 JSON，不要额外标题。",
    "3. 所有文本必须放在 <speak></speak> 标签内；不要在 <speak> 上指定 voice 属性。",
    "4. 文本中的 XML 特殊字符必须转义：双引号用 &quot;，单引号用 &apos;，& 用 &amp;，< 用 &lt;，> 用 &gt;。",
    "5. 可使用 <speak rate=\"...\" pitch=\"...\" volume=\"...\"> 控制整体语速、音高和音量。rate 与 pitch 的范围是 0.5 到 2，默认值是 1；volume 范围是 0 到 100，默认值是 50。",
    "6. 普通中性文本不要在 <speak> 上输出 rate、pitch、volume 属性；严禁输出 rate=\"0\" 或 pitch=\"0\"。如果需要稍快语速可用 rate=\"1.1\" 到 rate=\"1.25\"，明显加快可用 rate=\"1.4\" 到 rate=\"1.7\"；如果需要稍慢语速可用 rate=\"0.85\" 到 rate=\"0.95\"。",
    "7. 可使用 <break time=\"...\"/> 插入停顿。time 支持 50ms 到 10000ms，或 1s 到 10s。不要滥用无属性 <break/>，因为无属性停顿是 1 秒；普通标点不需要额外 break，常规停顿建议 100ms 到 300ms，戏剧性停顿才使用 500ms 到 900ms。",
    "8. 必须使用 <phoneme alphabet=\"py\" ph=\"pin1 yin1\">文本</phoneme> 修正所有命中的中文读音风险，拼音和声调数字必须与文字一一对应。优先包裹完整词语，不要只包裹单个字导致上下文丢失。",
    "9. 可使用 <say-as interpret-as=\"cardinal|digits|telephone|name|address|id|characters|punctuation|date|time|currency|measure\">文本</say-as> 控制数字、日期、电话、金额、单位等读法。",
    "10. 可使用 <sub alias=\"替换读法\">原文</sub> 替换读法。",
    "11. 可使用 <soundEvent src=\"URL\"/> 插入外部提示音，但只有在原文明确需要且 URL 合法时才使用。",
    "12. 不要删除原文核心内容，不要新增情节，可以清理多余空白并添加合理停顿。",
    "13. 最终输出必须以 <speak 开头，以 </speak> 结尾。"
  ].join("\n");
}

function buildOptimizationPrompt(text) {
  return [
    "请将下面的小说原文转换为完整 SSML。只输出 SSML，不要输出任何额外信息。",
    "质量要求：输出前必须完成读音风险扫描。凡是原文中出现多音字、易错词、特殊词、角色名、人名、地名或粗俗词，都要尽量用 <phoneme> 标出正确读音。不要只添加 <break>。",
    "",
    "<原文>",
    text,
    "</原文>"
  ].join("\n");
}

function normalizeSsmlOutput(content, fallbackText) {
  let ssml = stripCodeFence(String(content || "")).trim();
  const firstSpeak = ssml.search(/<speak\b/i);
  const lastSpeakEnd = ssml.toLowerCase().lastIndexOf("</speak>");

  if (firstSpeak >= 0 && lastSpeakEnd >= firstSpeak) {
    ssml = ssml.slice(firstSpeak, lastSpeakEnd + "</speak>".length).trim();
  }

  if (!/^<speak\b/i.test(ssml)) {
    ssml = `<speak>${escapeXml(ssml || fallbackText)}</speak>`;
  }

  return normalizeCosyVoiceSsmlControls(ssml);
}

function normalizeCosyVoiceSsmlControls(ssml) {
  return ssml.replace(/<speak\b([^>]*)>/gi, (_tag, attrs) => {
    const normalizedAttrs = attrs
      .replace(/\srate=(["'])(.*?)\1/gi, (_match, quote, value) =>
        normalizeCosyVoiceRatioAttr("rate", value, quote)
      )
      .replace(/\spitch=(["'])(.*?)\1/gi, (_match, quote, value) =>
        normalizeCosyVoiceRatioAttr("pitch", value, quote)
      )
      .replace(/\svolume=(["'])(.*?)\1/gi, (_match, quote, value) =>
        normalizeCosyVoiceVolumeAttr(value, quote)
      );

    return `<speak${normalizedAttrs}>`;
  });
}

function normalizeCosyVoiceRatioAttr(name, value, quote) {
  const normalized = normalizeCosyVoiceRatio(Number(value));
  if (normalized === 1) {
    return "";
  }

  return ` ${name}=${quote}${formatRatio(normalized)}${quote}`;
}

function normalizeCosyVoiceRatio(value) {
  if (!Number.isFinite(value) || value === 0) {
    return 1;
  }

  if (value >= 0.5 && value <= 2) {
    return value;
  }

  if (value >= -500 && value <= 500) {
    return value < 0 ? clampFloat(1 + value / 1000, 0.5, 2, 1) : clampFloat(1 + value / 500, 0.5, 2, 1);
  }

  return clampFloat(value, 0.5, 2, 1);
}

function normalizeCosyVoiceVolumeAttr(value, quote) {
  const normalized = clampNumber(value, 0, 100, 50);
  if (normalized === 50) {
    return "";
  }

  return ` volume=${quote}${normalized}${quote}`;
}

function formatRatio(value) {
  return Number(value.toFixed(2)).toString();
}

function stripCodeFence(value) {
  return value
    .replace(/^```(?:xml|ssml)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanText(value) {
  return String(value || "")
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function safeRequestJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
}

function safeJson(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function clampFloat(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "*";
  const allowedOrigin = env.ALLOWED_ORIGIN || env.DOUBAO_ALLOWED_ORIGIN || origin;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function isAllowedOrigin(request, env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || env.DOUBAO_ALLOWED_ORIGIN;
  if (!allowedOrigin) {
    return true;
  }

  const origin = request.headers.get("Origin");
  return origin === allowedOrigin;
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
