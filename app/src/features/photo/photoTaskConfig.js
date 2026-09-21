export const PHOTO_ALIGN_TASKS = {
  wanchun: {
    templeId: 'wanchun',
    taskId: 'photo',
    templeName: '萬春宮',
    referenceImage: '/missions/wanchun/reference-full.jpg',
    fullReferenceImage: '/missions/wanchun/reference-full.jpg',
    expectedPatch: '/missions/wanchun/reference-patch.jpg',
    aspectRatio: 3 / 2,
    hole: { x: 0.36, y: 0.22, width: 0.28, height: 0.25 },
    similarityThreshold: 0.62,
  },
}

export const DEFAULT_PHOTO_ALIGN_TASK = PHOTO_ALIGN_TASKS.wanchun
