import { createContext } from "react";

export const SidebarContext = createContext({
    isSidebarOpen: true,
    toggle: () => {},
});
