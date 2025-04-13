import React, { createContext } from 'react';

export const GeneralContext = createContext({
    navigateBlockMessage: false,
    setMessage: () => { },
});
