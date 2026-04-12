/**
 * Resize an image file client-side to a max dimension, returning a blob URL.
 * Keeps aspect ratio and original format quality.
 * Uses canvas for fast GPU-accelerated resize.
 */
export function resizeImage(
  file: File,
  maxSize = 1920,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const originalUrl = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;

      // Skip resize if already small enough — use original file as-is
      if (width <= maxSize && height <= maxSize) {
        resolve(originalUrl);
        return;
      }

      // Scale down keeping aspect ratio
      if (width > height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(originalUrl);

      // Preserve original format: PNG stays PNG (lossless), everything else → JPEG max quality
      const isPng = file.type === "image/png";
      const mimeType = isPng ? "image/png" : "image/jpeg";
      const quality = isPng ? undefined : 1.0;

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
          resolve(URL.createObjectURL(blob));
        },
        mimeType,
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(originalUrl); reject(new Error("Image load failed")); };
    img.src = originalUrl;
  });
}
