import { GameProvider } from './state/GameProvider.jsx'
import { RouterProvider } from 'react-router'
import { router } from './app/router.jsx'
import { SettingsProvider } from './state/SettingsProvider.jsx'

export default function App() {
  return <SettingsProvider><GameProvider><RouterProvider router={router} /></GameProvider></SettingsProvider>
}
