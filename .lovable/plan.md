

# Fix export quality + add video export

## Problem analysis

From screenshots: exported PDF/PNG don't match the editor. Photos stretch, text shifts, quality degrades. Video slides save as static images instead of actual video with sound.

**Root cause of quality issues**: `renderSlideToDOM()` manually rebuilds DOM elements that don't exactly match the React-rendered slides in `SlideCarousel`. Differences in CSS, font loading, blob URL handling, and layout calculations cause mismatches.

**Root cause of video issue**: PNG/PDF formats can't contain video. Need a separate video export path.

## Solution

### 1. Fix PNG/PDF — capture actual DOM instead of rebuilding it

**File: `DownloadModal.tsx`** — replace `renderSlideToDOM` + `captureSlides`

Instead of manually creating DOM elements, capture the **actual rendered slide** from the page:

- For each slide, programmatically scroll to it in the carousel
- Find the actual `[data-slide-id=X]` element in the DOM
- For video slides: temporarily replace `<video>` with a captured frame `<img>`
- Use `html2canvas` on the real element with high scale: `scale = formatInfo.width / elementWidth` (e.g. 1080/320 ≈ 3.4x)
- This captures exactly what the user sees: correct fonts, transforms, offsets, overlays

This eliminates all style drift because we capture the actual React-rendered output.

### 2. Add video/MP4 export for video slides

**File: `DownloadModal.tsx`** — new export flow

The download will produce a ZIP containing:
- `slide-1.png` for image/color slides
- `slide-2.webm` for video slides (with text overlay and sound)

For video slides, use **Canvas + MediaRecorder**:
1. Create offscreen `<canvas>` at export dimensions
2. Play the video element, on each frame draw video to canvas + composite text/darken overlay on top
3. Record via `canvas.captureStream()` + `MediaRecorder` (webm format — only reliable codec in browsers)
4. Capture audio from the video element using `captureStream()` and merge audio+video tracks
5. When video ends, stop recording, save blob

Add a third button in the download modal: "Сохранить всё (PNG + видео)" that does the mixed export.

### 3. UI changes in DownloadModal

Three download options:
- **Сохранить как PNG** — image slides as PNG in ZIP (video slides get a static frame)
- **Сохранить как PDF** — all slides as static pages
- **Сохранить всё** — ZIP with PNGs for image slides + WEBM for video slides (with sound and text overlay)

## Technical details

**Capturing actual DOM slides:**
```
1. Save current activeSlide index
2. For each slide:
   a. Scroll carousel to that slide
   b. Wait 200ms for render
   c. querySelector(`[data-slide-id="${slide.id}"]`)
   d. If video slide: pause video, capture frame, temp replace with img
   e. html2canvas(element, { scale: exportWidth/elementWidth, useCORS: true })
   f. Restore video element if replaced
3. Restore original activeSlide
```

**Video recording per slide:**
```
1. Create canvas (1080×1920 etc)
2. Create offscreen video element with slide.bgVideo src
3. On requestAnimationFrame loop:
   - ctx.drawImage(video, ...) with correct position/scale
   - ctx.fillRect for darken overlay
   - ctx.fillText for title/body with correct fonts/sizes/positions
4. MediaRecorder on canvas.captureStream(30) + video.captureStream() audio
5. On video.ended → recorder.stop() → collect blob
```

## Files to change

1. `src/components/editor/DownloadModal.tsx` — rewrite capture logic + add video export

## Risks
- MediaRecorder produces WebM, not MP4 (browser limitation). Most devices can play WebM. Alternative: keep as WebM with note to user.
- Canvas captureStream + audio merging may not work on all mobile browsers. Fallback: download original video without overlay.

