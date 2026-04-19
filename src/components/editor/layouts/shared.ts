/**
 * Общие helpers для layout-компонентов.
 * Layout-архитектура: slide.template × slide.layout = визуальный вариант.
 * Все layouts одного шаблона разделяют общие утилиты (strip HTML, highlight pill).
 */
import React from "react";
import type { SlideFormat } from "../SizePanel";

/** Базовые (export-px) размеры заголовка/подзаголовка для Minimalism layouts,
 *  адаптированные под каждый формат. Значения крупнее, чем FORMAT_DESIGN, потому
 *  что Minimalism — акцентный шаблон с герой-типографикой, а не list/cta.
 *
 *  Значения в px при export-ширине:
 *    carousel  → 1080 (4:5)
 *    square    → 1080 (1:1)
 *    stories   → 1080 (9:16)
 *    presentation → 1920 (16:9)
 *
 *  В preview умножаются на metrics.renderScale, чтобы визуал совпадал на
 *  любом размере превью и в экспорте. */
export interface LayoutSizes {
  titleSize: number;
  bodySize: number;
  titleBodyGap: number;
}

const MINIMALISM_SIZES: Record<SlideFormat, LayoutSizes> = {
  carousel:     { titleSize: 104, bodySize: 40, titleBodyGap: 28 },
  square:       { titleSize: 92,  bodySize: 36, titleBodyGap: 24 },
  stories:      { titleSize: 116, bodySize: 46, titleBodyGap: 32 },
  presentation: { titleSize: 108, bodySize: 38, titleBodyGap: 26 },
};

/** Возвращает базовые размеры шрифтов для Minimalism-шаблона в заданном формате. */
export function getMinimalismSizes(format: SlideFormat): LayoutSizes {
  return MINIMALISM_SIZES[format] ?? MINIMALISM_SIZES.carousel;
}

/** Убираем HTML-теги + декодируем базовые entity. Title может содержать `<span>`-pill
 *  от InlineTextEditor или легаси-хайлайт. Layouts рендерят highlight через
 *  собственный React-span, поэтому исходные теги раскрываем в plain text. */
export function stripHtml(s: string): string {
  if (!s) return "";
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

/** slide.titleCase / slide.bodyCase → CSS text-transform. */
export function caseToTransform(c: string | undefined): React.CSSProperties["textTransform"] {
  if (c === "uppercase") return "uppercase";
  if (c === "lowercase") return "lowercase";
  return "none";
}

/** Разбивает title на React-ноды с pill-span на месте highlight.
 *  highlight — подстрока из title (case-sensitive). Если не нашли — рендерим title как есть.
 *  Pill-плашка:
 *    - background: accentColor
 *    - color: titleColor (чтобы выделенное слово совпадало с остальным текстом)
 *    - padding 0.08em 14px*renderScale 0.12em (горизонтальный — scale-aware)
 *    - margin-left = -padding (компенсирует выезд плашки, первая строка визуально выровнена)
 *    - внутри pill пробелы → NBSP чтобы слова не разрывались между строк. */
export function renderTitleWithHighlight(
  title: string,
  highlight: string | undefined,
  accentColor: string,
  titleColor: string,
  renderScale: number,
): React.ReactNode {
  if (!title) return null;
  if (!highlight) return title;
  const idx = title.indexOf(highlight);
  if (idx === -1) return title;

  const before = title.slice(0, idx);
  const after = title.slice(idx + highlight.length);

  const pad = 14 * renderScale;
  const pillStyle: React.CSSProperties = {
    display: "inline-block",
    background: accentColor,
    color: titleColor,
    borderRadius: 999,
    padding: `0.08em ${pad}px 0.12em`,
    marginLeft: -pad,
    lineHeight: 1,
  };

  const pillText = highlight.replace(/ /g, "\u00A0");

  return React.createElement(
    React.Fragment,
    null,
    before,
    React.createElement("span", { style: pillStyle }, pillText),
    after,
  );
}

/** slide.hAlign ('left' | 'center' | 'right') → CSS textAlign. */
export function hAlignToText(h: string | undefined): React.CSSProperties["textAlign"] {
  if (h === "center") return "center";
  if (h === "right") return "right";
  return "left";
}

/** slide.vAlign → процент позиции по вертикали для layout1-подобных absolute-wrapper'ов.
 *  По умолчанию (center) текст встаёт чуть ниже геометрической середины —
 *  пользователь хочет "чуть ниже середины" для minimalism cover. */
export function vAlignToTopPercent(v: string | undefined): string {
  if (v === "start") return "14%";
  if (v === "end") return "70%";
  return "48%"; // center (default) — чуть ниже середины с учётом высоты контента
}
