const MINIMAX_API_BASE = "https://api.minimaxi.com";
const DEEPSEEK_CHAT_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";
const MAX_MINIMAX_TTS_CHARS = 50000;
const MINIMAX_POLL_INTERVAL_MS = 2000;
const MINIMAX_MAX_POLLS = 180;

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (!isAllowedOrigin(request, env)) {
      return json({ message: "Origin is not allowed" }, 403, cors);
    }

    if (requestUrl.pathname === "/audio") {
      if (request.method !== "GET") {
        return json({ message: "Method not allowed" }, 405, cors);
      }
      return serveExtractedAudio(request, env, cors);
    }

    if (requestUrl.pathname === "/status") {
      if (request.method !== "GET") {
        return json({ message: "Method not allowed" }, 405, cors);
      }
      return getTaskStatus(request, env, cors);
    }

    if (request.method !== "POST") {
      return json({ message: "Method not allowed" }, 405, cors);
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
  const optimized = normalizeMiniMaxTextOutput(content, text);

  return json(
    {
      text: optimized.text,
      ssml: optimized.text,
      pronunciation_dict: { tone: optimized.pronunciationRules },
      meta: {
        source: "deepseek",
        model: payload?.model || env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL,
        text_length: countSynthesisText(optimized.text),
        pronunciation_count: optimized.pronunciationRules.length,
        paralinguistic_count: countMiniMaxParalinguisticTags(optimized.text),
        usage: payload?.usage || null
      }
    },
    200,
    cors
  );
}

async function streamTts(request, env, cors) {
  const apiKey = cleanText(env.MINIMAX_API_KEY || env.MINIMAX_TOKEN || "");
  if (!apiKey) {
    return json({ message: "Proxy is missing MINIMAX_API_KEY" }, 500, cors);
  }

  const body = await safeRequestJson(request);
  const prepared = normalizeMiniMaxTextOutput(body.text || body.ssml || "", "");
  const text = prepared.text;
  if (!text) {
    return json({ message: "text is required" }, 400, cors);
  }

  const textLength = countSynthesisText(text);
  if (textLength > MAX_MINIMAX_TTS_CHARS) {
    return json(
      {
        message: `MiniMax async TTS allows at most ${MAX_MINIMAX_TTS_CHARS} text characters per request. Current request has ${textLength} characters.`
      },
      400,
      cors
    );
  }

  const voice = cleanText(body.voice || body.speaker || "");
  if (!voice) {
    return json(
      {
        message: "voice is required. Select a MiniMax Mandarin female system voice or provide a custom voice ID."
      },
      400,
      cors
    );
  }

  const responseHeaders = new Headers(cors);
  responseHeaders.set("Content-Type", "application/x-ndjson; charset=utf-8");
  responseHeaders.set("Cache-Control", "no-store");

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event) => {
        controller.enqueue(new TextEncoder().encode(`${JSON.stringify(event)}\n`));
      };

      try {
        const model = normalizeMiniMaxModel(body.model);
        const format = normalizeMiniMaxFormat(body.format);
        const sampleRate = normalizeMiniMaxSampleRate(body.sample_rate, format);
        const pronunciationRules = mergePronunciationRules(
          prepared.pronunciationRules,
          collectPronunciationRules(body.pronunciation_dict)
        );
        const requestPayload = buildMiniMaxTtsPayload({
          ...body,
          model,
          text,
          voice,
          format,
          sampleRate,
          pronunciationRules
        });

        send({
          type: "start",
          provider: "minimax",
          model,
          voice,
          format,
          text_length: textLength,
          pronunciation_count: pronunciationRules.length
        });

        const task = await createMiniMaxTtsTask(apiKey, requestPayload);
        send({
          type: "submitted",
          task_id: task.task_id || null,
          file_id: task.file_id || null,
          usage: { characters: task.usage_characters || null }
        });

        const completed = await waitForMiniMaxTask(apiKey, task.task_id || task.taskId, send);
        const fileId = completed.file_id || task.file_id;
        if (!fileId) {
          throw new Error("MiniMax task succeeded but did not return file_id.");
        }

        const file = await retrieveMiniMaxFile(apiKey, fileId);
        const audioUrl = file?.download_url;
        if (!audioUrl) {
          throw new Error("MiniMax file retrieve response did not include file.download_url.");
        }
        const playableUrl = buildWorkerAudioUrl(request, file.file_id || fileId, format);

        send({
          type: "url",
          url: playableUrl,
          archive_url: audioUrl,
          expires_at: null,
          file_id: file.file_id || fileId,
          task_id: completed.task_id || task.task_id || null,
          filename: file.filename || null,
          bytes: file.bytes || null,
          usage: { characters: task.usage_characters || null },
          format
        });
        send({ type: "done" });
      } catch (error) {
        send({
          type: "error",
          message: toErrorMessage(error)
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    status: 200,
    headers: responseHeaders
  });
}

async function serveExtractedAudio(request, env, cors) {
  const apiKey = cleanText(env.MINIMAX_API_KEY || env.MINIMAX_TOKEN || "");
  if (!apiKey) {
    return json({ message: "Proxy is missing MINIMAX_API_KEY" }, 500, cors);
  }

  const requestUrl = new URL(request.url);
  const fileId = cleanText(requestUrl.searchParams.get("file_id") || "");
  if (!fileId) {
    return json({ message: "file_id is required" }, 400, cors);
  }

  const format = normalizeMiniMaxFormat(requestUrl.searchParams.get("format") || "wav");
  const file = await retrieveMiniMaxFile(apiKey, fileId);
  const archiveUrl = file?.download_url;
  if (!archiveUrl) {
    return json({ message: "MiniMax file retrieve response did not include file.download_url" }, 502, cors);
  }

  const archiveResponse = await fetch(archiveUrl);
  if (!archiveResponse.ok) {
    return json(
      { message: `MiniMax audio archive download failed: HTTP ${archiveResponse.status}` },
      archiveResponse.status,
      cors
    );
  }

  const archiveBytes = new Uint8Array(await archiveResponse.arrayBuffer());
  const audio = extractAudioFromTar(archiveBytes, format);
  if (!audio) {
    return json(
      {
        message: "MiniMax archive did not contain a playable audio file",
        expected_format: format
      },
      502,
      cors
    );
  }

  return rangedBinaryResponse(request, audio.bytes, audio.contentType, audio.filename, cors);
}

async function getTaskStatus(request, env, cors) {
  const apiKey = cleanText(env.MINIMAX_API_KEY || env.MINIMAX_TOKEN || "");
  if (!apiKey) {
    return json({ message: "Proxy is missing MINIMAX_API_KEY" }, 500, cors);
  }

  const requestUrl = new URL(request.url);
  const taskId = cleanText(requestUrl.searchParams.get("task_id") || "");
  if (!taskId) {
    return json({ message: "task_id is required" }, 400, cors);
  }

  const format = normalizeMiniMaxFormat(requestUrl.searchParams.get("format") || "mp3");
  const status = await queryMiniMaxTask(apiKey, taskId);
  const normalizedStatus = cleanText(status.status || "").toLowerCase();

  const payload = {
    status: status.status || "Unknown",
    task_id: status.task_id || taskId,
    file_id: status.file_id || null
  };

  if (normalizedStatus === "success" && status.file_id) {
    payload.url = buildWorkerAudioUrl(request, status.file_id, format);
  }

  if (normalizedStatus === "failed" || normalizedStatus === "expired") {
    payload.message = status.base_resp?.status_msg || `MiniMax task ${normalizedStatus}`;
  }

  return json(payload, 200, cors);
}

function buildMiniMaxTtsPayload({
  model,
  text,
  voice,
  format,
  sampleRate,
  speed,
  rate,
  vol,
  volume,
  pitch,
  emotion,
  language_boost,
  voice_modify,
  pronunciationRules
}) {
  const voiceSetting = {
    voice_id: voice,
    speed: clampFloat(speed ?? rate, 0.5, 2, 1),
    vol: clampFloat(vol ?? volume, 0.1, 10, 1),
    pitch: clampNumber(pitch, -12, 12, 0)
  };
  const normalizedEmotion = normalizeMiniMaxEmotion(emotion);
  if (normalizedEmotion) {
    voiceSetting.emotion = normalizedEmotion;
  }

  const payload = {
    model,
    text,
    language_boost: normalizeLanguageBoost(language_boost),
    voice_setting: voiceSetting,
    audio_setting: {
      audio_sample_rate: sampleRate,
      bitrate: 128000,
      format,
      channel: 2
    },
    aigc_watermark: false
  };

  if (pronunciationRules.length > 0) {
    payload.pronunciation_dict = { tone: pronunciationRules };
  }

  const voiceModify = normalizeVoiceModify(voice_modify, format);
  if (voiceModify) {
    payload.voice_modify = voiceModify;
  }

  return payload;
}

async function createMiniMaxTtsTask(apiKey, payload) {
  const response = await fetch(`${MINIMAX_API_BASE}/v1/t2a_async_v2`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await readMiniMaxJsonResponse(response, "MiniMax create task request failed");
  assertMiniMaxSuccess(result, "MiniMax create task failed");
  if (!result.task_id && !result.file_id) {
    throw new Error("MiniMax create task response did not include task_id or file_id.");
  }
  return result;
}

async function waitForMiniMaxTask(apiKey, taskId, send) {
  if (!taskId) {
    throw new Error("MiniMax create task response did not include task_id.");
  }

  for (let index = 0; index < MINIMAX_MAX_POLLS; index += 1) {
    await sleep(MINIMAX_POLL_INTERVAL_MS);
    const status = await queryMiniMaxTask(apiKey, taskId);
    const normalizedStatus = cleanText(status.status || "").toLowerCase();
    send({
      type: "status",
      status: status.status || "Processing",
      task_id: status.task_id || taskId,
      file_id: status.file_id || null
    });

    if (normalizedStatus === "success") {
      return status;
    }
    if (normalizedStatus === "failed" || normalizedStatus === "expired") {
      throw new Error(`MiniMax async TTS task ${normalizedStatus}: ${status.base_resp?.status_msg || "no detail"}`);
    }
  }

  throw new Error("MiniMax async TTS task timed out while waiting for completion.");
}

async function queryMiniMaxTask(apiKey, taskId) {
  const url = new URL(`${MINIMAX_API_BASE}/v1/query/t2a_async_query_v2`);
  url.searchParams.set("task_id", taskId);
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });

  const result = await readMiniMaxJsonResponse(response, "MiniMax query task request failed");
  assertMiniMaxSuccess(result, "MiniMax query task failed");
  return result;
}

async function retrieveMiniMaxFile(apiKey, fileId) {
  const url = new URL(`${MINIMAX_API_BASE}/v1/files/retrieve`);
  url.searchParams.set("file_id", fileId);
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });

  const result = await readMiniMaxJsonResponse(response, "MiniMax file retrieve request failed");
  assertMiniMaxSuccess(result, "MiniMax file retrieve failed");
  return result.file;
}

async function readMiniMaxJsonResponse(response, fallbackMessage) {
  const raw = await response.text();
  const payload = safeJson(raw);
  if (!response.ok) {
    const message = payload?.base_resp?.status_msg || payload?.error?.message || payload?.message || raw;
    throw new Error(`${fallbackMessage}: ${message || `HTTP ${response.status}`}`);
  }
  if (!payload) {
    throw new Error(`${fallbackMessage}: response was not valid JSON`);
  }
  return payload;
}

function assertMiniMaxSuccess(payload, fallbackMessage) {
  const statusCode = payload?.base_resp?.status_code;
  if (typeof statusCode === "number" && statusCode !== 0) {
    throw new Error(`${fallbackMessage}: ${payload.base_resp?.status_msg || `status_code ${statusCode}`}`);
  }
}

function normalizeMiniMaxTextOutput(content, fallbackText) {
  let value = stripCodeFence(String(content || "")).trim();
  if (!value) {
    value = cleanText(fallbackText || "");
  }

  const firstSpeak = value.search(/<speak\b/i);
  const lastSpeakEnd = value.toLowerCase().lastIndexOf("</speak>");
  if (firstSpeak >= 0 && lastSpeakEnd >= firstSpeak) {
    value = value.slice(firstSpeak, lastSpeakEnd + "</speak>".length);
  }

  const pronunciationRules = [];
  value = value.replace(/<phoneme\b([^>]*)>([\s\S]*?)<\/phoneme>/gi, (_match, attrs, inner) => {
    const word = cleanText(stripXmlTags(unescapeXml(inner)));
    const ph = getXmlAttr(attrs, "ph");
    const rule = pronunciationRuleFromPhoneme(word, ph);
    if (rule) {
      pronunciationRules.push(rule);
    }
    return word;
  });

  value = value.replace(/<sub\b([^>]*)>([\s\S]*?)<\/sub>/gi, (_match, attrs, inner) => {
    const alias = getXmlAttr(attrs, "alias");
    return cleanText(unescapeXml(alias || inner));
  });

  value = value.replace(/<break\b[^>]*\/?>/gi, "，");
  value = value.replace(/<\/?speak\b[^>]*>/gi, "");
  value = stripXmlTags(value);
  value = unescapeXml(value);
  value = cleanText(value);

  return {
    text: value,
    pronunciationRules: mergePronunciationRules(pronunciationRules, requiredPronunciationRules(value))
  };
}

function pronunciationRuleFromPhoneme(word, ph) {
  const cleanWord = cleanText(word);
  const syllables = cleanText(ph)
    .split(/\s+/)
    .map((part) => part.replace(/[()]/g, "").trim())
    .filter(Boolean);
  if (!cleanWord || syllables.length === 0) {
    return "";
  }

  return `${cleanWord}/${syllables.map((syllable) => `(${syllable})`).join("")}`;
}

function requiredPronunciationRules(text) {
  const rules = [];
  const value = String(text || "");
  if (value.includes("鸡巴")) {
    rules.push("鸡巴/(ji1)(ba3)");
  }
  if (value.includes("屌")) {
    rules.push("屌/(diao3)");
  }
  return rules;
}

function collectPronunciationRules(value) {
  if (!value || typeof value !== "object") {
    return [];
  }
  if (!Array.isArray(value.tone)) {
    return [];
  }

  return value.tone.map((rule) => cleanText(rule)).filter(Boolean);
}

function mergePronunciationRules(...ruleGroups) {
  const seen = new Set();
  const result = [];
  for (const rules of ruleGroups) {
    for (const rule of rules || []) {
      const normalized = cleanText(rule);
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      result.push(normalized);
    }
  }
  return result;
}

function normalizeMiniMaxFormat(format) {
  const value = cleanText(format || "mp3").toLowerCase();
  return ["mp3", "pcm", "flac", "wav", "pcmu_raw", "pcmu_wav", "opus"].includes(value) ? value : "mp3";
}

function normalizeMiniMaxModel(model) {
  const value = cleanText(model || "");
  return ["speech-2.8-turbo", "speech-2.8-hd"].includes(value) ? value : "speech-2.8-turbo";
}

function normalizeVoiceModify(value, format) {
  if (!value || typeof value !== "object") {
    return null;
  }
  if (!["mp3", "wav", "flac"].includes(format)) {
    return null;
  }

  return {
    pitch: clampNumber(value.pitch, -100, 100, 0),
    intensity: clampNumber(value.intensity, -100, 100, 0),
    timbre: clampNumber(value.timbre, -100, 100, 0)
  };
}

function buildWorkerAudioUrl(request, fileId, format) {
  const url = new URL(request.url);
  url.pathname = "/audio";
  url.search = "";
  url.searchParams.set("file_id", fileId);
  url.searchParams.set("format", format);
  return url.toString();
}

function extractAudioFromTar(bytes, preferredFormat) {
  const preferredExt = `.${String(preferredFormat || "").toLowerCase()}`;
  const audioExtensions = [preferredExt, ".wav", ".mp3", ".flac", ".opus", ".pcm", ".pcmu_wav", ".pcmu_raw"]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
  const entries = [];
  let offset = 0;

  while (offset + 512 <= bytes.byteLength) {
    const header = bytes.subarray(offset, offset + 512);
    if (isZeroBlock(header)) {
      break;
    }

    const name = decodeTarString(header, 0, 100);
    const prefix = decodeTarString(header, 345, 155);
    const filename = prefix ? `${prefix}/${name}` : name;
    const size = parseTarOctal(header, 124, 12);
    const typeFlag = String.fromCharCode(header[156] || 48);
    const dataStart = offset + 512;
    const dataEnd = dataStart + size;

    if (dataEnd > bytes.byteLength) {
      break;
    }

    if ((typeFlag === "0" || typeFlag === "\0") && size > 0) {
      const lowerName = filename.toLowerCase();
      if (audioExtensions.some((extension) => lowerName.endsWith(extension))) {
        entries.push({
          filename: filename.split("/").pop() || `output${preferredExt || ".wav"}`,
          bytes: bytes.slice(dataStart, dataEnd)
        });
      }
    }

    offset = dataStart + Math.ceil(size / 512) * 512;
  }

  const exact = entries.find((entry) => entry.filename.toLowerCase().endsWith(preferredExt));
  const selected = exact || entries[0];
  if (!selected) {
    return null;
  }

  return {
    ...selected,
    contentType: audioContentType(selected.filename)
  };
}

function isZeroBlock(bytes) {
  for (const byte of bytes) {
    if (byte !== 0) {
      return false;
    }
  }
  return true;
}

function decodeTarString(bytes, start, length) {
  const slice = bytes.subarray(start, start + length);
  let end = slice.indexOf(0);
  if (end < 0) {
    end = slice.length;
  }
  return new TextDecoder().decode(slice.subarray(0, end)).trim();
}

function parseTarOctal(bytes, start, length) {
  const value = decodeTarString(bytes, start, length).replace(/\0/g, "").trim();
  const parsed = Number.parseInt(value || "0", 8);
  return Number.isFinite(parsed) ? parsed : 0;
}

function audioContentType(filename) {
  const lowerName = String(filename || "").toLowerCase();
  if (lowerName.endsWith(".wav") || lowerName.endsWith(".pcmu_wav")) return "audio/wav";
  if (lowerName.endsWith(".mp3")) return "audio/mpeg";
  if (lowerName.endsWith(".flac")) return "audio/flac";
  if (lowerName.endsWith(".opus")) return "audio/ogg";
  return "application/octet-stream";
}

function rangedBinaryResponse(request, bytes, contentType, filename, cors) {
  const headers = new Headers(cors);
  const total = bytes.byteLength;
  headers.set("Content-Type", contentType);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "private, max-age=300");
  headers.set("Content-Disposition", `inline; filename="${safeHeaderFilename(filename)}"`);

  const range = request.headers.get("Range");
  if (range) {
    const parsed = parseRangeHeader(range, total);
    if (!parsed) {
      headers.set("Content-Range", `bytes */${total}`);
      return new Response(null, { status: 416, headers });
    }

    const chunk = bytes.slice(parsed.start, parsed.end + 1);
    headers.set("Content-Range", `bytes ${parsed.start}-${parsed.end}/${total}`);
    headers.set("Content-Length", String(chunk.byteLength));
    return new Response(chunk, {
      status: 206,
      headers
    });
  }

  headers.set("Content-Length", String(total));
  return new Response(bytes, {
    status: 200,
    headers
  });
}

function parseRangeHeader(range, total) {
  const match = String(range || "").match(/^bytes=(\d*)-(\d*)$/);
  if (!match) {
    return null;
  }

  let start = match[1] ? Number(match[1]) : 0;
  let end = match[2] ? Number(match[2]) : total - 1;

  if (!match[1] && match[2]) {
    const suffixLength = Number(match[2]);
    start = Math.max(0, total - suffixLength);
    end = total - 1;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= total) {
    return null;
  }

  return {
    start,
    end: Math.min(end, total - 1)
  };
}

function safeHeaderFilename(filename) {
  return String(filename || "output.wav").replace(/[^a-zA-Z0-9._-]/g, "_");
}

function normalizeMiniMaxSampleRate(sampleRate, format) {
  const value = clampNumber(sampleRate, 8000, 48000, 32000);
  if (format === "opus") {
    return [8000, 12000, 16000, 24000, 48000].includes(value) ? value : 24000;
  }
  return [8000, 16000, 22050, 24000, 32000, 44100].includes(value) ? value : 32000;
}

function normalizeLanguageBoost(value) {
  const languageBoost = cleanText(value || "");
  return languageBoost || "Chinese";
}

function normalizeMiniMaxEmotion(value) {
  const emotion = cleanText(value || "").toLowerCase();
  const supported = ["happy", "sad", "angry", "fearful", "disgusted", "surprised", "calm", "fluent"];
  return supported.includes(emotion) ? emotion : "";
}

function countSynthesisText(text) {
  return cleanText(String(text || "").replace(/<[^>]*>/g, "")).length;
}

function countMiniMaxParalinguisticTags(text) {
  const tags = [
    "laughs",
    "chuckle",
    "coughs",
    "clear-throat",
    "groans",
    "breath",
    "pant",
    "inhale",
    "exhale",
    "gasps",
    "sniffs",
    "sighs",
    "snorts",
    "burps",
    "lip-smacking",
    "humming",
    "hissing",
    "emm",
    "whistles",
    "sneezes",
    "crying",
    "applause"
  ];
  const pattern = new RegExp(`\\((${tags.join("|")})\\)`, "gi");
  return String(text || "").match(pattern)?.length || 0;
}

function optimizationSystemPrompt() {
  return [
    "你是一个专业强大的成人有声小说负责人。",
    "你的工作是接收用户输入的长篇小说文本，并在其中判断是否存在部分语气词，如果结合上下文，存在语气词，根据语气词插入语气词标签。",
    "语气词标签有：",
    "(laughs)（笑声）、(chuckle)（轻笑）、(coughs)（咳嗽）、(clear-throat)（清嗓子）、(groans)（呻吟）、(breath)（正常换气）、(pant)（喘气）、(inhale)（吸气）、(exhale)（呼气）、(gasps)（倒吸气）、(sniffs)（吸鼻子）、(sighs)（叹气）、(snorts)（喷鼻息）、(burps)（打嗝）、(lip-smacking)（咂嘴）、(humming)（哼唱）、(hissing)（嘶嘶声）、(emm)（嗯）、(whistles)（口哨）、(sneezes)（喷嚏）、(crying)（抽泣）、(applause)（鼓掌）",
    "例如，用户输入：",
    "“",
    "崔砚文发出压抑的呻吟。",
    "“啊……好久没人碰我了……翟帅……轻点……”",
    "”",
    "那么你修改后应为：",
    "“",
    "崔砚文发出压抑的呻吟。",
    "“啊(groans)……好久没人碰我了(groans)……翟帅……轻点(groans)……”",
    "”",
    "你不要更改文章内容，但是可以适当根据上下文添加语气词标签，来达成更棒的效果，例如，用户输入：",
    "\"",
    "王天琳被前后夹击，身体很快就到了崩溃边缘。",
    "“要去了……要去了……啊——！！！”",
    "\"",
    "你可以修改为：",
    "\"",
    "王天琳被前后夹击，身体很快就到了崩溃边缘。",
    "“要去了(pant)……要去了(emm)(groans)……啊——！！！(exhale)(gasps)”",
    "\"",
    "或者用户输入：",
    "\"",
    "崔砚文被操得眼泪直流，声音却越来越浪：",
    "“操我……用力操我……啊（呻吟）……干死我这个快饿死的骚逼吧(pant)……我好爽(emm)……要去了(groans)……要去了(groans)——！！！”",
    "\"",
    "注意，以上示例仅仅用于说明穿插时机，你应该总结经验融会贯通，而不是直接照搬匹配。",
    "你的回答应该仅仅包含添加了语气词以后的完整内容，不要包含解释性内容。"
  ].join("\n");
}

function buildOptimizationPrompt(text) {
  return [
    "请根据上下文给下面的小说原文添加合适的 MiniMax 语气词标签。只输出添加语气词后的完整内容，不要输出任何解释、标题、JSON 或 Markdown。",
    "不要更改文章内容，不要新增情节，不要删除原文，只能在合适位置插入允许的语气词标签。",
    "",
    "<原文>",
    text,
    "</原文>"
  ].join("\n");
}

function getXmlAttr(attrs, name) {
  const pattern = new RegExp(`${name}\\s*=\\s*([\"'])(.*?)\\1`, "i");
  const match = String(attrs || "").match(pattern);
  return match ? unescapeXml(match[2]) : "";
}

function stripXmlTags(value) {
  return String(value || "").replace(/<[^>]*>/g, "");
}

function stripCodeFence(value) {
  return value
    .replace(/^```(?:xml|ssml|text)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function unescapeXml(value) {
  return String(value || "")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toErrorMessage(error) {
  return error?.message || "Unknown error";
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "*";
  const allowedOrigin = env.ALLOWED_ORIGIN || env.DOUBAO_ALLOWED_ORIGIN || origin;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Range",
    "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range, Content-Disposition",
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
  if (!origin) {
    return true;
  }
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
