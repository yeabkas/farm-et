/**
 * Upload files directly to Cloudinary from the browser using unsigned uploads.
 * This bypasses the PHP backend (which can't handle file uploads on Vercel serverless).
 */

const CLOUD_NAME = "x8f2wpjs";
const UPLOAD_PRESET = "farm_et_unsigned"; // We'll create this preset

export async function uploadToCloudinary(
  files: File[],
  onProgress?: (percent: number) => void
): Promise<string[]> {
  const urls: string[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Cloudinary upload failed:", errBody);
      throw new Error(`Upload failed for ${file.name}`);
    }

    const data = await res.json();
    urls.push(data.secure_url);

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  return urls;
}
