

# Добавить 4 шрифта: Forum, Cera Pro, Gilroy, Montserrat

## Шаги

1. **Скопировать файлы** в `public/fonts/`:
   - `Forum-Regular.ttf`
   - `CeraProThin.ttf`
   - `Gilroy-Light.otf`
   - `Montserrat-Regular.ttf`

2. **`src/index.css`** — добавить 4 `@font-face` после строки 18:
   ```css
   @font-face { font-family: 'Forum'; src: url('/fonts/Forum-Regular.ttf') format('truetype'); font-display: swap; }
   @font-face { font-family: 'Cera Pro'; src: url('/fonts/CeraProThin.ttf') format('truetype'); font-weight: 100; font-display: swap; }
   @font-face { font-family: 'Gilroy'; src: url('/fonts/Gilroy-Light.otf') format('opentype'); font-weight: 300; font-display: swap; }
   @font-face { font-family: 'Montserrat'; src: url('/fonts/Montserrat-Regular.ttf') format('truetype'); font-display: swap; }
   ```

3. **`src/components/editor/FontSection.tsx`** — добавить в `FONT_LIST`:
   ```ts
   { name: "Forum", family: "'Forum', serif" },
   { name: "Cera Pro", family: "'Cera Pro', sans-serif" },
   { name: "Gilroy", family: "'Gilroy', sans-serif" },
   { name: "Montserrat", family: "'Montserrat', sans-serif" },
   ```

## Файлы
| Файл | Изменение |
|------|-----------|
| `public/fonts/` | 4 новых файла шрифтов |
| `src/index.css` | 4 `@font-face` |
| `src/components/editor/FontSection.tsx` | 4 записи в `FONT_LIST` |

