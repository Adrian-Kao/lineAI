import { GameProvider } from './state/GameProvider.jsx'
import AppLayout from './app/AppLayout.jsx'
import EntryPage from './app/EntryPage.jsx'

export default function App() {
  return <GameProvider><AppLayout><EntryPage /></AppLayout></GameProvider>
}
