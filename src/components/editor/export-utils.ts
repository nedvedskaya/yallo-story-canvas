import type { Slide } from "./SlideCarousel";
import type { FormatOption, SlideFormat } from "./SizePanel";
import { FORMAT_TEXT_DEFAULTS } from "./shared-styles";

const hAlignToText: Record<string, string> = { left: "left", center: "center", right: "right" };
const vAlignToJustify: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end" };

/* ── Video frame capture ── */
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

export async function loadVideoFrame(src: string): Promise<string> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.crossOrigin = "anonymous"; v.playsInline = true; v.muted = true;
    v.onloadeddata = () => resolve(captureVideoFrame(v));
    v.onerror = () => resolve("");
    v.src = src; v.load();
  });
}

/* ── Overlay patterns ── */
function addOverlay(parent: HTMLElement, type: string, opacity: number, s: number) {
  if (type === "none" || opacity === 0) return;
  const d = document.createElement("div");
  Object.assign(d.style, { position: "absolute", inset: "0", zIndex: "1", pointerEvents: "none", opacity: String(opacity / 100) });

  switch (type) {
    case "dots":
      d.style.backgroundImage = `radial-gradient(circle, rgba(255,255,255,0.5) ${s}px, transparent ${s}px)`;
      d.style.backgroundSize = `${16 * s}px ${16 * s}px`; break;
    case "lines":
      d.style.backgroundImage = `repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) ${s}px, transparent ${s}px, transparent ${14 * s}px)`; break;
    case "grid":
      d.style.backgroundImage = `linear-gradient(rgba(255,255,255,0.25) ${s}px, transparent ${s}px), linear-gradient(90deg, rgba(255,255,255,0.25) ${s}px, transparent ${s}px)`;
      d.style.backgroundSize = `${20 * s}px ${20 * s}px`; break;
    case "cells": {
      const w = 30 * s, h = 26 * s;
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><path d='M${15*s} 0 L${w} ${8*s} L${w} ${22*s} L${15*s} ${h} L0 ${22*s} L0 ${8*s} Z' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='${0.8*s}'/></svg>`;
      d.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
      d.style.backgroundSize = `${w}px ${h}px`; break;
    }
    case "blobs": {
      const b1 = document.createElement("div");
      b1.style.cssText = `position:absolute;width:60%;height:50%;top:10%;left:5%;border-radius:50%;background:rgba(255,255,255,0.2);filter:blur(${30*s}px);`;
      d.appendChild(b1);
      const b2 = document.createElement("div");
      b2.style.cssText = `position:absolute;width:50%;height:45%;bottom:15%;right:10%;border-radius:50%;background:rgba(255,255,255,0.15);filter:blur(${25*s}px);`;
      d.appendChild(b2); break;
    }
    case "noise":
      d.style.backgroundImage = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
      d.style.backgroundSize = `${128 * s}px ${128 * s}px`;
      d.style.mixBlendMode = "overlay"; break;
    default: return;
  }
  parent.appendChild(d);
}

/* ── Media layer (background-image instead of <img> for html2canvas compatibility) ── */
function addMediaLayer(parent: HTMLElement, src: string, fit: "contain" | "cover", slide: Slide) {
  const container = document.createElement("div");
  container.style.cssText = `position:absolute;inset:0;z-index:2;overflow:hidden;`;

  const media = document.createElement("div");
  media.style.cssText = `
    position:absolute;
    left:${slide.bgPosX}%; top:${slide.bgPosY}%;
    transform:translate(-50%,-50%) scale(${slide.bgScale / 100});
    transform-origin:center center;
    width:100%; height:100%;
    background-image:url("${src}");
    background-size:${fit};
    background-position:center;
    background-repeat:no-repeat;
  `;
  container.appendChild(media);

  if (slide.bgDarken > 0) {
    const dk = document.createElement("div");
    dk.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,${slide.bgDarken / 100});pointer-events:none;`;
    container.appendChild(dk);
  }
  parent.appendChild(container);
}

/* ── Build full slide DOM at native export resolution ── */
export function buildExportSlide(
  slide: Slide, formatInfo: FormatOption,
  slideIndex: number, totalSlides: number,
  previewWidth: number, videoFrameUrl?: string,
): HTMLDivElement {
  const ew = formatInfo.width, eh = formatInfo.height;
  const s = ew / previewWidth; // scale factor
  const fmt = FORMAT_TEXT_DEFAULTS[formatInfo.id as SlideFormat] || FORMAT_TEXT_DEFAULTS.carousel;

  const root = document.createElement("div");
  root.style.cssText = `width:${ew}px;height:${eh}px;position:relative;overflow:hidden;background:${slide.bgColor};text-align:${hAlignToText[slide.hAlign] || "left"};`;

  addOverlay(root, slide.overlayType, slide.overlayOpacity, s);

  if (slide.bgImage) addMediaLayer(root, slide.bgImage, "contain", slide);
  else if (videoFrameUrl) addMediaLayer(root, videoFrameUrl, "cover", slide);

  // Content
  const content = document.createElement("div");
  content.className = "export-content-layer";
  content.style.cssText = `position:relative;z-index:10;display:flex;flex-direction:column;height:100%;width:100%;padding:${fmt.padding * s}px;box-sizing:border-box;`;

  // Top bar
  const top = document.createElement("div");
  top.style.cssText = `display:flex;align-items:center;justify-content:space-between;width:100%;flex-shrink:0;margin-bottom:${8 * s}px;`;
  const uSpan = document.createElement("span");
  if (slide.showUsername !== false) { uSpan.textContent = slide.username; uSpan.style.cssText = `color:rgba(255,255,255,0.7);font-size:${fmt.usernameSize * s}px;font-weight:400;font-family:'Inter',sans-serif;`; }
  top.appendChild(uSpan);
  const cSpan = document.createElement("span");
  if (slide.showSlideCount !== false) { cSpan.textContent = `${slideIndex + 1}/${totalSlides}`; cSpan.style.cssText = `color:rgba(255,255,255,0.7);font-size:${fmt.usernameSize * s}px;font-weight:400;font-family:'Inter',sans-serif;`; }
  top.appendChild(cSpan);
  content.appendChild(top);

  // Content area
  const area = document.createElement("div");
  area.style.cssText = `display:flex;flex-direction:column;flex:1;min-height:0;justify-content:${vAlignToJustify[slide.vAlign] || "center"};`;
  const wrap = document.createElement("div");

  // Title
  const tSize = (slide.titleSize ?? fmt.titleSize) * s;
  const tCase = slide.titleCase === "uppercase" ? "uppercase" : slide.titleCase === "lowercase" ? "lowercase" : "none";
  const tDiv = document.createElement("div");
  tDiv.style.cssText = `transform:translate(${(slide.titleOffsetX ?? 0) * s}px,${(slide.titleOffsetY ?? 0) * s}px) scale(${slide.titleScale ?? 1});transform-origin:center center;`;
  const h2 = document.createElement("h2");
  h2.innerHTML = slide.title;
  h2.style.cssText = `color:#fff;font-size:${tSize}px;font-family:${slide.titleFont || "'Inter',sans-serif"};text-transform:${tCase};line-height:${slide.titleLineHeight ?? 1.1};letter-spacing:${(slide.titleLetterSpacing ?? 0) * s}px;font-weight:bold;margin:0;`;
  tDiv.appendChild(h2); wrap.appendChild(tDiv);

  // Body
  const bSize = (slide.bodySize ?? fmt.bodySize) * s;
  const bCase = slide.bodyCase === "uppercase" ? "uppercase" : slide.bodyCase === "lowercase" ? "lowercase" : "none";
  const bDiv = document.createElement("div");
  bDiv.style.cssText = `transform:translate(${(slide.bodyOffsetX ?? 0) * s}px,${(slide.bodyOffsetY ?? 0) * s}px) scale(${slide.bodyScale ?? 1});transform-origin:center center;`;
  const p = document.createElement("p");
  p.innerHTML = slide.body;
  p.style.cssText = `color:rgba(255,255,255,0.85);font-size:${bSize}px;font-family:${slide.bodyFont || "'Inter',sans-serif"};text-transform:${bCase};line-height:${slide.bodyLineHeight ?? 1.5};letter-spacing:${(slide.bodyLetterSpacing ?? 0) * s}px;font-weight:400;margin:${12 * s}px 0 0 0;`;
  bDiv.appendChild(p); wrap.appendChild(bDiv);
  area.appendChild(wrap); content.appendChild(area);

  // Bottom bar
  const bot = document.createElement("div");
  bot.style.cssText = `display:flex;align-items:flex-end;justify-content:space-between;width:100%;flex-shrink:0;`;
  const fSpan = document.createElement("span");
  if (slide.showFooter) { fSpan.textContent = slide.footerText || ""; fSpan.style.cssText = `color:rgba(255,255,255,0.6);font-size:${fmt.footerSize * s}px;font-weight:400;font-family:'Inter',sans-serif;`; }
  bot.appendChild(fSpan);
  const aSpan = document.createElement("span");
  if (slide.showArrow !== false && slideIndex < totalSlides - 1) { aSpan.textContent = "→"; aSpan.style.cssText = `color:rgba(255,255,255,0.5);font-size:${(fmt.footerSize + 2) * s}px;`; }
  bot.appendChild(aSpan);
  content.appendChild(bot);

  root.appendChild(content);
  return root;
}

/* ── Build content-only overlay (transparent bg, for video compositing) ── */
export function buildContentOverlay(
  slide: Slide, formatInfo: FormatOption,
  slideIndex: number, totalSlides: number,
  previewWidth: number,
): HTMLDivElement {
  const ew = formatInfo.width, eh = formatInfo.height;
  const s = ew / previewWidth;
  const fmt = FORMAT_TEXT_DEFAULTS[formatInfo.id as SlideFormat] || FORMAT_TEXT_DEFAULTS.carousel;

  const root = document.createElement("div");
  root.style.cssText = `width:${ew}px;height:${eh}px;position:relative;overflow:hidden;background:transparent;text-align:${hAlignToText[slide.hAlign] || "left"};`;

  // Same content layer as buildExportSlide but without bg/media
  const content = document.createElement("div");
  content.style.cssText = `position:relative;z-index:10;display:flex;flex-direction:column;height:100%;width:100%;padding:${fmt.padding * s}px;box-sizing:border-box;`;

  const top = document.createElement("div");
  top.style.cssText = `display:flex;align-items:center;justify-content:space-between;width:100%;flex-shrink:0;margin-bottom:${8 * s}px;`;
  const uSpan = document.createElement("span");
  if (slide.showUsername !== false) { uSpan.textContent = slide.username; uSpan.style.cssText = `color:rgba(255,255,255,0.7);font-size:${fmt.usernameSize * s}px;font-weight:400;font-family:'Inter',sans-serif;`; }
  top.appendChild(uSpan);
  const cSpan = document.createElement("span");
  if (slide.showSlideCount !== false) { cSpan.textContent = `${slideIndex + 1}/${totalSlides}`; cSpan.style.cssText = `color:rgba(255,255,255,0.7);font-size:${fmt.usernameSize * s}px;font-weight:400;font-family:'Inter',sans-serif;`; }
  top.appendChild(cSpan);
  content.appendChild(top);

  const area = document.createElement("div");
  area.style.cssText = `display:flex;flex-direction:column;flex:1;min-height:0;justify-content:${vAlignToJustify[slide.vAlign] || "center"};`;
  const wrap = document.createElement("div");

  const tSize = (slide.titleSize ?? fmt.titleSize) * s;
  const tCase = slide.titleCase === "uppercase" ? "uppercase" : slide.titleCase === "lowercase" ? "lowercase" : "none";
  const tDiv = document.createElement("div");
  tDiv.style.cssText = `transform:translate(${(slide.titleOffsetX ?? 0) * s}px,${(slide.titleOffsetY ?? 0) * s}px) scale(${slide.titleScale ?? 1});transform-origin:center center;`;
  const h2 = document.createElement("h2");
  h2.innerHTML = slide.title;
  h2.style.cssText = `color:#fff;font-size:${tSize}px;font-family:${slide.titleFont || "'Inter',sans-serif"};text-transform:${tCase};line-height:${slide.titleLineHeight ?? 1.1};letter-spacing:${(slide.titleLetterSpacing ?? 0) * s}px;font-weight:bold;margin:0;`;
  tDiv.appendChild(h2); wrap.appendChild(tDiv);

  const bSize = (slide.bodySize ?? fmt.bodySize) * s;
  const bCase = slide.bodyCase === "uppercase" ? "uppercase" : slide.bodyCase === "lowercase" ? "lowercase" : "none";
  const bDiv = document.createElement("div");
  bDiv.style.cssText = `transform:translate(${(slide.bodyOffsetX ?? 0) * s}px,${(slide.bodyOffsetY ?? 0) * s}px) scale(${slide.bodyScale ?? 1});transform-origin:center center;`;
  const p = document.createElement("p");
  p.innerHTML = slide.body;
  p.style.cssText = `color:rgba(255,255,255,0.85);font-size:${bSize}px;font-family:${slide.bodyFont || "'Inter',sans-serif"};text-transform:${bCase};line-height:${slide.bodyLineHeight ?? 1.5};letter-spacing:${(slide.bodyLetterSpacing ?? 0) * s}px;font-weight:400;margin:${12 * s}px 0 0 0;`;
  bDiv.appendChild(p); wrap.appendChild(bDiv);
  area.appendChild(wrap); content.appendChild(area);

  const bot = document.createElement("div");
  bot.style.cssText = `display:flex;align-items:flex-end;justify-content:space-between;width:100%;flex-shrink:0;`;
  const fSpan = document.createElement("span");
  if (slide.showFooter) { fSpan.textContent = slide.footerText || ""; fSpan.style.cssText = `color:rgba(255,255,255,0.6);font-size:${fmt.footerSize * s}px;font-weight:400;font-family:'Inter',sans-serif;`; }
  bot.appendChild(fSpan);
  const aSpan = document.createElement("span");
  if (slide.showArrow !== false && slideIndex < totalSlides - 1) { aSpan.textContent = "→"; aSpan.style.cssText = `color:rgba(255,255,255,0.5);font-size:${(fmt.footerSize + 2) * s}px;`; }
  bot.appendChild(aSpan);
  content.appendChild(bot);
  root.appendChild(content);
  return root;
}

/* ── Wait for all assets in export DOM ── */
export async function waitForExportAssets(el: HTMLElement): Promise<void> {
  await document.fonts.ready;
  const promises: Promise<void>[] = [];
  el.querySelectorAll("*").forEach(child => {
    const bg = (child as HTMLElement).style?.backgroundImage;
    if (bg && bg.startsWith('url(') && !bg.includes("data:image/svg")) {
      const match = bg.match(/url\(["']?(.+?)["']?\)/);
      if (match) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        promises.push(new Promise(res => { img.onload = () => res(); img.onerror = () => res(); img.src = match[1]; }));
      }
    }
  });
  el.querySelectorAll("img").forEach(img => {
    if (!img.complete) promises.push(new Promise(res => { img.onload = () => res(); img.onerror = () => res(); }));
  });
  if (promises.length > 0) await Promise.all(promises);
  await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
}

/* ── Default preview width per format ── */
export function getDefaultPreviewWidth(format: SlideFormat): number {
  switch (format) {
    case "stories": return 220;
    case "square": return 270;
    case "presentation": return 380;
    default: return 290;
  }
}
