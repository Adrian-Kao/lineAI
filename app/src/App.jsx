import { GameProvider } from './state/GameProvider.jsx'
import { RouterProvider } from 'react-router'
import { router } from './app/router.jsx'

export default function App() {
  return <GameProvider><RouterProvider router={router} /></GameProvider>
}
