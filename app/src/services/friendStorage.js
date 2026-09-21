import { DEFAULT_FRIEND_IDS, DEMO_FRIEND_DIRECTORY } from '../data/friendDemo.js'

const FRIEND_KEY_PREFIX = 'wanchun-friends:v1:'
const INVITATION_KEY_PREFIX = 'wanchun-friend-invitations:v1:'

function makeFriendKey(userId) {
  if (!userId) throw new Error('缺少 LINE 使用者 ID')
  return `${FRIEND_KEY_PREFIX}${userId}`
}

function makeInvitationKey(userId) {
  if (!userId) throw new Error('缺少 LINE 使用者 ID')
  return `${INVITATION_KEY_PREFIX}${userId}`
}

function resolveFriends(ids) {
  const idSet = new Set(Array.isArray(ids) ? ids : [])
  return DEMO_FRIEND_DIRECTORY.filter(friend => idSet.has(friend.id))
}

export function loadFriends(userId) {
  try {
    const raw = localStorage.getItem(makeFriendKey(userId))
    return resolveFriends(raw === null ? DEFAULT_FRIEND_IDS : JSON.parse(raw))
  } catch {
    return resolveFriends(DEFAULT_FRIEND_IDS)
  }
}

export function saveFriends(userId, friends) {
  localStorage.setItem(makeFriendKey(userId), JSON.stringify(friends.map(friend => friend.id)))
  return friends
}

export function loadFriendInvitations(userId) {
  try {
    const ids = JSON.parse(localStorage.getItem(makeInvitationKey(userId)) ?? '[]')
    return Array.isArray(ids) ? ids.filter(id => DEMO_FRIEND_DIRECTORY.some(friend => friend.id === id)) : []
  } catch {
    return []
  }
}

export function saveFriendInvitations(userId, friendIds) {
  const uniqueIds = [...new Set(friendIds)].filter(id => DEMO_FRIEND_DIRECTORY.some(friend => friend.id === id))
  localStorage.setItem(makeInvitationKey(userId), JSON.stringify(uniqueIds))
  return uniqueIds
}
