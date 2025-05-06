import { useEffect } from 'react';

const CHECK_INTERVAL = 1000 * 60; // Check every minute

const clearCacheAndReload = async () => {
  if ('caches' in window) {
    try {
      // Delete all caches
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map(key => caches.delete(key)));
      
      // Reload the page
      window.location.reload(true);
    } catch (err) {
      console.error('Cache clearing failed:', err);
      // Fallback to normal reload
      window.location.reload(true);
    }
  } else {
    window.location.reload(true);
  }
};

export function useVersionCheck() {
  useEffect(() => {
    let currentVersion = null;
    
    const checkVersion = async () => {
      try {
        const response = await fetch('/version.json?t=' + new Date().getTime());
        const data = await response.json();
        
        if (currentVersion === null) {
          currentVersion = data.version;
          console.log('App version:', currentVersion);
        } else {
          console.log('Current version:', currentVersion);
          console.log('Server version:', data.version);
          
          if (currentVersion !== data.version) {
            console.log('New version detected. Clearing cache and reloading...');
            setTimeout(1000)
            await clearCacheAndReload();
          }
        }
      } catch (error) {
        console.error('Version check failed:', error);
      }
    };

    // Initial check
    checkVersion();

    // Periodic check
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);
}
