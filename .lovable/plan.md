

# Fix stuttering animations, remove onboarding, make everything instant

## 1. Remove BottomSheet spring animation (stuttering fix)

**File**: `src/components/editor/BottomSheet.tsx`

The spring transition (`type: "spring", damping: 30, stiffness: 300`) causes visible "bounce/jitter" on mobile. Replace with instant appearance — no animation at all.

- Remove `motion.div` wrappers, replace with plain `div`
- Remove `AnimatePresence` wrapper
- Remove `framer-motion` import from this file
- The backdrop and panel just render/unmount instantly with no transition

## 2. Remove onboarding entirely

**Files**: `src/components/editor/OnboardingOverlay.tsx`, `src/pages/Index.tsx`, `src/components/editor/TopBar.tsx`

- Delete `OnboardingOverlay.tsx`
- In `Index.tsx`: remove import, state (`onboardingActive`), `useEffect` for localStorage, the `<OnboardingOverlay>` render, and `onStartOnboarding` prop from TopBar
- In `TopBar.tsx`: remove `onStartOnboarding` prop and the `onClick` handler from the logo button (make it non-interactive or just a plain span)

## 3. Make everything instant (remove all transition delays)

**File**: `src/components/editor/BottomMenu.tsx`
- Remove `transition-all duration-300` from menu buttons and icons — keep styling but no transition delay

**File**: `src/components/editor/BottomSheet.tsx`
- Already handled in step 1 — panel appears/disappears instantly

## Files changed

| File | Change |
|------|--------|
| `BottomSheet.tsx` | Replace framer-motion with plain divs (instant open/close) |
| `OnboardingOverlay.tsx` | Delete file |
| `Index.tsx` | Remove onboarding state, import, render |
| `TopBar.tsx` | Remove onStartOnboarding, make logo non-clickable |
| `BottomMenu.tsx` | Remove transition durations from buttons |

