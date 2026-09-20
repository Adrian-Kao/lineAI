import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import { ROUTES } from '../config/routes.js'
import { RequireReady } from './RequireReady.jsx'
import AppLayout from './AppLayout.jsx'
import EntryPage from './EntryPage.jsx'
import MapPage from '../features/map/MapPage.jsx'
import TemplePage from '../features/temple/TemplePage.jsx'
import TempleDetailPage from '../features/temple/TempleDetailPage.jsx'
import MissionPage from '../features/missions/MissionPage.jsx'
import StoryPage from '../features/story/StoryPage.jsx'
import CollectionPage from '../features/collection/CollectionPage.jsx'
import StampBookPage from '../features/collection/StampBookPage.jsx'
import ProfilePage from '../features/profile/ProfilePage.jsx'
import SettingsPage from '../features/settings/SettingsPage.jsx'
import JournalPage from '../features/journal/JournalPage.jsx'
import ItineraryPage from '../features/itinerary/ItineraryPage.jsx'
import FriendsPage from '../features/friends/FriendsPage.jsx'
import PlaceholderPage from '../components/common/PlaceholderPage.jsx'
import MinigamesPreviewRoute from '../features/minigames/MinigamesPreviewRoute.jsx'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={ROUTES.map} replace /> },
  { path: ROUTES.entry, element: <EntryPage /> },
  { element: <AppLayout><Outlet /></AppLayout>, children: [
    { path: ROUTES.map, element: <MapPage /> },
    { path: ROUTES.county, element: <MapPage /> },
    { path: ROUTES.templeDetail, element: <TempleDetailPage /> },
    { path: ROUTES.stampbook, element: <Navigate to={ROUTES.stamps} replace /> },
    { path: ROUTES.points, element: <PlaceholderPage title="點數" /> },
    { path: ROUTES.news, element: <PlaceholderPage title="最新消息" /> },
    { path: ROUTES.settings, element: <SettingsPage /> },
    { path: ROUTES.minigamesPreview, element: <MinigamesPreviewRoute /> },
  ] },
  { element: <RequireReady><AppLayout><Outlet /></AppLayout></RequireReady>, children: [
    { path: ROUTES.temple, element: <TemplePage /> },
    { path: ROUTES.mission, element: <MissionPage /> },
    { path: ROUTES.story, element: <StoryPage /> },
    { path: ROUTES.collection, element: <CollectionPage /> },
    { path: ROUTES.stamps, element: <StampBookPage /> },
    { path: ROUTES.profile, element: <ProfilePage /> },
    { path: ROUTES.journal, element: <JournalPage /> },
    { path: ROUTES.itinerary, element: <ItineraryPage /> },
    { path: ROUTES.friends, element: <FriendsPage /> },
  ] },
  { path: '*', element: <Navigate to={ROUTES.map} replace /> },
])
