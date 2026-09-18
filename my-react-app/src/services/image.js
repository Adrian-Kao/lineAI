export function validateImageFile(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('請選擇圖片')
  if (file.size > 15 * 1024 * 1024) throw new Error('圖片不可超過 15 MB')
  // B：補上實際圖片解碼驗證。
}
export async function compressPhoto() { throw new Error('待實作：圖片壓縮') }
export async function composePhoto() { throw new Error('待實作：裁切與遮罩合成') }
