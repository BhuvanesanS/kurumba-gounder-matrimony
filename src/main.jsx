import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import './AdminDashboard.css'
import App from './App.jsx'
import AdminDashboard from './AdminDashboard.jsx'

const Page = window.location.pathname.startsWith('/admin') ? AdminDashboard : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
