import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../shared/firebase/firebase";
import fallbackFaqs from "../data/fallbackFaqs.json";

export const FAQ_QUERY_KEY = ["helpCenter", "faqs"];
export const FAQ_COLLECTION_PATH = ["helpCenter", "faqs", "items"];

const fetchFaqs = async () => {
    try {
        const faqQuery = query(
            collection(db, ...FAQ_COLLECTION_PATH),
            orderBy("order", "asc")
        );
        const snapshot = await getDocs(faqQuery);

        if (snapshot.empty) {
            return [...fallbackFaqs];
        }

        return snapshot.docs.map((faqDoc) => {
            const data = faqDoc.data();
            return {
                id: faqDoc.id,
                ...data,
                order:
                    typeof data.order === "number"
                        ? data.order
                        : Number(data.order) || 0,
            };
        });
    } catch (error) {
        console.warn(
            "Failed to fetch FAQs from Firestore, falling back to static data:",
            error
        );
        return [...fallbackFaqs];
    }
};

export const useFAQs = () =>
    useQuery({
        queryKey: FAQ_QUERY_KEY,
        queryFn: fetchFaqs,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
