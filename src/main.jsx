import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MaintenanceView from './maintenance/pages/MaintenanceView.jsx';

const isMaintenance = false;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isMaintenance
      ? <MaintenanceView />
      : <App />
    }
  </StrictMode>,
)
