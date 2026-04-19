/**
 * Minimal export utilities. Main rendering is now in SlideFrame.tsx.
 * This file only keeps helpers that don't belong in the component.
 */

/** Capture a single frame from a video element as a data URL */
export function captureVideoFrame(video: HTMLVideoElement): string {
  try {
    const c = document.createElement("canvas");
    c.width = video.videoWidth || 640;
    c.height = video.videoHeight || 360;
    const ctx = c.getContext("2d");
    if (ctx) { ctx.drawImage(video, 0, 0, c.width, c.height); return c.toDataURL("image/png"); }
  } catch {}
  return "";
}

/** Load a video and capture a real (non-black) frame.
 *  Bug fix: `onloadeddata` может выстрелить до того, как GPU успел декодировать
 *  первый пригодный для отрисовки кадр — canvas получает чёрный bitmap. Сейчас:
 *  ждём loadedmetadata → seek на 0.1s → seeked → рисуем. Это гарантирует
 *  реальный кадр и в Safari, и в Chrome. Fallback-timeout 3s, чтобы не виснуть
 *  на битом видео. */
export async function loadVideoFrame(src: string): Promise<string> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    if (!src.startsWith("blob:")) v.crossOrigin = "anonymous";
    v.playsInline = true;
    v.muted = true;

    let done = false;
    const finish = (result: string) => {
      if (done) return;
      done = true;
      resolve(result);
    };

    const timeout = window.setTimeout(() => finish(""), 3000);

    v.onloadedmetadata = () => {
      // currentTime = 0.1 → триггерит seeked; многие декодеры на кадре 0
      // отдают чёрный bitmap, а на 0.1s гарантированно есть реальный кадр.
      try {
        v.currentTime = Math.min(0.1, (v.duration || 0.1) / 2);
      } catch {
        finish(captureVideoFrame(v));
      }
    };
    v.onseeked = () => {
      window.clearTimeout(timeout);
      finish(captureVideoFrame(v));
    };
    v.onerror = () => {
      window.clearTimeout(timeout);
      finish("");
    };
    v.src = src;
    v.load();
  });
}
