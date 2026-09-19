const DB_NAME = 'wanchun-media'
const DB_VERSION = 1
const PHOTO_STORE = 'photos'

let databasePromise

// 照片只保存在目前瀏覽器的 IndexedDB，不會傳送到外部服務。
export function openMediaDb() {
  databasePromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(PHOTO_STORE)) {
        const store = database.createObjectStore(PHOTO_STORE, { keyPath: 'mediaId' })
        store.createIndex('ownerId', 'ownerId', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      databasePromise = undefined
      reject(request.error ?? new Error('無法開啟照片儲存空間'))
    }
  })
  return databasePromise
}

function transactionResult(transaction, request) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(request?.result)
    transaction.onerror = () => reject(transaction.error ?? request?.error ?? new Error('照片儲存失敗'))
    transaction.onabort = () => reject(transaction.error ?? new Error('照片儲存已取消'))
  })
}

export async function savePhoto({ ownerId, blob, mediaId = crypto.randomUUID() }) {
  if (!ownerId) throw new Error('缺少照片擁有者')
  if (!(blob instanceof Blob)) throw new Error('缺少有效照片')
  const database = await openMediaDb()
  const transaction = database.transaction(PHOTO_STORE, 'readwrite')
  const request = transaction.objectStore(PHOTO_STORE).put({ mediaId, ownerId, blob, createdAt: new Date().toISOString() })
  await transactionResult(transaction, request)
  return mediaId
}

// 同時相容 getPhoto({ ownerId, mediaId }) 與舊有 getPhoto(mediaId, ownerId) 呼叫。
export async function getPhoto(input, legacyOwnerId) {
  const mediaId = typeof input === 'string' ? input : input?.mediaId
  const ownerId = typeof input === 'string' ? legacyOwnerId : input?.ownerId
  if (!mediaId || !ownerId) return null
  const database = await openMediaDb()
  const transaction = database.transaction(PHOTO_STORE, 'readonly')
  const request = transaction.objectStore(PHOTO_STORE).get(mediaId)
  const record = await transactionResult(transaction, request)
  return record?.ownerId === ownerId ? record.blob : null
}

export async function deletePhoto({ ownerId, mediaId }) {
  const database = await openMediaDb()
  const readTransaction = database.transaction(PHOTO_STORE, 'readonly')
  const readRequest = readTransaction.objectStore(PHOTO_STORE).get(mediaId)
  const record = await transactionResult(readTransaction, readRequest)
  if (!record || record.ownerId !== ownerId) return false
  const deleteTransaction = database.transaction(PHOTO_STORE, 'readwrite')
  const deleteRequest = deleteTransaction.objectStore(PHOTO_STORE).delete(mediaId)
  await transactionResult(deleteTransaction, deleteRequest)
  return true
}
