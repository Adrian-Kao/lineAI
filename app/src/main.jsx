import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import { initLine, isLineConfigured, isLineMockMode } from './services/line.js'
import LineStartupError from './app/LineStartupError.jsx'

async function startApp() {
  let startupError = null

  try {
    if (!isLineConfigured() && !isLineMockMode() && !import.meta.env.DEV) {
      throw new Error('部署環境缺少 VITE_LIFF_ID')
    }
    if (isLineConfigured()) await initLine()
  } catch (error) {
    startupError = error instanceof Error ? error.message : 'LIFF 初始化失敗'
    console.error('LIFF initialization failed', error)
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      {startupError ? <LineStartupError message={startupError} /> : <App />}
    </StrictMode>,
  )
}

startApp()
