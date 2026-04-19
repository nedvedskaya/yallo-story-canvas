/**
 * Design-tokens шаблона Minimalism — палитра и шрифтовой стек.
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
