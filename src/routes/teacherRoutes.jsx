import { useEffect } from "react";

const TeacherRedirect = () => {
  useEffect(() => {
    window.location.href = import.meta.env.VITE_ACADEMIC_BASE_URL + "/";
  }, []);
  return null;
};

export const teacherRoutes = [
    { path: "*", element: <TeacherRedirect /> },
];

export const TeacherRouteWrapper = ({ children }) => <>{children}</>;
