const SUBMIT_URL = "https://openspeech.bytedance.com/api/v3/tts/submit";
const QUERY_URL = "https://openspeech.bytedance.com/api/v3/tts/query";
const SUCCESS_CODE = 20000000;
const MAX_TEXT_LENGTH = 100000;

const config = window.DOUBAO_TTS_CONFIG || {};

const voices = [
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
  appId: document.querySelector("#appId"),
  accessKey: document.querySelector("#accessKey"),
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
  copyUrlButton: document.querySelector("#copyUrlButton")
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
  const get = (key, fallback = "") => localStorage.getItem(key) || fallback;

  els.proxyUrl.value = get("doubao.proxyUrl", config.proxyUrl || "");
  els.appId.value = get("doubao.appId");
  els.accessKey.value = sessionStorage.getItem("doubao.accessKey") || "";
  els.customVoice.value = get("doubao.customVoice");
  els.sampleRate.value = get("doubao.sampleRate", "24000");
  els.languageMode.value = get("doubao.languageMode", "auto");
  els.speechRate.value = get("doubao.speechRate", "0");
  els.loudness.value = get("doubao.loudness", "0");

  const savedVoice = get("doubao.voice");
  if (savedVoice && voices.some((voice) => voice.value === savedVoice)) {
    els.voiceSelect.value = savedVoice;
  }
}

function bindEvents() {
  els.textInput.addEventListener("input", updateTextStats);
  els.pasteButton.addEventListener("click", pasteFromClipboard);
  els.clearButton.addEventListener("click", clearText);
  els.synthesizeButton.addEventListener("click", synthesize);
  els.stopButton.addEventListener("click", stopPolling);
  els.copyUrlButton.addEventListener("click", copyAudioUrl);

  [
    els.proxyUrl,
    els.appId,
    els.accessKey,
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
    setStatus("ready", "已粘贴文本", "请检查文本内容和音色设置。");
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

  const controller = new AbortController();
  activeRun = { controller, stopped: false };

  try {
    setStatus("running", "正在提交合成任务", "使用豆包语音合成大模型 2.0 长文本异步接口。");
    setProgress(8);

    const submitBody = buildSubmitBody(text);
    const submitResult = await requestDoubao("submit", submitBody, controller.signal);
    assertSuccess(submitResult.payload, "submit");

    const taskId = submitResult.payload?.data?.task_id;
    if (!taskId) {
      throw new Error("submit 成功但没有返回 task_id。");
    }

    setStatus(
      "running",
      "任务已提交，正在轮询结果",
      `Task ID: ${taskId}${submitResult.logId ? `，Log ID: ${submitResult.logId}` : ""}`
    );
    setProgress(18);

    const queryPayload = await pollTask(taskId, controller.signal);
    const data = queryPayload.data || {};
    if (!data.audio_url) {
      throw new Error("任务已完成，但 query 响应中没有 audio_url。");
    }

    showAudio(data.audio_url, taskId);
    const lengthInfo = data.synthesize_text_length
      ? `实际合成 ${data.synthesize_text_length} 字符。`
      : "合成完成。";
    setStatus("success", "合成完成", `${lengthInfo} 音频链接通常 1 小时内有效。`);
    setProgress(100);
  } catch (error) {
    if (error.name === "AbortError" || activeRun?.stopped) {
      setStatus("warning", "已停止轮询", "服务端任务不会因此取消。如需结果，可以稍后用 task_id 再查。");
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

function buildSubmitBody(text) {
  const speaker = els.customVoice.value.trim() || els.voiceSelect.value;
  const additions = {};
  const languageMode = els.languageMode.value;

  if (languageMode === "auto") {
    additions.enable_language_detector = true;
  } else {
    additions.explicit_language = languageMode;
  }

  return {
    user: {
      uid: "github-pages-user"
    },
    unique_id: cryptoRandomId(),
    namespace: "BidirectionalTTS",
    req_params: {
      text,
      speaker,
      audio_params: {
        format: "mp3",
        sample_rate: Number(els.sampleRate.value),
        speech_rate: Number(els.speechRate.value),
        loudness_rate: Number(els.loudness.value)
      },
      additions: JSON.stringify(additions)
    }
  };
}

async function pollTask(taskId, signal) {
  const startedAt = Date.now();
  const timeoutMs = 10 * 60 * 1000;
  let attempt = 0;

  while (Date.now() - startedAt < timeoutMs) {
    attempt += 1;
    await delay(attempt < 8 ? 2500 : 5000, signal);

    const queryResult = await requestDoubao("query", { task_id: taskId }, signal);
    assertSuccess(queryResult.payload, "query");

    const data = queryResult.payload.data || {};
    const status = data.task_status;

    if (status === 2) {
      setProgress(96);
      return queryResult.payload;
    }

    if (status === 3) {
      throw new Error(queryResult.payload.message || "任务处理失败。");
    }

    const progress = Math.min(92, 18 + attempt * 4);
    setProgress(progress);
    setStatus(
      "running",
      "任务处理中",
      `第 ${attempt} 次查询，已处理 ${data.synthesize_text_length || 0} / ${
        data.req_text_length || "?"
      } 字符。`
    );
  }

  throw new Error("轮询超过 10 分钟仍未完成。长文本可能还在处理，请稍后重新查询。");
}

async function requestDoubao(kind, body, signal) {
  const proxyUrl = normalizeProxyUrl(els.proxyUrl.value.trim());
  const useProxy = Boolean(proxyUrl);
  const url = useProxy ? `${proxyUrl}/${kind}` : kind === "submit" ? SUBMIT_URL : QUERY_URL;
  const headers = {
    "Content-Type": "application/json"
  };

  if (!useProxy) {
    const appId = els.appId.value.trim();
    const accessKey = els.accessKey.value.trim();
    if (!appId || !accessKey) {
      throw new Error("请填写代理地址，或临时输入 App ID 与 Access Key。");
    }

    headers["X-Api-App-Id"] = appId;
    headers["X-Api-Access-Key"] = accessKey;
    headers["X-Api-Resource-Id"] = config.resourceId || "seed-tts-2.0";
    headers["X-Api-Request-Id"] = cryptoRandomId();
  }

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "请求没有到达接口。若你在 GitHub Pages 上直连豆包接口，可能被浏览器 CORS 拦截，请配置代理地址。"
    );
  }

  const text = await response.text();
  const payload = safeJson(text);
  const logId = response.headers.get("X-Tt-Logid") || "";

  if (!response.ok) {
    const message = payload?.message || text || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return { payload, logId };
}

function assertSuccess(payload, stage) {
  if (!payload) {
    throw new Error(`${stage} 返回了空响应。`);
  }

  if (payload.code !== SUCCESS_CODE) {
    throw new Error(`${payload.message || "接口返回错误"}（code: ${payload.code || "unknown"}）`);
  }
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
  els.speechRateValue.textContent = els.speechRate.value;
  els.loudnessValue.textContent = els.loudness.value;
}

function setBusy(isBusy) {
  els.synthesizeButton.disabled = isBusy;
  els.stopButton.disabled = !isBusy;
}

function stopPolling() {
  if (!activeRun) {
    return;
  }
  activeRun.stopped = true;
  activeRun.controller.abort();
}

function showAudio(audioUrl, taskId) {
  latestAudioUrl = audioUrl;
  els.audioPlayer.src = audioUrl;
  els.downloadLink.href = audioUrl;
  els.downloadLink.download = `doubao-tts-${taskId}.mp3`;
  els.downloadLink.removeAttribute("aria-disabled");
  els.audioResult.hidden = false;
}

function resetAudio() {
  latestAudioUrl = "";
  els.audioPlayer.removeAttribute("src");
  els.audioPlayer.load();
  els.downloadLink.href = "#";
  els.downloadLink.setAttribute("aria-disabled", "true");
  els.audioResult.hidden = true;
}

async function copyAudioUrl() {
  if (!latestAudioUrl) {
    return;
  }
  try {
    await navigator.clipboard.writeText(latestAudioUrl);
    setStatus("success", "音频链接已复制", "链接有过期时间，失效后需要重新 query。");
  } catch (error) {
    setStatus("warning", "无法自动复制", "请从下载按钮打开后复制地址。");
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
  localStorage.setItem("doubao.proxyUrl", els.proxyUrl.value.trim());
  localStorage.setItem("doubao.appId", els.appId.value.trim());
  localStorage.setItem("doubao.customVoice", els.customVoice.value.trim());
  localStorage.setItem("doubao.voice", els.voiceSelect.value);
  localStorage.setItem("doubao.sampleRate", els.sampleRate.value);
  localStorage.setItem("doubao.languageMode", els.languageMode.value);
  localStorage.setItem("doubao.speechRate", els.speechRate.value);
  localStorage.setItem("doubao.loudness", els.loudness.value);
  sessionStorage.setItem("doubao.accessKey", els.accessKey.value.trim());
  updateRangeLabels();
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeout = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
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
