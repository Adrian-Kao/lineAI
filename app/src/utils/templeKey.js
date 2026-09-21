export function makeTempleKey(input) {
  const templeId = typeof input === 'string' ? input : input?.templeId ?? input?.id
  return typeof templeId === 'string' ? templeId.trim().toLowerCase() : ''
}
