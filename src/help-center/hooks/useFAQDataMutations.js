import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "../../shared/firebase/firebase";
import { FAQ_COLLECTION_PATH, FAQ_QUERY_KEY } from "./useFAQData";

const resolveCollectionRef = () => collection(db, ...FAQ_COLLECTION_PATH);
const resolveDocRef = (faqId) => doc(db, ...FAQ_COLLECTION_PATH, faqId);

export const useCreateFAQ = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ createdBy, ...data }) => {
            const collectionRef = resolveCollectionRef();
            const now = serverTimestamp();
            const docRef = await addDoc(collectionRef, {
                ...data,
                createdBy: createdBy || null,
                createdAt: now,
                updatedAt: now,
            });

            await updateDoc(docRef, { id: docRef.id });

            return {
                ...data,
                id: docRef.id,
                createdBy: createdBy || null,
            };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FAQ_QUERY_KEY });
        },
    });
};

export const useUpdateFAQ = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ faqId, data }) => {
            if (!faqId) {
                throw new Error("faqId is required to update FAQ");
            }

            await updateDoc(resolveDocRef(faqId), {
                ...data,
                id: faqId,
                updatedAt: serverTimestamp(),
            });

            return { ...data, id: faqId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FAQ_QUERY_KEY });
        },
    });
};

export const useDeleteFAQ = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ faqId }) => {
            if (!faqId) {
                throw new Error("faqId is required to delete FAQ");
            }

            await deleteDoc(resolveDocRef(faqId));

            return faqId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FAQ_QUERY_KEY });
        },
    });
};
