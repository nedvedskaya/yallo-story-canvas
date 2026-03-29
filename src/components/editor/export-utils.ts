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

/** Load a video and capture its first frame */
export async function loadVideoFrame(src: string): Promise<string> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.crossOrigin = "anonymous"; v.playsInline = true; v.muted = true;
    v.onloadeddata = () => resolve(captureVideoFrame(v));
    v.onerror = () => resolve("");
    v.src = src; v.load();
  });
}
