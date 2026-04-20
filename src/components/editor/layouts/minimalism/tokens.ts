/**
 * Design-tokens шаблона Minimalism — палитра и шрифтовой стек.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * СИСТЕМНЫЕ НАСТРОЙКИ ШАБЛОНА MINIMALISM (ЕДИНЫЙ ИСТОЧНИК, НЕ МЕНЯТЬ!)
 * ═══════════════════════════════════════════════════════════════════════════
 *   • Шрифт ЗАГОЛОВКА       — Marvin Visions (MINIMALISM_TITLE_FONT)
 *     ⚠ ОБЯЗАТЕЛЬНО для ВСЕХ слайдов с template='minimalism'.
 *     Принудительно выставляется:
 *       1) в TemplatesPanel.TEMPLATES[id='minimalism'].apply.titleFont
 *       2) в миграции Index.tsx (перезаписывает slide.titleFont на каждом
 *          старте, если template==='minimalism')
 *       3) в layouts/minimalism/MinimalismLayout{1,2,3,4}.tsx как default
 *          (slide.titleFont || MINIMALISM_TITLE_FONT)
 *     @font-face объявлен в index.html (с preload + font-display:block),
 *     чтобы шрифт был ДО первого paint.
 *   • Шрифт ОСНОВНОГО текста — Inter (MINIMALISM_BODY_FONT)
 *   • Акцентный цвет         — #CDE0FA (MINIMALISM_ACCENT)
 *   • Цвет заголовка         — #0A0A0A (MINIMALISM_TITLE)
 *   • Цвет body              — #666666 (MINIMALISM_BODY)
 *   • Фон слайда             — #FFFFFF (см. TemplatesPanel.apply.bgColor)
 *   • Выравнивание           — left (hAlign=left)
 *   • Выделение ключевых слов— жирный pill (wrapLastWordAsAccent, pill-style
 *                              border-radius:999, padding:0.08em 0.15em 0.12em)
 *   • Перечисления           — через • или → с новой строки
 *
 *   Если пользователь через Text-панель меняет шрифт заголовка на другой —
 *   это сохраняется в slide.titleFont и УВАЖАЕТСЯ рендером. Но по ДЕФОЛТУ
 *   при применении шаблона / добавлении нового слайда всегда ставится
 *   Marvin Visions.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Раньше эти значения были захардкожены в 6+ местах (SlideFrame, TemplatesPanel,
 * HookSlide, MinimalismBase, MinimalismLayout1, миграции в Index.tsx). Теперь
 * один источник истины; поменять палитру = поправить здесь.
 *
 * Экспортируется как отдельный модуль (не shared.ts), чтобы не тащить React
 * в места, где нужны только цвета (например, миграции).
 */

/** Светло-голубая пилюля/акцент. Используется как slide.accentColor по умолчанию. */
export const MINIMALISM_ACCENT = "#CDE0FA";

/** Основной цвет текста заголовка (near-black, не #000 чтобы не выгорал на фото). */
export const MINIMALISM_TITLE = "#0A0A0A";

/** Светло-серый фон Minimalism-слайдов (когда юзер не выбрал свой). */
export const MINIMALISM_BG = "#F0F0F0";

/** Цвет подзаголовка / body. */
export const MINIMALISM_BODY = "#666666";

/** Font-stack заголовка: Marvin Visions → Space Grotesk → Inter. */
export const MINIMALISM_TITLE_FONT =
  "'Marvin Visions', 'Space Grotesk', 'Inter', sans-serif";

/** Font-stack подзаголовка. */
export const MINIMALISM_BODY_FONT = "'Inter', sans-serif";
