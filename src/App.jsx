import React, { useState, useCallback, useContext, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from "./shared/hooks/auth-hook";
import { AuthContext } from "./shared/Components/Context/auth-context";
import { SidebarContext } from "./shared/Components/Context/sidebar-context";
import { GeneralContext } from "./shared/Components/Context/general-context";
import LoadingCircle from "./shared/Components/UIElements/LoadingCircle";
import { getRouteConfig } from './routes';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [navigateBlockMessage, setNavigateBlockMessage] = useState(true);

  const { token, login, logout, userId, userRole, userName, userBranchId, userTeachingGroupId, currentTeachingGroupYear, currentTeachingGroupYearId, userClassIds, setAttributes } = useAuth();

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize(); // Initial check
    window.addEventListener('resize', checkScreenSize); // Add resize listener

    return () => {
      window.removeEventListener('resize', checkScreenSize); // Cleanup on unmount
    };
  }, []);

  const toggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  });

  const setMessage = useCallback((msg) => {
    setNavigateBlockMessage(msg || '');
  }, []);

  const { routes, Wrapper } = getRouteConfig(userRole);

  const routeElement = (
    <Wrapper>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        <Route path="*" element={<Navigate to={userRole ? "/dashboard" : "/"} />} />
      </Routes>
    </Wrapper>
  );

  return (
    <GeneralContext.Provider value={{ navigateBlockMessage, setMessage }}>
      <SidebarContext.Provider value={{ isSidebarOpen, toggle }}>
        <AuthContext.Provider value={{ isLoggedIn: !!token, userRole, userId, userName, userBranchId, userTeachingGroupId, currentTeachingGroupYear, currentTeachingGroupYearId, userClassIds, token, login, setAttributes, logout }}>
          <Router future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}>
            <main className="h-auto">
              <Suspense fallback={
                <div className="flex justify-center mt-16">
                  <LoadingCircle size={32} />
                </div>
              }>
                {routeElement}
              </Suspense>
            </main>
          </Router>
        </AuthContext.Provider>
      </SidebarContext.Provider>
    </GeneralContext.Provider>
  );
}

export default App;
