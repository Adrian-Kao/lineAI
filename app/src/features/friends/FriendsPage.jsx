import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BookImage, BookMarked, Check, MessageCircleMore, Search, Send, Trash2, UserPlus, UsersRound, X } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { DEMO_FRIEND_DIRECTORY } from '../../data/friendDemo.js'
import { loadFriendInvitations, loadFriends, saveFriendInvitations, saveFriends } from '../../services/friendStorage.js'
import { useGame } from '../../state/GameContext.js'
import { useSettings } from '../../state/SettingsContext.js'
import { findFriendByLookup } from '../../utils/friendDirectory.js'
import FriendAvatar from './FriendAvatar.jsx'

function CompletionBar({ icon: Icon, label, value, total }) {
  const percentage = total ? Math.round(value / total * 100) : 0
  return <div className="friend-progress-row">
    <span className="friend-progress-label"><Icon size={16} />{label}</span>
    <div className="friend-progress-track" aria-label={`${label} ${percentage}%`} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percentage}>
      <span style={{ width: `${percentage}%` }} />
    </div>
    <span className="friend-progress-value">{value}/{total}</span>
  </div>
}

function FriendCard({ friend, onRemove, t }) {
  return <li className="friend-card">
    <div className="friend-identity">
      <FriendAvatar friend={friend} />
      <div><h2>{friend.name}</h2><p>@{friend.lineId}</p></div>
      <button className="friend-remove" type="button" onClick={() => onRemove(friend)} aria-label={t('friends.removeNamed', { name: friend.name })}><Trash2 size={18} /></button>
    </div>
    <div className="friend-progress-list">
      <CompletionBar icon={BookMarked} label={t('friends.stamps')} value={friend.stampCount} total={friend.stampTotal} />
      <CompletionBar icon={BookImage} label={t('friends.collection')} value={friend.collectionCount} total={friend.collectionTotal} />
    </div>
  </li>
}

function PendingFriendCard({ friend, onCancel, t }) {
  return <li className="friend-card is-pending">
    <div className="friend-identity">
      <FriendAvatar friend={friend} />
      <div><h2>{friend.name}</h2><p>@{friend.lineId}</p></div>
      <button className="friend-pending-badge" type="button" onClick={() => onCancel(friend)} aria-label={t('friends.cancelNamedInvitation', { name: friend.name })}>{t('friends.pendingApproval')}</button>
    </div>
    <p className="friend-pending-note">{t('friends.pendingProgress')}</p>
  </li>
}

function AddFriendDialog({ currentFriends, invitations, onInvite, onCancel, onClose, t }) {
  const [lookupType, setLookupType] = useState('phone')
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', closeOnEscape) }
  }, [onClose])

  function changeType(type) {
    setLookupType(type)
    setQuery('')
    setResult(null)
    setMessage('')
  }

  function search(event) {
    event.preventDefault()
    setResult(null)
    setMessage('')
    try {
      const match = findFriendByLookup(DEMO_FRIEND_DIRECTORY, lookupType, query)
      if (!match) setMessage(t('friends.notFound'))
      else if (currentFriends.some(friend => friend.id === match.id)) setMessage(t('friends.alreadyAdded'))
      else setResult(match)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('friends.notFound'))
    }
  }

  const currentFriendIds = new Set(currentFriends.map(friend => friend.id))
  const invitedIds = new Set(invitations)

  return <div className="friend-dialog-layer">
    <button className="friend-dialog-backdrop" type="button" onClick={onClose} aria-label={t('common.close')} />
    <section className="friend-dialog" role="dialog" aria-modal="true" aria-labelledby="friend-dialog-title">
      <button className="friend-dialog-close" type="button" onClick={onClose} aria-label={t('common.close')}><X size={20} /></button>
      <div className="friend-dialog-heading"><UserPlus size={22} /><div><p>{t('friends.demoLookup')}</p><h2 id="friend-dialog-title">{t('friends.add')}</h2></div></div>
      <div className="friend-lookup-tabs" role="group" aria-label={t('friends.lookupType')}>
        <button type="button" className={lookupType === 'phone' ? 'is-active' : ''} onClick={() => changeType('phone')}>{t('friends.phone')}</button>
        <button type="button" className={lookupType === 'lineId' ? 'is-active' : ''} onClick={() => changeType('lineId')}>{t('friends.lineId')}</button>
        <button type="button" className={lookupType === 'lineFriends' ? 'is-active' : ''} onClick={() => changeType('lineFriends')}><MessageCircleMore size={17} />{t('friends.lineFriends')}</button>
      </div>
      {lookupType !== 'lineFriends' && <form className="friend-search-form" onSubmit={search}>
        <label htmlFor="friend-query">{lookupType === 'phone' ? t('friends.phone') : t('friends.lineId')}</label>
        <div><input id="friend-query" type={lookupType === 'phone' ? 'tel' : 'text'} inputMode={lookupType === 'phone' ? 'tel' : 'text'} value={query} onChange={event => setQuery(event.target.value)} placeholder={lookupType === 'phone' ? '0912-345-678' : 'an.temple'} autoFocus /><button type="submit"><Search size={18} />{t('friends.search')}</button></div>
      </form>}
      {lookupType !== 'lineFriends' && message && <p className="friend-search-message" role="status">{message}</p>}
      {lookupType !== 'lineFriends' && result && <div className="friend-search-result">
        <FriendAvatar friend={result} size="large" />
        <div><strong>{result.name}</strong><span>@{result.lineId}</span></div>
        <button className={`task-button${invitedIds.has(result.id) ? ' is-secondary' : ''}`} type="button" onClick={() => invitedIds.has(result.id) ? onCancel(result) : onInvite(result)}>
          {invitedIds.has(result.id) ? t('friends.pendingApproval') : t('friends.addAction')}
        </button>
      </div>}
      {lookupType === 'lineFriends' && <section className="line-friend-picker" aria-labelledby="line-friend-picker-title">
        <div className="line-friend-picker__heading"><h3 id="line-friend-picker-title">{t('friends.chooseLineFriend')}</h3><p>{t('friends.chooseLineFriendHelp')}</p></div>
        <ul className="line-friend-list">
          {DEMO_FRIEND_DIRECTORY.map(friend => {
            const isFriend = currentFriendIds.has(friend.id)
            const invited = invitedIds.has(friend.id)
            return <li key={friend.id} className="line-friend-row">
              <FriendAvatar friend={friend} />
              <div><strong>{friend.name}</strong><span>@{friend.lineId}</span></div>
              <button className={`line-friend-invite${isFriend ? ' is-friend' : invited ? ' is-pending' : ''}`} type="button" disabled={isFriend} onClick={() => invited ? onCancel(friend) : onInvite(friend)}>
                {isFriend ? <Check size={16} /> : invited ? <X size={16} /> : <Send size={16} />}
                {isFriend ? t('friends.isFriend') : invited ? t('friends.pendingApproval') : t('friends.invite')}
              </button>
            </li>
          })}
        </ul>
      </section>}
    </section>
  </div>
}

export default function FriendsPage() {
  const { session } = useGame()
  const { t } = useSettings()
  const userId = session.profile.userId
  const [friends, setFriends] = useState(() => loadFriends(userId))
  const [invitations, setInvitations] = useState(() => loadFriendInvitations(userId))
  const [isAdding, setIsAdding] = useState(false)
  const [notice, setNotice] = useState('')
  const averages = useMemo(() => {
    if (!friends.length) return { stamps: 0, collection: 0 }
    return {
      stamps: Math.round(friends.reduce((sum, friend) => sum + friend.stampCount / friend.stampTotal, 0) / friends.length * 100),
      collection: Math.round(friends.reduce((sum, friend) => sum + friend.collectionCount / friend.collectionTotal, 0) / friends.length * 100),
    }
  }, [friends])
  const pendingFriends = useMemo(() => {
    const friendIds = new Set(friends.map(friend => friend.id))
    const invitationIds = new Set(invitations)
    return DEMO_FRIEND_DIRECTORY.filter(friend => invitationIds.has(friend.id) && !friendIds.has(friend.id))
  }, [friends, invitations])

  function removeFriend(friend) {
    const next = friends.filter(item => item.id !== friend.id)
    saveFriends(userId, next)
    setFriends(next)
    setNotice(t('friends.removed', { name: friend.name }))
  }

  function inviteFriend(friend) {
    const next = saveFriendInvitations(userId, [...invitations, friend.id])
    setInvitations(next)
    setNotice(t('friends.invitationSent', { name: friend.name }))
  }

  function cancelInvitation(friend) {
    const next = saveFriendInvitations(userId, invitations.filter(id => id !== friend.id))
    setInvitations(next)
    setNotice(t('friends.invitationCancelled', { name: friend.name }))
  }

  return <main className="friends-page">
    <Link className="detail-back" to={ROUTES.map}><ArrowLeft size={19} />{t('common.backMap')}</Link>
    <header className="friends-heading">
      <div><p>{t('friends.eyebrow')}</p><h1>{t('friends.title')}</h1><p>{t('friends.description')}</p></div>
      <button className="task-button friends-add" type="button" onClick={() => { setNotice(''); setIsAdding(true) }}><UserPlus size={18} />{t('friends.add')}</button>
    </header>
    <section className="friends-summary" aria-label={t('friends.summary')}>
      <div><UsersRound size={20} /><strong>{friends.length}</strong><span>{t('friends.people')}</span></div>
      <div><BookMarked size={20} /><strong>{averages.stamps}%</strong><span>{t('friends.averageStamps')}</span></div>
      <div><BookImage size={20} /><strong>{averages.collection}%</strong><span>{t('friends.averageCollection')}</span></div>
    </section>
    {notice && <p className="friends-notice" role="status">{notice}</p>}
    {(friends.length || pendingFriends.length) ? <ul className="friends-list">
      {friends.map(friend => <FriendCard key={friend.id} friend={friend} onRemove={removeFriend} t={t} />)}
      {pendingFriends.map(friend => <PendingFriendCard key={friend.id} friend={friend} onCancel={cancelInvitation} t={t} />)}
    </ul> : <div className="friends-empty"><UsersRound size={38} /><h2>{t('friends.empty')}</h2><p>{t('friends.emptyHelp')}</p><button className="task-button" type="button" onClick={() => setIsAdding(true)}><UserPlus size={18} />{t('friends.add')}</button></div>}
    {isAdding && <AddFriendDialog currentFriends={friends} invitations={invitations} onInvite={inviteFriend} onCancel={cancelInvitation} onClose={() => setIsAdding(false)} t={t} />}
  </main>
}
