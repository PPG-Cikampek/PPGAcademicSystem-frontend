import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MaintenanceView from './maintenance/pages/MaintenanceView.jsx';
import { useVersionCheck } from './shared/hooks/useVersionCheck.js';

const AppWrapper = () => {
  useVersionCheck();
  const isMaintenance = false;
  
  return (
    <StrictMode>
      {isMaintenance
        ? <MaintenanceView />
        : <App />
      }
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<AppWrapper />)
