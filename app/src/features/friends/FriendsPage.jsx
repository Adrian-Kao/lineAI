import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BookImage, BookMarked, Search, Trash2, UserPlus, UsersRound, X } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '../../config/routes.js'
import { DEMO_FRIEND_DIRECTORY } from '../../data/friendDemo.js'
import { loadFriends, saveFriends } from '../../services/friendStorage.js'
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

function AddFriendDialog({ currentFriends, onAdd, onClose, t }) {
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

  return <div className="friend-dialog-layer">
    <button className="friend-dialog-backdrop" type="button" onClick={onClose} aria-label={t('common.close')} />
    <section className="friend-dialog" role="dialog" aria-modal="true" aria-labelledby="friend-dialog-title">
      <button className="friend-dialog-close" type="button" onClick={onClose} aria-label={t('common.close')}><X size={20} /></button>
      <div className="friend-dialog-heading"><UserPlus size={22} /><div><p>{t('friends.demoLookup')}</p><h2 id="friend-dialog-title">{t('friends.add')}</h2></div></div>
      <div className="friend-lookup-tabs" role="group" aria-label={t('friends.lookupType')}>
        <button type="button" className={lookupType === 'phone' ? 'is-active' : ''} onClick={() => changeType('phone')}>{t('friends.phone')}</button>
        <button type="button" className={lookupType === 'lineId' ? 'is-active' : ''} onClick={() => changeType('lineId')}>{t('friends.lineId')}</button>
      </div>
      <form className="friend-search-form" onSubmit={search}>
        <label htmlFor="friend-query">{lookupType === 'phone' ? t('friends.phone') : t('friends.lineId')}</label>
        <div><input id="friend-query" type={lookupType === 'phone' ? 'tel' : 'text'} inputMode={lookupType === 'phone' ? 'tel' : 'text'} value={query} onChange={event => setQuery(event.target.value)} placeholder={lookupType === 'phone' ? '0912-345-678' : 'an.temple'} autoFocus /><button type="submit"><Search size={18} />{t('friends.search')}</button></div>
      </form>
      {message && <p className="friend-search-message" role="status">{message}</p>}
      {result && <div className="friend-search-result">
        <FriendAvatar friend={result} size="large" />
        <div><strong>{result.name}</strong><span>@{result.lineId}</span></div>
        <button className="task-button" type="button" onClick={() => onAdd(result)}>{t('friends.addAction')}</button>
      </div>}
      <p className="friend-demo-note">{t('friends.demoNote')}</p>
    </section>
  </div>
}

export default function FriendsPage() {
  const { session } = useGame()
  const { t } = useSettings()
  const userId = session.profile.userId
  const [friends, setFriends] = useState(() => loadFriends(userId))
  const [isAdding, setIsAdding] = useState(false)
  const [notice, setNotice] = useState('')
  const averages = useMemo(() => {
    if (!friends.length) return { stamps: 0, collection: 0 }
    return {
      stamps: Math.round(friends.reduce((sum, friend) => sum + friend.stampCount / friend.stampTotal, 0) / friends.length * 100),
      collection: Math.round(friends.reduce((sum, friend) => sum + friend.collectionCount / friend.collectionTotal, 0) / friends.length * 100),
    }
  }, [friends])

  function addFriend(friend) {
    const next = [...friends, friend]
    saveFriends(userId, next)
    setFriends(next)
    setNotice(t('friends.added', { name: friend.name }))
    setIsAdding(false)
  }

  function removeFriend(friend) {
    const next = friends.filter(item => item.id !== friend.id)
    saveFriends(userId, next)
    setFriends(next)
    setNotice(t('friends.removed', { name: friend.name }))
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
    {friends.length ? <ul className="friends-list">{friends.map(friend => <FriendCard key={friend.id} friend={friend} onRemove={removeFriend} t={t} />)}</ul> : <div className="friends-empty"><UsersRound size={38} /><h2>{t('friends.empty')}</h2><p>{t('friends.emptyHelp')}</p><button className="task-button" type="button" onClick={() => setIsAdding(true)}><UserPlus size={18} />{t('friends.add')}</button></div>}
    {isAdding && <AddFriendDialog currentFriends={friends} onAdd={addFriend} onClose={() => setIsAdding(false)} t={t} />}
  </main>
}
