import { useCallback } from "react";
import clearSiteData from "../Utilities/clearSiteData";

const useClearSiteData = () => {
    // useCallback to memoize the imported clearSiteData function
    return useCallback(() => {
        clearSiteData();
    }, []);
};

export default useClearSiteData;
