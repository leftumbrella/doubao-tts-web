const MAX_TEXT_LENGTH = 50000;
const MAX_MINIMAX_TTS_CHARS = 50000;

const config = window.MINIMAX_TTS_CONFIG || window.ALIYUN_TTS_CONFIG || window.DOUBAO_TTS_CONFIG || {};

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
  ["中文普通话女声", "少女音色", "female-shaonv"],
  ["中文普通话女声", "御姐音色", "female-yujie"],
  ["中文普通话女声", "成熟女性音色", "female-chengshu"],
  ["中文普通话女声", "甜美女性音色", "female-tianmei"],
  ["中文普通话女声", "少女音色-beta", "female-shaonv-jingpin"],
  ["中文普通话女声", "御姐音色-beta", "female-yujie-jingpin"],
  ["中文普通话女声", "成熟女性音色-beta", "female-chengshu-jingpin"],
  ["中文普通话女声", "甜美女性音色-beta", "female-tianmei-jingpin"],
  ["中文普通话女声", "萌萌女童", "lovely_girl"],
  ["中文普通话女声", "甜心小玲", "tianxin_xiaoling"],
  ["中文普通话女声", "俏皮萌妹", "qiaopi_mengmei"],
  ["中文普通话女声", "妩媚御姐", "wumei_yujie"],
  ["中文普通话女声", "嗲嗲学妹", "diadia_xuemei"],
  ["中文普通话女声", "淡雅学姐", "danya_xuejie"],
  ["中文普通话女声", "新闻女声", "Chinese (Mandarin)_News_Anchor"],
  ["中文普通话女声", "傲娇御姐", "Chinese (Mandarin)_Mature_Woman"],
  ["中文普通话女声", "嚣张小姐", "Arrogant_Miss"],
  ["中文普通话女声", "热心大婶", "Chinese (Mandarin)_Kind-hearted_Antie"],
  ["中文普通话女声", "港普空姐", "Chinese (Mandarin)_HK_Flight_Attendant"],
  ["中文普通话女声", "温暖闺蜜", "Chinese (Mandarin)_Warm_Bestie"],
  ["中文普通话女声", "甜美女声", "Chinese (Mandarin)_Sweet_Lady"],
  ["中文普通话女声", "阅历姐姐", "Chinese (Mandarin)_Wise_Women"],
  ["中文普通话女声", "温暖少女", "Chinese (Mandarin)_Warm_Girl"],
  ["中文普通话女声", "花甲奶奶", "Chinese (Mandarin)_Kind-hearted_Elder"],
  ["中文普通话女声", "温柔学姐", "Chinese (Mandarin)_Gentle_Senior"],
  ["中文普通话女声", "清脆少女", "Chinese (Mandarin)_Crisp_Girl"],
  ["中文普通话女声", "柔和少女", "Chinese (Mandarin)_Soft_Girl"]
].map(([scene, label, value]) => ({ label, value, scene }));

const els = {
  textInput: document.querySelector("#textInput"),
  pasteButton: document.querySelector("#pasteButton"),
  clearButton: document.querySelector("#clearButton"),
  voiceSelect: document.querySelector("#voiceSelect"),
  hideVoiceButton: document.querySelector("#hideVoiceButton"),
  hiddenVoiceList: document.querySelector("#hiddenVoiceList"),
  hiddenVoiceCount: document.querySelector("#hiddenVoiceCount"),
  pronunciationRules: document.querySelector("#pronunciationRules"),
  ttsModel: document.querySelector("#ttsModel"),
  currentModelLabel: document.querySelector("#currentModelLabel"),
  sampleRate: document.querySelector("#sampleRate"),
  languageMode: document.querySelector("#languageMode"),
  speechRate: document.querySelector("#speechRate"),
  pitch: document.querySelector("#pitch"),
  loudness: document.querySelector("#loudness"),
  effectPitch: document.querySelector("#effectPitch"),
  effectIntensity: document.querySelector("#effectIntensity"),
  effectTimbre: document.querySelector("#effectTimbre"),
  speechRateValue: document.querySelector("#speechRateValue"),
  pitchValue: document.querySelector("#pitchValue"),
  loudnessValue: document.querySelector("#loudnessValue"),
  effectPitchValue: document.querySelector("#effectPitchValue"),
  effectIntensityValue: document.querySelector("#effectIntensityValue"),
  effectTimbreValue: document.querySelector("#effectTimbreValue"),
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
  deepseekList: document.querySelector("#deepseekList"),
  taskList: document.querySelector("#taskList"),
  taskCount: document.querySelector("#taskCount")
};

const MAX_TASK_HISTORY = 20;
const TASK_STATUS_LABELS = {
  running: "运行中",
  success: "成功",
  error: "失败",
  stopped: "已停止"
};

let activeRun = null;
let latestAudioUrl = "";
let hiddenVoiceIds = new Set();
let tasks = [];

init();

function init() {
  restoreSettings();
  fillVoiceOptions(localStorage.getItem("minimax.voice") || localStorage.getItem("aliyun.voice") || "");
  updateModelLabel();
  loadTasks();
  bindEvents();
  updateTextStats();
  updateRangeLabels();
  refreshIcons();
}

function fillVoiceOptions(preferredValue = els.voiceSelect.value) {
  const visibleVoices = getVisibleVoices();
  els.voiceSelect.innerHTML = visibleVoices
    .map((voice) => {
      const label = `${voice.label} · ${voice.scene}`;
      return `<option value="${escapeHtml(voice.value)}">${escapeHtml(label)}</option>`;
    })
    .join("");

  const nextValue = visibleVoices.some((voice) => voice.value === preferredValue)
    ? preferredValue
    : visibleVoices[0]?.value || "";
  els.voiceSelect.value = nextValue;
  updateVoiceManagement();
}

function restoreSettings() {
  const get = (key, fallback = "", legacyKey = "") =>
    localStorage.getItem(key) || (legacyKey ? localStorage.getItem(legacyKey) : "") || fallback;
  const urlProxy = new URLSearchParams(window.location.search).get("proxy");

  els.proxyUrl.value = urlProxy || config.proxyUrl || get("minimax.proxyUrl", "", "aliyun.proxyUrl");
  els.pronunciationRules.value = get("minimax.pronunciationRules", "");
  hiddenVoiceIds = parseHiddenVoiceIds(get("minimax.hiddenVoices", ""));
  els.ttsModel.value = get("minimax.model", "speech-2.8-turbo");
  els.sampleRate.value = get("minimax.sampleRate", "32000", "aliyun.sampleRate");
  els.languageMode.value = get("minimax.format", "mp3", "aliyun.format");
  els.speechRate.value = get("minimax.speechRate", "0", "aliyun.speechRate");
  els.pitch.value = get("minimax.pitch", "0");
  els.loudness.value = get("minimax.volume", "0", "aliyun.volume");
  els.effectPitch.value = get("minimax.effectPitch", "0");
  els.effectIntensity.value = get("minimax.effectIntensity", "0");
  els.effectTimbre.value = get("minimax.effectTimbre", "0");
  if (!["8000", "16000", "22050", "24000", "32000", "44100"].includes(els.sampleRate.value)) {
    els.sampleRate.value = "32000";
  }
  if (!["mp3", "wav", "flac", "pcm"].includes(els.languageMode.value)) {
    els.languageMode.value = "mp3";
  }
  if (!["speech-2.8-turbo", "speech-2.8-hd"].includes(els.ttsModel.value)) {
    els.ttsModel.value = "speech-2.8-turbo";
  }

  removeInvalidHiddenVoices();
}

function bindEvents() {
  els.textInput.addEventListener("input", updateTextStats);
  els.pasteButton.addEventListener("click", pasteFromClipboard);
  els.clearButton.addEventListener("click", clearText);
  els.synthesizeButton.addEventListener("click", synthesize);
  els.stopButton.addEventListener("click", stopSynthesis);
  els.copyUrlButton.addEventListener("click", copyAudioUrl);
  els.hideVoiceButton.addEventListener("click", hideSelectedVoice);
  els.hiddenVoiceList.addEventListener("click", restoreHiddenVoice);
  els.taskList.addEventListener("click", handleTaskListClick);

  [
    els.proxyUrl,
    els.pronunciationRules,
    els.ttsModel,
    els.voiceSelect,
    els.sampleRate,
    els.languageMode,
    els.speechRate,
    els.pitch,
    els.loudness,
    els.effectPitch,
    els.effectIntensity,
    els.effectTimbre
  ].forEach((element) => {
    element.addEventListener("input", saveSettings);
    element.addEventListener("change", saveSettings);
  });

  els.speechRate.addEventListener("input", updateRangeLabels);
  els.voiceSelect.addEventListener("change", updateVoiceManagement);
  els.pitch.addEventListener("input", updateRangeLabels);
  els.loudness.addEventListener("input", updateRangeLabels);
  els.effectPitch.addEventListener("input", updateRangeLabels);
  els.effectIntensity.addEventListener("input", updateRangeLabels);
  els.effectTimbre.addEventListener("input", updateRangeLabels);
  els.ttsModel.addEventListener("change", updateModelLabel);
}

function getVisibleVoices() {
  const visible = voices.filter((voice) => !hiddenVoiceIds.has(voice.value));
  return visible.length > 0 ? visible : voices;
}

function parseHiddenVoiceIds(value) {
  const parsed = safeJson(value);
  if (!Array.isArray(parsed)) {
    return new Set();
  }

  const validIds = new Set(voices.map((voice) => voice.value));
  return new Set(parsed.filter((voiceId) => validIds.has(String(voiceId))));
}

function removeInvalidHiddenVoices() {
  const validIds = new Set(voices.map((voice) => voice.value));
  hiddenVoiceIds = new Set([...hiddenVoiceIds].filter((voiceId) => validIds.has(voiceId)));
  if (hiddenVoiceIds.size >= voices.length) {
    hiddenVoiceIds = new Set();
  }
}

function hideSelectedVoice() {
  const selectedVoice = els.voiceSelect.value;
  const visibleVoices = getVisibleVoices();
  if (!selectedVoice || visibleVoices.length <= 1) {
    setStatus("warning", "至少保留一个音色", "当前只剩一个可用音色，不能继续隐藏。");
    return;
  }

  hiddenVoiceIds.add(selectedVoice);
  fillVoiceOptions("");
  saveSettings();
  setStatus("ready", "已隐藏当前音色", "该音色已移入设置里的隐藏列表，可以随时恢复。");
}

function restoreHiddenVoice(event) {
  const button = event.target.closest("[data-restore-voice]");
  if (!button) {
    return;
  }

  const voiceId = button.dataset.restoreVoice;
  hiddenVoiceIds.delete(voiceId);
  fillVoiceOptions(voiceId);
  saveSettings();
  setStatus("ready", "已恢复音色", "该音色已经回到主音色列表。");
}

function updateVoiceManagement() {
  const visibleVoices = getVisibleVoices();
  els.hideVoiceButton.disabled = visibleVoices.length <= 1;
  renderHiddenVoices();
}

function renderHiddenVoices() {
  const hiddenVoices = voices.filter((voice) => hiddenVoiceIds.has(voice.value));
  els.hiddenVoiceCount.textContent = `${hiddenVoices.length} 个隐藏`;

  if (hiddenVoices.length === 0) {
    els.hiddenVoiceList.innerHTML = '<p class="empty-note">暂无隐藏音色。</p>';
    return;
  }

  els.hiddenVoiceList.innerHTML = hiddenVoices
    .map(
      (voice) => `
        <div class="hidden-voice-row">
          <div>
            <strong>${escapeHtml(voice.label)}</strong>
            <span>${escapeHtml(voice.scene)}</span>
          </div>
          <button class="icon-button ghost restore-voice-button" type="button" data-restore-voice="${escapeHtml(voice.value)}">
            <i data-lucide="rotate-ccw" aria-hidden="true"></i>
            <span>恢复</span>
          </button>
        </div>
      `
    )
    .join("");
  refreshIcons();
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
    setStatus("ready", "已粘贴文本", "DeepSeek 会在合成前添加 MiniMax 语气词标签。");
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
  let currentTask = null;

  try {
    const proxyUrl = requireProxyUrl();
    const speaker = resolveVoice();
    const sampleRate = Number(els.sampleRate.value);
    const audioFormat = els.languageMode.value;
    const ttsModel = els.ttsModel.value;
    const voiceMeta = voices.find((voice) => voice.value === speaker);
    const voiceLabel = voiceMeta ? `${voiceMeta.label} · ${voiceMeta.scene}` : speaker;

    currentTask = createTaskRecord({
      format: audioFormat,
      voiceLabel,
      voiceId: speaker,
      model: ttsModel,
      sampleRate,
      textPreview: text.slice(0, 60)
    });

    setStatus("running", "DeepSeek 正在添加语气词", "正在根据上下文插入 MiniMax 语气词标签。");
    setProgress(4);

    const optimizeResult = await optimizeForMiniMax(proxyUrl, text, controller.signal);
    const optimizedText = optimizeResult.text;
    if (!optimizedText) {
      throw new Error("DeepSeek 没有返回可合成的文本。");
    }
    renderDeepSeekOutput(optimizedText, optimizeResult.meta);
    updateTaskRecord(currentTask.id, { deepseekText: optimizedText, deepseekMeta: optimizeResult.meta || null });
    setProgress(24);

    const ttsTextLength = countSynthesisText(optimizedText);
    if (ttsTextLength > MAX_MINIMAX_TTS_CHARS) {
      throw new Error(
        `MiniMax 异步语音合成单次最多 ${MAX_MINIMAX_TTS_CHARS} 字符，DeepSeek 整理后正文为 ${ttsTextLength} 字符。`
      );
    }

    setStatus(
      "running",
      "正在创建 MiniMax 异步语音任务",
      `将 DeepSeek 生成的文本作为 1 次请求提交，正文 ${ttsTextLength} 字符。`
    );
    setProgress(28);

    const pronunciationDict = mergePronunciationDicts(
      optimizeResult.pronunciationDict,
      { tone: parsePronunciationRules(els.pronunciationRules.value) }
    );

    const speechResult = await streamLongText(
      proxyUrl,
      {
        text: optimizedText,
        pronunciation_dict: pronunciationDict,
        voice: speaker,
        model: ttsModel,
        format: audioFormat,
        sample_rate: sampleRate,
        vol: mapMiniMaxVolume(Number(els.loudness.value)),
        speed: mapMiniMaxSpeed(Number(els.speechRate.value)),
        pitch: mapMiniMaxPitch(Number(els.pitch.value)),
        voice_modify: buildVoiceModify(audioFormat),
        language_boost: "Chinese"
      },
      controller.signal,
      (event) => {
        if (event.type === "submitted") {
          setProgress(36);
          setStatus("running", "MiniMax 任务已提交", `任务 ID：${event.task_id || "等待返回"}`);
          updateTaskRecord(currentTask.id, { taskId: event.task_id || null });
        }
        if (event.type === "status") {
          setProgress(48);
          setStatus("running", "MiniMax 正在合成", `当前状态：${event.status || "Processing"}`);
        }
        if (event.type === "url") {
          setProgress(96);
          updateTaskRecord(currentTask.id, { fileId: event.file_id || null });
        }
      }
    );

    if (!speechResult.url) {
      throw new Error("语音合成完成但没有返回音频 URL。");
    }

    showAudio(speechResult.url, `${ttsModel}-${Date.now()}.${audioFormat}`);
    setStatus(
      "success",
      "合成完成",
      `已通过 ${ttsModel} 生成音频，播放器使用 Worker 解包后的音频流。`
    );
    setProgress(100);
    updateTaskRecord(currentTask.id, { status: "success", errorMessage: null });
  } catch (error) {
    if (error.name === "AbortError" || activeRun?.stopped) {
      setStatus("warning", "已停止合成", "当前请求已取消，已生成的临时音频没有保存。");
      setProgress(0);
      if (currentTask) {
        updateTaskRecord(currentTask.id, { status: "stopped", errorMessage: "用户手动停止。" });
      }
    } else {
      setStatus("error", "合成失败", toErrorMessage(error));
      setProgress(0);
      if (currentTask) {
        updateTaskRecord(currentTask.id, { status: "error", errorMessage: toErrorMessage(error) });
      }
    }
  } finally {
    setBusy(false);
    activeRun = null;
  }
}

async function optimizeForMiniMax(proxyUrl, text, signal) {
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
    text: String(payload.text || payload.ssml || "").trim(),
    pronunciationDict: payload.pronunciation_dict || { tone: [] },
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
    throw new Error(payload?.message || `MiniMax TTS request failed: HTTP ${response.status}`);
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
        throw new Error(event.message || "MiniMax TTS returned an error.");
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
      throw new Error(event.message || "MiniMax TTS returned an error.");
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

function countSynthesisText(text) {
  return String(text || "").replace(/<[^>]*>/g, "").length;
}

function mapMiniMaxSpeed(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  if (number < 0) {
    return Math.max(0.5, 1 + number / 100);
  }
  return Math.min(2, 1 + number / 100);
}

function mapMiniMaxVolume(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  if (number < 0) {
    return Math.max(0.1, 1 + number / 100);
  }
  return Math.min(10, 1 + number / 50);
}

function mapMiniMaxPitch(value) {
  return clampNumber(value, -12, 12, 0);
}

function mapVoiceModifyValue(value) {
  return clampNumber(value, -100, 100, 0);
}

function buildVoiceModify(format) {
  if (!["mp3", "wav", "flac"].includes(format)) {
    return null;
  }

  return {
    pitch: mapVoiceModifyValue(Number(els.effectPitch.value)),
    intensity: mapVoiceModifyValue(Number(els.effectIntensity.value)),
    timbre: mapVoiceModifyValue(Number(els.effectTimbre.value))
  };
}

function parsePronunciationRules(value) {
  const text = String(value || "").trim();
  if (!text) {
    return [];
  }

  if (text.startsWith("[")) {
    const parsed = safeJson(text);
    if (Array.isArray(parsed)) {
      return normalizePronunciationRules(parsed);
    }
  }

  return normalizePronunciationRules(text.split(/\r?\n/));
}

function normalizePronunciationRules(rules) {
  const seen = new Set();
  const normalized = [];
  for (const rule of rules) {
    const value = String(rule || "").trim();
    if (!value || value.startsWith("#") || !value.includes("/")) {
      continue;
    }
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    normalized.push(value);
  }
  return normalized;
}

function mergePronunciationDicts(...dicts) {
  const tone = normalizePronunciationRules(dicts.flatMap((dict) => dict?.tone || []));
  return { tone };
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
  els.speechRateValue.textContent = `${mapMiniMaxSpeed(Number(els.speechRate.value)).toFixed(2)}x`;
  els.pitchValue.textContent = String(mapMiniMaxPitch(Number(els.pitch.value)));
  els.loudnessValue.textContent = `${mapMiniMaxVolume(Number(els.loudness.value)).toFixed(2)}x`;
  els.effectPitchValue.textContent = String(mapVoiceModifyValue(Number(els.effectPitch.value)));
  els.effectIntensityValue.textContent = String(mapVoiceModifyValue(Number(els.effectIntensity.value)));
  els.effectTimbreValue.textContent = String(mapVoiceModifyValue(Number(els.effectTimbre.value)));
}

function updateModelLabel() {
  els.currentModelLabel.textContent = els.ttsModel.value;
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

function renderDeepSeekOutput(text, meta) {
  els.deepseekOutput.hidden = false;
  els.deepseekCount.textContent = `${countSynthesisText(text)} 字`;
  els.deepseekList.innerHTML = `
    <article class="deepseek-item">
      <div class="deepseek-meta">
        <span>MiniMax 文本</span>
        <span>${escapeHtml(meta?.model || "deepseek")}</span>
        <span>${escapeHtml(String(text.length))} 字符</span>
        <span>${escapeHtml(String(meta?.paralinguistic_count ?? 0))} 个语气词</span>
      </div>
      <pre class="instruction">${escapeHtml(text)}</pre>
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
    setStatus("success", "已复制音频链接", "该链接会通过 Worker 解包 MiniMax 结果包并返回音频流。");
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
  localStorage.setItem("minimax.proxyUrl", els.proxyUrl.value.trim());
  localStorage.setItem("minimax.pronunciationRules", els.pronunciationRules.value.trim());
  localStorage.setItem("minimax.hiddenVoices", JSON.stringify([...hiddenVoiceIds]));
  localStorage.setItem("minimax.model", els.ttsModel.value);
  localStorage.setItem("minimax.voice", els.voiceSelect.value);
  localStorage.setItem("minimax.sampleRate", els.sampleRate.value);
  localStorage.setItem("minimax.format", els.languageMode.value);
  localStorage.setItem("minimax.speechRate", els.speechRate.value);
  localStorage.setItem("minimax.pitch", els.pitch.value);
  localStorage.setItem("minimax.volume", els.loudness.value);
  localStorage.setItem("minimax.effectPitch", els.effectPitch.value);
  localStorage.setItem("minimax.effectIntensity", els.effectIntensity.value);
  localStorage.setItem("minimax.effectTimbre", els.effectTimbre.value);
  updateRangeLabels();
}

function loadTasks() {
  const parsed = safeJson(localStorage.getItem("minimax.tasks") || "");
  tasks = Array.isArray(parsed) ? parsed.slice(0, MAX_TASK_HISTORY) : [];
  renderTaskList();
}

function persistTasks() {
  tasks = tasks.slice(0, MAX_TASK_HISTORY);
  localStorage.setItem("minimax.tasks", JSON.stringify(tasks));
}

function createTaskRecord(fields) {
  const record = {
    id: cryptoRandomId(),
    taskId: null,
    fileId: null,
    format: fields.format,
    status: "running",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    voiceLabel: fields.voiceLabel,
    voiceId: fields.voiceId,
    model: fields.model,
    sampleRate: fields.sampleRate,
    textPreview: fields.textPreview,
    deepseekText: "",
    deepseekMeta: null,
    errorMessage: null
  };

  tasks.unshift(record);
  persistTasks();
  renderTaskList();
  return record;
}

function updateTaskRecord(id, patch) {
  const record = tasks.find((task) => task.id === id);
  if (!record) {
    return;
  }

  Object.assign(record, patch, { updatedAt: new Date().toISOString() });
  persistTasks();
  renderTaskList();
}

function buildAudioUrl(fileId, format) {
  const proxyUrl = normalizeProxyUrl(els.proxyUrl.value.trim());
  if (!proxyUrl || !fileId) {
    return "";
  }
  return `${proxyUrl}/audio?file_id=${encodeURIComponent(fileId)}&format=${encodeURIComponent(format || "mp3")}`;
}

function renderTaskList() {
  const openIds = new Set(
    [...els.taskList.querySelectorAll("details.task-item[open]")].map((el) => el.dataset.taskId)
  );

  els.taskCount.textContent = `${tasks.length} 个任务`;

  if (tasks.length === 0) {
    els.taskList.innerHTML = '<p class="empty-note">暂无合成任务。</p>';
    return;
  }

  els.taskList.innerHTML = tasks.map(renderTaskItem).join("");
  els.taskList.querySelectorAll("details.task-item").forEach((el) => {
    if (openIds.has(el.dataset.taskId)) {
      el.open = true;
    }
  });
  refreshIcons();
}

function renderTaskItem(task) {
  const audioUrl = task.status === "success" ? buildAudioUrl(task.fileId, task.format) : "";
  const statusLabel = TASK_STATUS_LABELS[task.status] || task.status;
  const createdAtDisplay = formatTaskTimestamp(task.createdAt);

  return `
    <details class="settings-details task-item" data-task-id="${task.id}">
      <summary>
        <span>
          <span class="task-status-dot is-${task.status}"></span>
          ${escapeHtml(task.voiceLabel)} · ${escapeHtml(task.model)} · ${createdAtDisplay}
        </span>
        <strong>${escapeHtml(statusLabel)}</strong>
      </summary>
      <div class="settings-body task-item-body">
        <p class="microcopy">
          任务 ID：${escapeHtml(task.taskId || "—")} ｜ 文件 ID：${escapeHtml(task.fileId || "—")}
        </p>
        <p class="microcopy">原文预览：${escapeHtml(task.textPreview || "—")}</p>
        ${task.errorMessage ? `<p class="microcopy task-error">${escapeHtml(task.errorMessage)}</p>` : ""}
        ${
          task.status === "running"
            ? `<button class="button subtle" type="button" data-refresh-task="${task.id}">
                <i data-lucide="refresh-cw" aria-hidden="true"></i>
                刷新状态
              </button>`
            : ""
        }
        ${audioUrl ? `<audio controls preload="none" src="${audioUrl}"></audio>` : ""}
        ${
          audioUrl
            ? `<a class="button secondary" href="${audioUrl}" download="${escapeHtml(task.model)}-${task.id}.${escapeHtml(task.format)}">
                <i data-lucide="download" aria-hidden="true"></i>
                下载音频
              </a>`
            : ""
        }
        ${
          task.deepseekText
            ? `<details class="deepseek-output" open>
                <summary>
                  <span>DeepSeek 输出</span>
                  <strong>${task.deepseekText.length} 字</strong>
                </summary>
                <div class="deepseek-list">
                  <article class="deepseek-item">
                    <pre class="instruction">${escapeHtml(task.deepseekText)}</pre>
                  </article>
                </div>
              </details>`
            : ""
        }
      </div>
    </details>
  `;
}

function formatTaskTimestamp(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function handleTaskListClick(event) {
  const button = event.target.closest("[data-refresh-task]");
  if (!button) {
    return;
  }
  refreshTaskStatus(button.dataset.refreshTask);
}

async function refreshTaskStatus(id) {
  const record = tasks.find((task) => task.id === id);
  if (!record || !record.taskId) {
    return;
  }

  try {
    const proxyUrl = requireProxyUrl();
    const response = await fetch(
      `${proxyUrl}/status?task_id=${encodeURIComponent(record.taskId)}&format=${encodeURIComponent(record.format)}`
    );
    const payload = await safeResponseJson(response);
    if (!response.ok) {
      throw new Error(payload?.message || `HTTP ${response.status}`);
    }

    const normalizedStatus = String(payload.status || "").toLowerCase();
    if (normalizedStatus === "success" && payload.file_id) {
      updateTaskRecord(id, { status: "success", fileId: payload.file_id, errorMessage: null });
    } else if (normalizedStatus === "failed" || normalizedStatus === "expired") {
      updateTaskRecord(id, { status: "error", errorMessage: payload.message || "MiniMax 任务失败。" });
    } else {
      updateTaskRecord(id, { errorMessage: null });
      setStatus("ready", "任务仍在处理中", `MiniMax 当前状态：${payload.status || "Processing"}`);
    }
  } catch (error) {
    setStatus("error", "刷新任务状态失败", toErrorMessage(error));
  }
}

function requireProxyUrl() {
  const proxyUrl = normalizeProxyUrl(els.proxyUrl.value.trim());
  if (!proxyUrl) {
    throw new Error("MiniMax 长文本合成必须通过 Worker 代理调用，请填写代理地址。");
  }
  return proxyUrl;
}

function resolveVoice() {
  const selectedVoice = els.voiceSelect.value.trim();
  if (selectedVoice) {
    return selectedVoice;
  }

  throw new Error("请选择一个可用的 MiniMax 中文普通话女声音色。");
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
  return String(value || "")
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
