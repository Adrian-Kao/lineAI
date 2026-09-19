import { UserRound } from 'lucide-react'

export default function FriendAvatar({ friend, size = 'normal' }) {
  return <span className={`friend-avatar is-${size}`} style={{ '--friend-avatar-color': friend.avatarColor }} aria-hidden="true">
    {friend.avatarUrl ? <img src={friend.avatarUrl} alt="" /> : friend.name?.slice(-1) || <UserRound size={22} />}
  </span>
}
