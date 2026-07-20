import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WebSocketProvider } from './context/WebSocketContext'
import { CallProvider } from './context/CallContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebSocketProvider>
      <CallProvider>
        <App />
      </CallProvider>
    </WebSocketProvider>
  </React.StrictMode>,
)