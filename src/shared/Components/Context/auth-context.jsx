import React, { createContext, useContext, useState } from 'react';

export const AuthContext = createContext({
    isLoggedIn: false,
    userId: null,
    userRole: null,
    userName: null,
    userBranchId: null,
    userTeachingGroupId: null,
    currentTeachingGroupYear: null,
    userClassIds: [],
    token: null,
    login: () => {},
    logout: () => {},
    setAttributes: () => {}
});






// import React, { createContext, useContext, useState } from 'react';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [token, setToken] = useState(null);

//   const login = (uid, token) => {
//     setToken(token);
//     setIsLoggedIn(true);
//     setUserId(uid);
//     localStorage.setItem('userData', JSON.stringify({
//       userId: uid,
//       token: token
//     }));
//   };

//   const logout = () => {
//     setToken(null);
//     setIsLoggedIn(false);
//     setUserId(null);
//     localStorage.removeItem('userData');
//   };

//   return (
//     <AuthContext.Provider value={{ 
//       isLoggedIn, 
//       userId, 
//       token,
//       login, 
//       logout 
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);