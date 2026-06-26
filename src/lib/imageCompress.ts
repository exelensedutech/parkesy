// crypto.randomUUID() only works in secure contexts (HTTPS) — but this app
// gets tested over plain HTTP via a local network IP, so we generate a
// random filename with getRandomValues() instead, which has no such
// restriction.
export function randomId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Resizes + re-encodes a photo before upload. A raw phone-camera photo can be
// 3-8MB; this typically gets it down to 100-250KB with no visible quality
// loss for "can I identify this vehicle/ID" purposes — which matters both
// for Supabase Storage cost and for upload speed on patchy connections.
export async function compressImage(file: File, maxWidth = 1280, quality = 0.75): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Image compression failed"))), "image/jpeg", quality);
  });
}
