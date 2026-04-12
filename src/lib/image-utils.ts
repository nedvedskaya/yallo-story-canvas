/**
 * Resize an image file client-side to a max dimension, returning a blob URL.
 * Keeps aspect ratio. Uses canvas for fast GPU-accelerated resize.
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

      // Skip resize if already small enough
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
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
          resolve(URL.createObjectURL(blob));
        },
        "image/jpeg",
        0.85,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(originalUrl); reject(new Error("Image load failed")); };
    img.src = originalUrl;
  });
}
