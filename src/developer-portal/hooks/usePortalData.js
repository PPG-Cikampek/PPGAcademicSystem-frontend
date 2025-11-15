import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../shared/firebase/firebase";

// Import fallback data
import fallbackFeatures from "../data/currentFeatures.json";
import fallbackReleases from "../data/releaseNotes.json";
import fallbackAnnouncements from "../data/announcements.json";

// Hook for fetching current features
export const useCurrentFeatures = () => {
    return useQuery({
        queryKey: ["portal", "features"],
        queryFn: async () => {
            try {
                const q = query(
                    collection(db, "platformInfo", "features", "items"),
                    orderBy("eta", "asc")
                );
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    return fallbackFeatures;
                }
                return snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            } catch (error) {
                console.warn(
                    "Failed to fetch features from Firestore, using fallback:",
                    error
                );
                return fallbackFeatures;
            }
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: 1,
    });
};

// Hook for fetching release notes
export const useReleaseNotes = () => {
    return useQuery({
        queryKey: ["portal", "releases"],
        queryFn: async () => {
            try {
                const q = query(
                    collection(db, "platformInfo", "releases", "items"),
                    orderBy("date", "desc")
                );
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    return fallbackReleases;
                }
                return snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            } catch (error) {
                console.warn(
                    "Failed to fetch releases from Firestore, using fallback:",
                    error
                );
                return fallbackReleases;
            }
        },
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes
        retry: 1,
    });
};

// Hook for fetching announcements
export const useAnnouncements = () => {
    return useQuery({
        queryKey: ["portal", "announcements"],
        queryFn: async () => {
            try {
                const q = query(
                    collection(db, "platformInfo", "announcements", "items"),
                    orderBy("publishedAt", "desc")
                );
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    return fallbackAnnouncements;
                }
                return snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            } catch (error) {
                console.warn(
                    "Failed to fetch announcements from Firestore, using fallback:",
                    error
                );
                return fallbackAnnouncements;
            }
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: 1,
    });
};
