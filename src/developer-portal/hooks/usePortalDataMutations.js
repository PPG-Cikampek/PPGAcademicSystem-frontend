import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "../../shared/firebase/firebase";

const FEATURES_QUERY_KEY = ["portal", "features"];
const RELEASES_QUERY_KEY = ["portal", "releases"];
const ANNOUNCEMENTS_QUERY_KEY = ["portal", "announcements"];

const FEATURES_COLLECTION = ["platformInfo", "features", "items"];
const RELEASES_COLLECTION = ["platformInfo", "releases", "items"];
const ANNOUNCEMENTS_COLLECTION = ["platformInfo", "announcements", "items"];

const resolveCollectionPath = (segments) => collection(db, ...segments);
const resolveDocPath = (segments, id) => doc(db, ...segments, id);

const ensureId = async (docRef, idOverride) => {
    if (idOverride) {
        return idOverride;
    }

    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const useCreateFeature = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }) => {
            const collectionRef = resolveCollectionPath(FEATURES_COLLECTION);

            if (id) {
                await setDoc(resolveDocPath(FEATURES_COLLECTION, id), {
                    ...data,
                    id,
                });
                return { ...data, id };
            }

            const docRef = await addDoc(collectionRef, data);
            const resolvedId = await ensureId(docRef, null);
            return { ...data, id: resolvedId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY });
        },
    });
};

export const useUpdateFeature = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ featureId, data }) => {
            if (!featureId) {
                throw new Error("featureId is required to update a feature");
            }

            await updateDoc(resolveDocPath(FEATURES_COLLECTION, featureId), {
                ...data,
                id: featureId,
            });

            return { ...data, id: featureId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY });
        },
    });
};

export const useDeleteFeature = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ featureId }) => {
            if (!featureId) {
                throw new Error("featureId is required to delete a feature");
            }

            await deleteDoc(resolveDocPath(FEATURES_COLLECTION, featureId));
            return featureId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FEATURES_QUERY_KEY });
        },
    });
};

export const useCreateRelease = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, version, ...data }) => {
            const releaseId = id || version;
            if (!releaseId) {
                throw new Error(
                    "Release creation requires an id or version field"
                );
            }

            await setDoc(resolveDocPath(RELEASES_COLLECTION, releaseId), {
                ...data,
                version: version || releaseId,
                id: releaseId,
            });

            return { ...data, version: version || releaseId, id: releaseId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RELEASES_QUERY_KEY });
        },
    });
};

export const useUpdateRelease = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ releaseId, data }) => {
            if (!releaseId) {
                throw new Error("releaseId is required to update a release");
            }

            await updateDoc(resolveDocPath(RELEASES_COLLECTION, releaseId), {
                ...data,
                id: releaseId,
            });

            return { ...data, id: releaseId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RELEASES_QUERY_KEY });
        },
    });
};

export const useDeleteRelease = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ releaseId }) => {
            if (!releaseId) {
                throw new Error("releaseId is required to delete a release");
            }

            await deleteDoc(resolveDocPath(RELEASES_COLLECTION, releaseId));
            return releaseId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RELEASES_QUERY_KEY });
        },
    });
};

export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }) => {
            if (!id) {
                throw new Error("Announcement creation requires an id");
            }

            await setDoc(resolveDocPath(ANNOUNCEMENTS_COLLECTION, id), {
                ...data,
                id,
            });

            return { ...data, id };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
        },
    });
};

export const useUpdateAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ announcementId, data }) => {
            if (!announcementId) {
                throw new Error(
                    "announcementId is required to update an announcement"
                );
            }

            await updateDoc(
                resolveDocPath(ANNOUNCEMENTS_COLLECTION, announcementId),
                {
                    ...data,
                    id: announcementId,
                }
            );

            return { ...data, id: announcementId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
        },
    });
};

export const useDeleteAnnouncement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ announcementId }) => {
            if (!announcementId) {
                throw new Error(
                    "announcementId is required to delete an announcement"
                );
            }

            await deleteDoc(
                resolveDocPath(ANNOUNCEMENTS_COLLECTION, announcementId)
            );
            return announcementId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
        },
    });
};
