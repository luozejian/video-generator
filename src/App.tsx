import { useState, useRef } from 'react';
import { Video, FileVideo, Download, AlertCircle, Clock, Zap, Settings, Globe, CheckCircle2 } from 'lucide-react';

// --- 类型定义 ---
type Language = 'zh' | 'en';

type TranslationKeys = {
  appTitle: string;
  appDesc: string;
  realMode: string;
  realModeDesc: string;
  fakeMode: string;
  fakeModeDesc: string;
  configTitle: string;
  targetSize: string;
  duration: string;
  resolution: string;
  widthPlaceholder: string;
  heightPlaceholder: string;
  compressionWarning: string;
  generatingReal: string;
  generatingFake: string;
  startBtn: string;
  successTitle: string;
  fileName: string;
  actualSize: string;
  format: string;
  downloadBtn: string;
  previewTitle: string;
  errorBrowser: string;
  errorMemory: string;
  confirmLargeFile: string;
  paddingInfo: string;
};

type Translations = {
  [key in Language]: TranslationKeys;
};

type Config = {
  width: number;
  height: number;
  sizeMB: number;
  duration: number;
  fps: number;
};

type Theme = {
  colors: string[] | null;
  overlayText: string | null;
};

type Status = 'idle' | 'generating' | 'done' | 'error';

type Mode = 'real' | 'fake';

type Result = {
  url: string;
  size: string;
  type: string;
  name: string;
  padded?: boolean;
} | null;

// --- 国际化资源 --- 
const translations: Translations = {
  zh: {
    appTitle: "智能视频生成器 (Gemini Enhanced)",
    appDesc: "基于 AI 的视频生成工具。支持根据测试场景描述自动配置参数，并生成精确大小的测试文件。",
    realMode: "真实渲染模式",
    realModeDesc: "生成可播放的视频。利用尾部填充技术，精确匹配目标大小。",
    fakeMode: "快速伪造模式",
    fakeModeDesc: "瞬间生成指定大小的空文件(.mp4)。仅用于测试上传限制。",
    configTitle: "生成配置",
    targetSize: "目标大小 (MB)",
    duration: "视频时长 (秒)",
    resolution: "分辨率 (宽 x 高)",
    widthPlaceholder: "宽",
    heightPlaceholder: "高",
    compressionWarning: "提示: 程序将自动填充数据以精确匹配目标大小。",
    generatingReal: "渲染中...",
    generatingFake: "分配内存...",
    startBtn: "开始生成",
    successTitle: "生成成功",
    fileName: "文件名",
    actualSize: "实际大小",
    format: "格式",
    downloadBtn: "下载文件",
    previewTitle: "视频预览",
    errorBrowser: "生成失败: 浏览器不支持此分辨率或内存不足。",
    errorMemory: "内存不足，无法生成该大小的文件。",
    confirmLargeFile: "生成超过 500MB 的文件可能导致浏览器崩溃。是否继续？",
    paddingInfo: "已智能填充"
  },
  en: {
    appTitle: "Smart Video Gen (Gemini)",
    appDesc: "AI-powered video generator. Auto-configures parameters based on test scenarios and generates byte-perfect files.",
    realMode: "Real Render Mode",
    realModeDesc: "Generates playable video. Uses tail padding to match target size exactly while maintaining playability.",
    fakeMode: "Fast Mock Mode",
    fakeModeDesc: "Instantly generates empty files (.mp4). For upload limits testing only.",
    configTitle: "Configuration",
    targetSize: "Target Size (MB)",
    duration: "Duration (s)",
    resolution: "Resolution (W x H)",
    widthPlaceholder: "W",
    heightPlaceholder: "H",
    compressionWarning: "Note: Data will be automatically padded to match exact size.",
    generatingReal: "Rendering...",
    generatingFake: "Allocating...",
    startBtn: "Generate",
    successTitle: "Success",
    fileName: "File Name",
    actualSize: "Actual Size",
    format: "Format",
    downloadBtn: "Download",
    previewTitle: "Preview",
    errorBrowser: "Failed: Browser not supported or out of memory.",
    errorMemory: "Out of memory.",
    confirmLargeFile: "Files > 500MB may crash the browser. Continue?",
    paddingInfo: "Padding added"
  }
};

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const t = translations[lang];

  const [config, setConfig] = useState<Config>({
    width: 1280,
    height: 720,
    sizeMB: 10,
    duration: 5,
    fps: 30
  });

  const [theme] = useState<Theme>({
    colors: null,
    overlayText: null
  });

  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<Result>(null);
  const [mode, setMode] = useState<Mode>('real');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const drawFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const hasTheme = theme.colors && theme.colors.length > 0;

    if (hasTheme && theme.colors) {
      const blockSize = Math.max(20, Math.floor(width / 20));
      for (let y = 0; y < height; y += blockSize) {
        for (let x = 0; x < width; x += blockSize) {
          const color = theme.colors[Math.floor(Math.random() * theme.colors.length)];
          ctx.fillStyle = color;
          ctx.fillRect(x, y, blockSize, blockSize);
        }
      }
    } else {
      const imageData = ctx.createImageData(width, height);
      const buffer = new Uint32Array(imageData.data.buffer);
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = (Math.random() * 0xFFFFFFFF) >>> 0;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    ctx.font = `bold ${Math.max(24, width / 25)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.lineWidth = 3;

    const centerX = width / 2;
    const centerY = height / 2;

    const displayText = theme.overlayText || `TEST VIDEO ${width}x${height}`;
    const timeText = new Date().toISOString().split('T')[1].slice(0, 8);

    ctx.strokeStyle = 'black';
    ctx.strokeText(displayText, centerX, centerY - 20);
    ctx.strokeText(timeText, centerX, centerY + 40);

    ctx.fillStyle = 'white';
    ctx.fillText(displayText, centerX, centerY - 20);
    ctx.fillText(timeText, centerX, centerY + 40);
  };

  const generateRealVideo = async () => {
    setStatus('generating');
    setProgress(0);
    setResult(null);
    setErrorMsg('');

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      canvas.width = config.width;
      canvas.height = config.height;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('Failed to get canvas context');

      const targetBytes = config.sizeMB * 1024 * 1024;
      const conservativeBits = targetBytes * 0.8 * 8;
      const targetBitrate = Math.floor(conservativeBits / config.duration);

      console.log(`Target Bytes: ${targetBytes}, Bitrate Setting: ${(targetBitrate / 1000000).toFixed(2)} Mbps`);

      const stream = canvas.captureStream(config.fps);

      let options: MediaRecorderOptions = { videoBitsPerSecond: targetBitrate };
      let mimeType = 'video/webm';

      if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) {
        options = {
          ...options,
          mimeType: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
        };
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
        options = {
          ...options,
          mimeType: 'video/webm; codecs=vp9'
        };
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, options);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: mimeType });
        let finalBlob = videoBlob;
        let padded = false;

        if (videoBlob.size < targetBytes) {
          const paddingSize = targetBytes - videoBlob.size;
          console.log(`Video size: ${videoBlob.size}. Padding needed: ${paddingSize}`);

          const padding = new Uint8Array(paddingSize);
          finalBlob = new Blob([videoBlob, padding], { type: mimeType });
          padded = true;
        } else {
          console.warn("Video generated larger than target, cannot pad exactly. Try reducing duration or resolution.");
        }

        const url = URL.createObjectURL(finalBlob);
        setResult({
          url,
          size: (finalBlob.size / 1024 / 1024).toFixed(2),
          type: mimeType.split(';')[0],
          name: `gen_${config.width}x${config.height}_${config.sizeMB}MB.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`,
          padded
        });
        setStatus('done');
      };

      recorder.start();

      const startTime = Date.now();
      const animate = () => {
        drawFrame(ctx, config.width, config.height);

        const elapsed = (Date.now() - startTime) / 1000;
        const p = Math.min((elapsed / config.duration) * 100, 100);
        setProgress(p);

        if (elapsed < config.duration) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          recorder.stop();
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        }
      };

      animate();

    } catch (err) {
      console.error(err);
      setErrorMsg(t.errorBrowser);
      setStatus('error');
    }
  };

  const generateFakeVideo = () => {
    setStatus('generating');
    setProgress(0);
    setErrorMsg('');

    setTimeout(() => {
      try {
        const sizeBytes = config.sizeMB * 1024 * 1024;

        if (config.sizeMB > 500) {
          if (!window.confirm(t.confirmLargeFile)) {
            setStatus('idle');
            return;
          }
        }

        const buffer = new Uint8Array(sizeBytes);
        buffer[0] = 0x00;

        const blob = new Blob([buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        setResult({
          url,
          size: (blob.size / 1024 / 1024).toFixed(2),
          type: 'video/mp4 (mock)',
          name: `mock_video_${config.sizeMB}MB.mp4`
        });
        setProgress(100);
        setStatus('done');
      } catch (err) {
        setErrorMsg(t.errorMemory);
        setStatus('error');
      }
    }, 100);
  };

  const handleGenerate = () => {
    if (mode === 'real') {
      generateRealVideo();
    } else {
      generateFakeVideo();
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Video className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold">{t.appTitle}</h1>
            </div>

            <button
              onClick={toggleLanguage}
              className="absolute top-6 right-6 md:static flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm transition-colors border border-slate-700"
            >
              <Globe className="w-4 h-4" />
              {lang === 'zh' ? 'English' : '中文'}
            </button>
          </div>
          <p className="text-slate-400 mt-2 text-sm max-w-xl">
            {t.appDesc}
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('real')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mode === 'real' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
            >
              <div className="flex items-center gap-2 font-bold">
                <Clock className="w-5 h-5" />
                {t.realMode}
              </div>
              <p className="text-xs text-center opacity-80">
                {t.realModeDesc}
              </p>
            </button>

            <button
              onClick={() => setMode('fake')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mode === 'fake' ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
            >
              <div className="flex items-center gap-2 font-bold">
                <Zap className="w-5 h-5" />
                {t.fakeMode}
              </div>
              <p className="text-xs text-center opacity-80">
                {t.fakeModeDesc}
              </p>
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <Settings className="w-5 h-5 text-gray-500" />
              {t.configTitle}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t.targetSize}</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={config.sizeMB}
                  onChange={(e) => setConfig({ ...config, sizeMB: Number(e.target.value) })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
                {mode === 'real' && (
                  <p className="text-xs text-blue-600 flex items-center gap-1 font-medium bg-blue-50 p-1 rounded">
                    <CheckCircle2 className="w-3 h-3" /> {t.compressionWarning}
                  </p>
                )}
              </div>

              {mode === 'real' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t.duration}</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={config.duration}
                      onChange={(e) => setConfig({ ...config, duration: Number(e.target.value) })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t.resolution}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder={t.widthPlaceholder}
                        value={config.width}
                        onChange={(e) => setConfig({ ...config, width: Number(e.target.value) })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                      />
                      <span className="self-center text-gray-400">x</span>
                      <input
                        type="number"
                        placeholder={t.heightPlaceholder}
                        value={config.height}
                        onChange={(e) => setConfig({ ...config, height: Number(e.target.value) })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-4">
            {status === 'generating' ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-500">
                  {mode === 'real' ? t.generatingReal : t.generatingFake} ({Math.round(progress)}%)
                </p>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${mode === 'real' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'}`}
              >
                {mode === 'real' ? <Video className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />}
                {t.startBtn}
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {result && status === 'done' && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" /> {t.successTitle}
                    </h3>
                    <div className="mt-2 text-sm text-green-700 space-y-1">
                      <p className="truncate" title={result.name}>{t.fileName}: {result.name}</p>
                      <div className="flex items-center gap-2">
                        <p>{t.actualSize}: <span className="font-bold">{result.size} MB</span></p>
                        {result.padded && (
                          <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full border border-green-300">
                            {t.paddingInfo} {result.size}MB
                          </span>
                        )}
                      </div>
                      <p>{t.format}: {result.type}</p>
                    </div>
                  </div>

                  <a
                    href={result.url}
                    download={result.name}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadBtn}
                  </a>
                </div>

                {mode === 'real' && (
                  <div className="mt-6">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t.previewTitle}</p>
                    <video
                      controls
                      src={result.url}
                      className="w-full rounded-lg bg-black shadow-inner max-h-[300px] object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}