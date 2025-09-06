import { createContext } from "react";

export const GeneralContext = createContext({
    navigateBlockMessage: false,
    setMessage: () => {},
});
