

# Убрать откат изменений при закрытии панелей

## Проблема

Сейчас при нажатии на крестик (X) вызывается `handleCancelClose`, который откатывает все изменения к снимку состояния (snapshot). Пользователь хочет, чтобы все изменения сохранялись автоматически, а крестик просто закрывал панель.

## Решение

В `src/pages/Index.tsx`:

1. **Удалить** `slideSnapshotRef` и `formatSnapshotRef` — снимки больше не нужны
2. **Удалить** `handleCancelClose` и `handleSaveClose` — они больше не нужны
3. **Создать** простую функцию `handleClosePanel` — только `setActiveTab(null)`
4. **Упростить** `handleTabChange` — убрать логику создания снимков, оставить только `setActiveTab(tab)`

В `src/components/editor/BottomSheet.tsx`:

5. Заменить пропсы `onClose` и `onSaveClose` на один `onClose`, который просто закрывает панель
6. Убрать передачу `onSaveClose` во все дочерние панели

## Файлы

- `src/pages/Index.tsx` — убрать snapshot-логику, упростить закрытие
- `src/components/editor/BottomSheet.tsx` — убрать `onSaveClose`, использовать единый `onClose`

