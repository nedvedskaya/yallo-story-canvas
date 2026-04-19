/**
 * Утилиты для "применить-ко-всем-слайдам" кнопок.
 *
 * Раньше handleApplyBgToAll / handleApplyTextToAll / handleApplyInfoToAll в
 * Index.tsx дублировали структуру: { ...s, key1: src.key1, key2: src.key2, … }.
 * При добавлении нового поля (например, titleLetterSpacing) легко забыть
 * синхронизировать список ключей, и "применить ко всем" начинает расходиться
 * с панелью редактирования.
 *
 * Теперь каждая панель экспортирует свой APPLY_KEYS — единый источник истины:
 *   - BackgroundPanel.BG_APPLY_KEYS
 *   - TextPanel.TEXT_APPLY_KEYS
 *   - InfoPanel.INFO_APPLY_KEYS
 *
 * А `pickApplyPatch(source, keys)` собирает из текущего слайда partial-патч,
 * который потом раскатывается по всем слайдам в Index.tsx.
 */
import type { Slide } from "@/components/editor/SlideCarousel";

/** Собирает partial-объект из `source`, содержащий только перечисленные `keys`.
 *  Используется для "применить настройки этого слайда ко всем". */
export function pickApplyPatch<K extends keyof Slide>(
  source: Slide,
  keys: readonly K[],
): Pick<Slide, K> {
  const out = {} as Pick<Slide, K>;
  for (const key of keys) {
    out[key] = source[key];
  }
  return out;
}
