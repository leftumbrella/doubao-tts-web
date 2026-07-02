const MAX_TEXT_LENGTH = 10000;
const MAX_ALIYUN_TTS_CHARS = 10000;
const TTS_MODEL = "cosyvoice-v3-plus";

const config = window.ALIYUN_TTS_CONFIG || window.DOUBAO_TTS_CONFIG || {};

const doubaoVoices = [
  ["通用场景", "Vivi 2.0", "zh_female_vv_uranus_bigtts"],
  ["通用场景", "小何 2.0", "zh_female_xiaohe_uranus_bigtts"],
  ["通用场景", "魅力苏菲 2.0", "zh_female_sophie_uranus_bigtts"],
  ["通用场景", "清新女声 2.0", "zh_female_qingxinnvsheng_uranus_bigtts"],
  ["通用场景", "甜美小源 2.0", "zh_female_tianmeixiaoyuan_uranus_bigtts"],
  ["通用场景", "甜美桃子 2.0", "zh_female_tianmeitaozi_uranus_bigtts"],
  ["通用场景", "爽快思思 2.0", "zh_female_shuangkuaisisi_uranus_bigtts"],
  ["通用场景", "邻家女孩 2.0", "zh_female_linjianvhai_uranus_bigtts"],
  ["通用场景", "魅力女友 2.0", "zh_female_meilinvyou_uranus_bigtts"],
  ["通用场景", "温柔妈妈 2.0", "zh_female_wenroumama_uranus_bigtts"],
  ["通用场景", "TVB女声 2.0", "zh_female_tvbnv_uranus_bigtts"],
  ["通用场景", "俏皮女声 2.0", "zh_female_qiaopinv_uranus_bigtts"],
  ["通用场景", "婆婆 2.0", "zh_female_popo_uranus_bigtts"],
  ["通用场景", "高冷御姐 2.0", "zh_female_gaolengyujie_uranus_bigtts"],
  ["通用场景", "温柔淑女 2.0", "zh_female_wenroushunv_uranus_bigtts"],
  ["通用场景", "萌丫头/Cutey 2.0", "zh_female_mengyatou_uranus_bigtts"],
  ["通用场景", "贴心女声/Candy 2.0", "zh_female_tiexinnvsheng_uranus_bigtts"],
  ["通用场景", "鸡汤妹妹/Hope 2.0", "zh_female_jitangmei_uranus_bigtts"],
  ["通用场景", "开朗姐姐 2.0", "zh_female_kailangjiejie_uranus_bigtts"],
  ["通用场景", "娇喘女声 2.0", "zh_female_jiaochuannv_uranus_bigtts"],
  ["通用场景", "谄媚女声 2.0", "zh_female_chanmeinv_uranus_bigtts"],
  ["通用场景", "亲切女声 2.0", "zh_female_qinqienv_uranus_bigtts"],
  ["通用场景", "文静毛毛 2.0", "zh_female_wenjingmaomao_uranus_bigtts"],
  ["通用场景", "知性女声 2.0", "zh_female_zhixingnv_uranus_bigtts"],
  ["通用场景", "清澈梓梓 2.0", "zh_female_qingchezizi_uranus_bigtts"],
  ["通用场景", "甜美悦悦 2.0", "zh_female_tianmeiyueyue_uranus_bigtts"],
  ["通用场景", "心灵鸡汤 2.0", "zh_female_xinlingjitang_uranus_bigtts"],
  ["通用场景", "柔美女友 2.0", "zh_female_roumeinvyou_uranus_bigtts"],
  ["通用场景", "温柔小雅 2.0", "zh_female_wenrouxiaoya_uranus_bigtts"],
  ["角色扮演", "知性灿灿 2.0", "zh_female_cancan_uranus_bigtts"],
  ["角色扮演", "撒娇学妹 2.0", "zh_female_sajiaoxuemei_uranus_bigtts"],
  ["角色扮演", "直率英子 2.0", "zh_female_zhishuaiyingzi_uranus_bigtts"],
  ["角色扮演", "樱桃丸子 2.0", "zh_female_yingtaowanzi_uranus_bigtts"],
  ["角色扮演", "古风少御 2.0", "zh_female_gufengshaoyu_uranus_bigtts"],
  ["角色扮演", "林潇 2.0", "zh_female_linxiao_uranus_bigtts"],
  ["角色扮演", "玲玲姐姐 2.0", "zh_female_lingling_uranus_bigtts"],
  ["角色扮演", "春日部姐姐 2.0", "zh_female_chunribu_uranus_bigtts"],
  ["角色扮演", "感冒电音姐姐 2.0", "zh_female_ganmaodianyin_uranus_bigtts"],
  ["角色扮演", "女雷神 2.0", "zh_female_nvleishen_uranus_bigtts"],
  ["角色扮演", "武则天 2.0", "zh_female_wuzetian_uranus_bigtts"],
  ["角色扮演", "顾姐 2.0", "zh_female_gujie_uranus_bigtts"],
  ["视频配音", "佩奇猪 2.0", "zh_female_peiqi_uranus_bigtts"],
  ["视频配音", "黑猫侦探社咪仔 2.0", "zh_female_mizai_uranus_bigtts"],
  ["视频配音", "鸡汤女 2.0", "zh_female_jitangnv_uranus_bigtts"],
  ["视频配音", "流畅女声 2.0", "zh_female_liuchangnv_uranus_bigtts"],
  ["教育场景", "Tina老师 2.0", "zh_female_yingyujiaoxue_uranus_bigtts"],
  ["客服场景", "暖阳女声 2.0", "zh_female_kefunvsheng_uranus_bigtts"],
  ["有声阅读", "儿童绘本 2.0", "zh_female_xiaoxue_uranus_bigtts"],
  ["有声阅读", "少儿故事 2.0", "zh_female_shaoergushi_uranus_bigtts"],
  ["角色扮演,S2S-SC", "傲娇女友 2.0", "ICL_uranus_zh_female_aojiaonvyou_tob"],
  ["角色扮演", "傲慢娇声 2.0", "ICL_uranus_zh_female_aomanjiaosheng_tob"],
  ["角色扮演", "邪魅女王 2.0", "ICL_uranus_zh_female_xiemeinvwang_tob"],
  ["角色扮演,S2S-SC", "病娇姐姐 2.0", "ICL_uranus_zh_female_bingjiaojiejie_tob"],
  ["角色扮演", "病娇萌妹 2.0", "ICL_uranus_zh_female_bingjiaomengmei_tob"],
  ["角色扮演", "病弱少女 2.0", "ICL_uranus_zh_female_bingruoshaonv_tob"],
  ["角色扮演", "成熟温柔 2.0", "ICL_uranus_zh_female_chengshuwenrou_tob"],
  ["角色扮演,S2S-SC", "成熟姐姐 2.0", "ICL_uranus_zh_female_chengshujiejie_tob"],
  ["角色扮演", "纯真少女 2.0", "ICL_uranus_zh_female_chunzhenshaonv_tob"],
  ["通用场景", "纯澈女生 2.0", "ICL_uranus_zh_female_chunchenvsheng_tob"],
  ["角色扮演", "妩媚可人 2.0", "ICL_uranus_zh_female_wumeikeren_tob"],
  ["客服场景", "乖巧可儿 2.0", "ICL_uranus_zh_female_guaiqiaokeer_tob"],
  ["视频配音", "和蔼奶奶 2.0", "ICL_uranus_zh_female_heainainai_tob"],
  ["角色扮演", "活泼刁蛮 2.0", "ICL_uranus_zh_female_huopodiaoman_tob"],
  ["角色扮演", "活泼女孩 2.0", "ICL_uranus_zh_female_huoponvhai_tob"],
  ["角色扮演", "娇憨女王 2.0", "ICL_uranus_zh_female_jiaohannvwang_tob"],
  ["角色扮演", "娇弱萝莉 2.0", "ICL_uranus_zh_female_jiaoruoluoli_tob"],
  ["角色扮演", "假小子 2.0", "ICL_uranus_zh_female_jiaxiaozi_tob"],
  ["角色扮演", "精灵向导 2.0", "ICL_uranus_zh_female_jinglingxiangdao_tob"],
  ["客服场景", "开朗婷婷 2.0", "ICL_uranus_zh_female_kailangtingting_tob"],
  ["客服场景", "开心小鸿 2.0", "ICL_uranus_zh_female_kaixinxiaohong_tob"],
  ["角色扮演,S2S-SC", "可爱女生 2.0", "ICL_uranus_zh_female_keainvsheng_tob"],
  ["客服场景", "灵动欣欣 2.0", "ICL_uranus_zh_female_lingdongxinxin_tob"],
  ["视频配音", "邻居阿姨 2.0", "ICL_uranus_zh_female_linjuayi_tob"],
  ["角色扮演", "甜美娇俏 2.0", "ICL_uranus_zh_female_tianmeijiaoqiao_tob"],
  ["角色扮演", "清冷高雅 2.0", "ICL_uranus_zh_female_qinglenggaoya_tob"],
  ["客服场景", "理性圆子 2.0", "ICL_uranus_zh_female_lixingyuanzi_tob"],
  ["角色扮演", "性感魅惑 2.0", "ICL_uranus_zh_female_xingganmeihuo_tob"],
  ["客服场景", "暖心茜茜 2.0", "ICL_uranus_zh_female_nuanxinqianqian_tob"],
  ["角色扮演,S2S-SC", "暖心学姐 2.0", "ICL_uranus_zh_female_nuanxinxuejie_tob"],
  ["客服场景", "清甜莓莓 2.0", "ICL_uranus_zh_female_qingtianmeimei_tob"],
  ["客服场景", "清甜桃桃 2.0", "ICL_uranus_zh_female_qingtiantaotao_tob"],
  ["客服场景", "清晰小雪 2.0", "ICL_uranus_zh_female_qingxixiaoxue_tob"],
  ["视频配音", "倾心少女 2.0", "ICL_uranus_zh_female_qingxinshaonv_tob"],
  ["角色扮演", "柔骨魂师 2.0", "ICL_uranus_zh_female_rouguhunshi_tob"],
  ["客服场景", "软萌糖糖 2.0", "ICL_uranus_zh_female_ruanmengtangtang_tob"],
  ["客服场景", "软萌团子 2.0", "ICL_uranus_zh_female_ruanmengtuanzi_tob"],
  ["角色扮演", "甜美活泼 2.0", "ICL_uranus_zh_female_tianmeihuopo_tob"],
  ["客服场景", "甜美小橘 2.0", "ICL_uranus_zh_female_tianmeixiaoju_tob"],
  ["客服场景", "甜美小雨 2.0", "ICL_uranus_zh_female_tianmeixiaoyu_tob"],
  ["角色扮演", "调皮公主 2.0", "ICL_uranus_zh_female_tiaopigongzhu_tob"],
  ["角色扮演,S2S-SC", "贴心女友 2.0", "ICL_uranus_zh_female_tiexinnvyou_tob"],
  ["通用场景", "温柔女神 2.0", "ICL_uranus_zh_female_wenrounvshen_tob"],
  ["通用场景,S2S-SC", "温柔文雅 2.0", "ICL_uranus_zh_female_wenrouwenya_tob"],
  ["通用场景", "知心姐姐 2.0", "ICL_uranus_zh_female_zhixinjiejie_tob"],
  ["角色扮演,S2S-SC", "妩媚御姐 2.0", "ICL_uranus_zh_female_wumeiyujie_tob"],
  ["通用场景", "元气甜妹 2.0", "ICL_uranus_zh_female_yuanqitianmei_tob"],
  ["角色扮演", "邪魅御姐 2.0", "ICL_uranus_zh_female_xiemeiyujie_tob"],
  ["角色扮演,S2S-SC", "性感御姐 2.0", "ICL_uranus_zh_female_xingganyujie_tob"],
  ["客服场景", "秀丽倩倩 2.0", "ICL_uranus_zh_female_xiuliqianqian_tob"],
  ["通用场景", "贴心闺蜜 2.0", "ICL_uranus_zh_female_tiexinguimi_tob"],
  ["通用场景", "贴心妹妹 2.0", "ICL_uranus_zh_female_tiexinmeimei_tob"],
  ["通用场景", "温柔白月光 2.0", "ICL_uranus_zh_female_wenroubaiyueguang_tob"],
  ["通用场景", "初恋女友 2.0", "ICL_uranus_zh_female_chuliannvyou_tob"],
  ["通用场景", "知性温婉 2.0", "ICL_uranus_zh_female_zhixingwenwan_tob"],
  ["客服场景", "温婉珊珊 2.0", "ICL_uranus_zh_female_wenwanshanshan_tob"],
  ["客服场景", "热情艾娜 2.0", "ICL_uranus_zh_female_reqingaina_tob"],
  ["客服场景", "轻盈朵朵 2.0", "ICL_uranus_zh_female_qingyingduoduo_tob"]
].map(([scene, label, value]) => ({ label, value, scene }));

const voices = [
  ["系统音色", "龙安洋 · 阳光大男孩", "longanyang"],
  ["系统音色", "龙安欢 · 欢脱元气女", "longanhuan"],
  ["自定义音色", "使用下方自定义 voice", ""]
].map(([scene, label, value]) => ({ label, value, scene }));

const els = {
  textInput: document.querySelector("#textInput"),
  pasteButton: document.querySelector("#pasteButton"),
  clearButton: document.querySelector("#clearButton"),
  voiceSelect: document.querySelector("#voiceSelect"),
  customVoice: document.querySelector("#customVoice"),
  sampleRate: document.querySelector("#sampleRate"),
  languageMode: document.querySelector("#languageMode"),
  speechRate: document.querySelector("#speechRate"),
  loudness: document.querySelector("#loudness"),
  speechRateValue: document.querySelector("#speechRateValue"),
  loudnessValue: document.querySelector("#loudnessValue"),
  proxyUrl: document.querySelector("#proxyUrl"),
  charCount: document.querySelector("#charCount"),
  illegalCount: document.querySelector("#illegalCount"),
  statusIndicator: document.querySelector("#statusIndicator"),
  statusTitle: document.querySelector("#statusTitle"),
  statusDetail: document.querySelector("#statusDetail"),
  progressFill: document.querySelector("#progressFill"),
  synthesizeButton: document.querySelector("#synthesizeButton"),
  stopButton: document.querySelector("#stopButton"),
  audioResult: document.querySelector("#audioResult"),
  audioPlayer: document.querySelector("#audioPlayer"),
  downloadLink: document.querySelector("#downloadLink"),
  copyUrlButton: document.querySelector("#copyUrlButton"),
  deepseekOutput: document.querySelector("#deepseekOutput"),
  deepseekCount: document.querySelector("#deepseekCount"),
  deepseekList: document.querySelector("#deepseekList")
};

let activeRun = null;
let latestAudioUrl = "";

init();

function init() {
  fillVoiceOptions();
  restoreSettings();
  bindEvents();
  updateTextStats();
  updateRangeLabels();
  refreshIcons();
}

function fillVoiceOptions() {
  els.voiceSelect.innerHTML = voices
    .map((voice) => {
      const label = `${voice.label} · ${voice.scene}`;
      return `<option value="${escapeHtml(voice.value)}">${escapeHtml(label)}</option>`;
    })
    .join("");
}

function restoreSettings() {
  const get = (key, fallback = "", legacyKey = "") =>
    localStorage.getItem(key) || (legacyKey ? localStorage.getItem(legacyKey) : "") || fallback;
  const urlProxy = new URLSearchParams(window.location.search).get("proxy");

  els.proxyUrl.value = urlProxy || config.proxyUrl || get("aliyun.proxyUrl", "", "doubao.proxyUrl");
  els.customVoice.value = get("aliyun.customVoice", "", "doubao.customVoice");
  els.sampleRate.value = get("aliyun.sampleRate", "24000", "doubao.sampleRate");
  els.languageMode.value = get("aliyun.format", "wav");
  els.speechRate.value = get("aliyun.speechRate", "0", "doubao.speechRate");
  els.loudness.value = get("aliyun.volume", "0", "doubao.loudness");
  if (!["8000", "16000", "22050", "24000", "44100", "48000"].includes(els.sampleRate.value)) {
    els.sampleRate.value = "24000";
  }
  if (!["wav", "mp3", "pcm"].includes(els.languageMode.value)) {
    els.languageMode.value = "wav";
  }

  const savedVoice = get("aliyun.voice", "", "doubao.voice");
  if (savedVoice && voices.some((voice) => voice.value === savedVoice)) {
    els.voiceSelect.value = savedVoice;
  }
}

function bindEvents() {
  els.textInput.addEventListener("input", updateTextStats);
  els.pasteButton.addEventListener("click", pasteFromClipboard);
  els.clearButton.addEventListener("click", clearText);
  els.synthesizeButton.addEventListener("click", synthesize);
  els.stopButton.addEventListener("click", stopSynthesis);
  els.copyUrlButton.addEventListener("click", copyAudioUrl);

  [
    els.proxyUrl,
    els.customVoice,
    els.voiceSelect,
    els.sampleRate,
    els.languageMode,
    els.speechRate,
    els.loudness
  ].forEach((element) => {
    element.addEventListener("input", saveSettings);
    element.addEventListener("change", saveSettings);
  });

  els.speechRate.addEventListener("input", updateRangeLabels);
  els.loudness.addEventListener("input", updateRangeLabels);
}

async function pasteFromClipboard() {
  if (!navigator.clipboard?.readText) {
    els.textInput.focus();
    setStatus("warning", "浏览器不支持直接读取剪贴板", "请使用系统粘贴快捷键。");
    return;
  }

  try {
    const clipboardText = await navigator.clipboard.readText();
    insertAtSelection(clipboardText);
    setStatus("ready", "已粘贴文本", "DeepSeek 会在合成前转换为完整 SSML。");
  } catch (error) {
    els.textInput.focus();
    setStatus("warning", "剪贴板权限被浏览器拦截", "请使用系统粘贴快捷键。");
  }
}

function insertAtSelection(text) {
  const start = els.textInput.selectionStart ?? els.textInput.value.length;
  const end = els.textInput.selectionEnd ?? els.textInput.value.length;
  const current = els.textInput.value;
  const nextValue = `${current.slice(0, start)}${text}${current.slice(end)}`.slice(
    0,
    MAX_TEXT_LENGTH
  );
  els.textInput.value = nextValue;
  const nextCursor = Math.min(start + text.length, MAX_TEXT_LENGTH);
  els.textInput.setSelectionRange(nextCursor, nextCursor);
  els.textInput.focus();
  updateTextStats();
}

function clearText() {
  els.textInput.value = "";
  updateTextStats();
  setStatus("ready", "已清空文本", "可以粘贴新的长文本。");
}

async function synthesize() {
  const text = els.textInput.value.trim();
  const validation = validateText(text);
  if (!validation.ok) {
    setStatus("error", validation.title, validation.detail);
    return;
  }

  saveSettings();
  setBusy(true);
  resetAudio();
  resetDeepSeekOutput();

  const controller = new AbortController();
  activeRun = { controller, stopped: false };

  try {
    const proxyUrl = requireProxyUrl();
    const speaker = resolveVoice();
    setStatus("running", "DeepSeek 正在生成 SSML", "正在将长文本转换为可直接提交 CosyVoice 的 SSML。");
    setProgress(4);

    const optimizeResult = await optimizeSsml(proxyUrl, text, controller.signal);
    const ssml = optimizeResult.ssml;
    if (!ssml) {
      throw new Error("DeepSeek 没有返回可合成的 SSML。");
    }
    renderDeepSeekOutput(ssml, optimizeResult.meta);
    setProgress(24);

    const sampleRate = Number(els.sampleRate.value);
    const audioFormat = els.languageMode.value;
    const ttsTextLength = countSsmlText(ssml);
    if (ttsTextLength > MAX_ALIYUN_TTS_CHARS) {
      throw new Error(
        `阿里云 CosyVoice 长文本单次最多 ${MAX_ALIYUN_TTS_CHARS} 字符，DeepSeek 整理后正文为 ${ttsTextLength} 字符。`
      );
    }

    setStatus(
      "running",
      "正在调用阿里云 CosyVoice 长文本合成",
      `将 DeepSeek 生成的 SSML 作为 1 次请求提交，正文 ${ttsTextLength} 字符。`
    );
    setProgress(28);

    const speechResult = await streamLongText(
      proxyUrl,
      {
        ssml,
        voice: speaker,
        model: TTS_MODEL,
        format: audioFormat,
        sample_rate: sampleRate,
        volume: mapAliyunVolume(Number(els.loudness.value)),
        rate: mapDashScopeRate(Number(els.speechRate.value)),
        pitch: 1,
        enable_ssml: true
      },
      controller.signal,
      (event) => {
        if (event.type === "url") {
          setProgress(96);
        }
      }
    );

    if (!speechResult.url) {
      throw new Error("语音合成完成但没有返回音频 URL。");
    }

    showAudio(speechResult.url, `${TTS_MODEL}-${Date.now()}.${audioFormat}`);
    setStatus(
      "success",
      "合成完成",
      `已通过 ${TTS_MODEL} 生成音频 URL，有效期约 24 小时。`
    );
    setProgress(100);
  } catch (error) {
    if (error.name === "AbortError" || activeRun?.stopped) {
      setStatus("warning", "已停止合成", "当前请求已取消，已生成的临时音频没有保存。");
      setProgress(0);
    } else {
      setStatus("error", "合成失败", toErrorMessage(error));
      setProgress(0);
    }
  } finally {
    setBusy(false);
    activeRun = null;
  }
}

async function optimizeSsml(proxyUrl, text, signal) {
  const response = await fetch(`${proxyUrl}/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal
  });

  const payload = await safeResponseJson(response);
  if (!response.ok) {
    throw new Error(payload?.message || `DeepSeek optimization failed: HTTP ${response.status}`);
  }

  return {
    ssml: String(payload.ssml || "").trim(),
    meta: payload.meta || null
  };
}

async function streamLongText(proxyUrl, body, signal, onEvent) {
  const response = await fetch(`${proxyUrl}/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    const payload = await safeResponseJson(response);
    throw new Error(payload?.message || `DashScope CosyVoice request failed: HTTP ${response.status}`);
  }

  if (!response.body) {
    throw new Error("当前浏览器不支持读取流式响应。");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const result = {
    url: "",
    expiresAt: null,
    requestId: "",
    usage: null
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = safeJson(line);
      if (!event) continue;
      if (event.type === "error") {
        throw new Error(event.message || "DashScope CosyVoice returned an error.");
      }
      if (event.type === "url" && event.url) {
        result.url = event.url;
        result.expiresAt = event.expires_at || null;
        result.requestId = event.request_id || "";
        result.usage = event.usage || null;
      }
      onEvent?.(event);
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    const event = safeJson(buffer.trim());
    if (event?.type === "error") {
      throw new Error(event.message || "DashScope CosyVoice returned an error.");
    }
    if (event?.type === "url" && event.url) {
      result.url = event.url;
      result.expiresAt = event.expires_at || null;
      result.requestId = event.request_id || "";
      result.usage = event.usage || null;
    }
    onEvent?.(event);
  }

  return result;
}

function countSsmlText(ssml) {
  return ssml.replace(/<[^>]*>/g, "").length;
}

function mapDashScopeRate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  if (number < 0) {
    return Math.max(0.5, 1 + number / 100);
  }
  return Math.min(2, 1 + number / 100);
}

function mapAliyunVolume(value) {
  return clampNumber(Number(value) + 50, 0, 100, 50);
}

function validateText(text) {
  if (!text) {
    return { ok: false, title: "请输入要合成的文本", detail: "文本不能为空。" };
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return {
      ok: false,
      title: "文本超过长度限制",
      detail: `当前 ${text.length} 字符，单次最多 ${MAX_TEXT_LENGTH} 字符。`
    };
  }

  const illegalCount = countIllegalControls(text);
  if (illegalCount / text.length > 0.1) {
    return {
      ok: false,
      title: "非法控制符比例过高",
      detail: "请清理文本中的控制符后再提交。制表符和换行符可以保留。"
    };
  }

  return { ok: true };
}

function updateTextStats() {
  const text = els.textInput.value;
  els.charCount.textContent = String(text.length);
  els.illegalCount.textContent = String(countIllegalControls(text));
}

function countIllegalControls(text) {
  return (text.match(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g) || []).length;
}

function updateRangeLabels() {
  els.speechRateValue.textContent = `${mapDashScopeRate(Number(els.speechRate.value)).toFixed(2)}x`;
  els.loudnessValue.textContent = String(mapAliyunVolume(Number(els.loudness.value)));
}

function setBusy(isBusy) {
  els.synthesizeButton.disabled = isBusy;
  els.stopButton.disabled = !isBusy;
}

function stopSynthesis() {
  if (!activeRun) {
    return;
  }
  activeRun.stopped = true;
  activeRun.controller.abort();
}

function showAudio(audioUrl, fileName) {
  if (latestAudioUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(latestAudioUrl);
  }

  latestAudioUrl = audioUrl;
  els.audioPlayer.src = audioUrl;
  els.downloadLink.href = audioUrl;
  els.downloadLink.download = fileName;
  els.downloadLink.removeAttribute("aria-disabled");
  els.audioResult.hidden = false;
}

function resetAudio() {
  if (latestAudioUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(latestAudioUrl);
  }

  latestAudioUrl = "";
  els.audioPlayer.removeAttribute("src");
  els.audioPlayer.load();
  els.downloadLink.href = "#";
  els.downloadLink.setAttribute("aria-disabled", "true");
  els.audioResult.hidden = true;
}

function resetDeepSeekOutput() {
  els.deepseekOutput.hidden = true;
  els.deepseekOutput.open = false;
  els.deepseekCount.textContent = "0 字";
  els.deepseekList.innerHTML = "";
}

function renderDeepSeekOutput(ssml, meta) {
  els.deepseekOutput.hidden = false;
  els.deepseekCount.textContent = `${countSsmlText(ssml)} 字`;
  els.deepseekList.innerHTML = `
    <article class="deepseek-item">
      <div class="deepseek-meta">
        <span>SSML</span>
        <span>${escapeHtml(meta?.model || "deepseek")}</span>
        <span>${escapeHtml(String(ssml.length))} 字符含标签</span>
        <span>${escapeHtml(String(meta?.phoneme_count ?? 0))} 个读音修正</span>
        <span>${escapeHtml(String(meta?.break_count ?? 0))} 个停顿</span>
      </div>
      <pre class="instruction">${escapeHtml(ssml)}</pre>
    </article>
  `;
}

async function copyAudioUrl() {
  if (!latestAudioUrl) {
    return;
  }

  if (latestAudioUrl.startsWith("blob:")) {
    setStatus("warning", "当前音频是本地生成的 Blob", "请使用下载按钮保存音频文件，Blob 链接不能分享。");
    return;
  }

  try {
    await navigator.clipboard.writeText(latestAudioUrl);
    setStatus("success", "已复制音频链接", "该链接由 DashScope 返回，通常 24 小时内有效。");
  } catch (error) {
    setStatus("warning", "复制失败", "浏览器没有授予剪贴板权限，可以手动复制播放器地址。");
  }
}

function setStatus(type, title, detail) {
  els.statusTitle.textContent = title;
  els.statusDetail.textContent = detail;
  els.statusIndicator.className = "status-indicator";

  if (type === "running") {
    els.statusIndicator.classList.add("is-running");
  }

  if (type === "error") {
    els.statusIndicator.classList.add("is-error");
  }

  if (type === "warning") {
    els.statusIndicator.classList.add("is-warning");
  }
}

function setProgress(value) {
  els.progressFill.style.width = `${Math.max(0, Math.min(100, value))}%`;
}

function saveSettings() {
  localStorage.setItem("aliyun.proxyUrl", els.proxyUrl.value.trim());
  localStorage.setItem("aliyun.customVoice", els.customVoice.value.trim());
  localStorage.setItem("aliyun.voice", els.voiceSelect.value);
  localStorage.setItem("aliyun.sampleRate", els.sampleRate.value);
  localStorage.setItem("aliyun.format", els.languageMode.value);
  localStorage.setItem("aliyun.speechRate", els.speechRate.value);
  localStorage.setItem("aliyun.volume", els.loudness.value);
  updateRangeLabels();
}

function requireProxyUrl() {
  const proxyUrl = normalizeProxyUrl(els.proxyUrl.value.trim());
  if (!proxyUrl) {
    throw new Error("阿里云长文本合成必须通过 Worker 代理调用，请填写代理地址。");
  }
  return proxyUrl;
}

function resolveVoice() {
  const selectedVoice = els.voiceSelect.value.trim();
  if (selectedVoice) {
    return selectedVoice;
  }

  const customVoice = els.customVoice.value.trim();
  if (!customVoice) {
    throw new Error("请选择系统音色，或在“自定义 voice”中填写声音复刻/声音设计音色 ID。");
  }
  return customVoice;
}

async function safeResponseJson(response) {
  const text = await response.text();
  return safeJson(text) || { message: text };
}

function throwIfStopped(signal) {
  if (signal.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

function normalizeProxyUrl(value) {
  return value.replace(/\/+$/, "");
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function cryptoRandomId() {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function toErrorMessage(error) {
  return error?.message || "未知错误。";
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
