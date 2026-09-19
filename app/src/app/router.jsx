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
import PlaceholderPage from '../components/common/PlaceholderPage.jsx'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={ROUTES.map} replace /> },
  { path: ROUTES.entry, element: <EntryPage /> },
  { element: <AppLayout><Outlet /></AppLayout>, children: [
    { path: ROUTES.map, element: <MapPage /> },
    { path: ROUTES.county, element: <MapPage /> },
    { path: ROUTES.templeDetail, element: <TempleDetailPage /> },
    { path: ROUTES.stamps, element: <PlaceholderPage title="集章簿" /> },
    { path: ROUTES.journal, element: <PlaceholderPage title="旅程手札" /> },
    { path: ROUTES.points, element: <PlaceholderPage title="點數" /> },
    { path: ROUTES.news, element: <PlaceholderPage title="最新消息" /> },
    { path: ROUTES.settings, element: <SettingsPage /> },
    { path: ROUTES.friends, element: <PlaceholderPage title="好友" /> },
  ] },
  { element: <RequireReady><AppLayout><Outlet /></AppLayout></RequireReady>, children: [
    { path: ROUTES.temple, element: <TemplePage /> },
    { path: ROUTES.mission, element: <MissionPage /> },
    { path: ROUTES.story, element: <StoryPage /> },
    { path: ROUTES.collection, element: <CollectionPage /> },
    { path: ROUTES.stampbook, element: <StampBookPage /> },
    { path: ROUTES.profile, element: <ProfilePage /> },
  ] },
  { path: '*', element: <Navigate to={ROUTES.map} replace /> },
])
