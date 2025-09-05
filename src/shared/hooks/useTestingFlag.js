import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

// Reads a Firestore document at settings/flags and listens for changes.
// We normalize similar to useMaintenanceFlag and expose a `testing` boolean.
export function useTestingFlag({ defaultValue = false } = {}) {
    const [testing, setTesting] = useState(defaultValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const ref = doc(db, "settings", "flags");
            const unsub = onSnapshot(
                ref,
                (snap) => {
                    const data = snap.data();

                    let testingValue = undefined;
                    if (data && typeof data === "object") {
                        if (Object.prototype.hasOwnProperty.call(data, "testing")) {
                            testingValue = data.testing;
                        } else {
                            for (const [k, v] of Object.entries(data)) {
                                if (k && k.toString().trim().toLowerCase() === "testing") {
                                    testingValue = v;
                                    break;
                                }
                            }
                        }
                    }

                    setTesting(Boolean(testingValue));
                    setLoading(false);
                    console.log("Testing flag updated:", data, "normalized testing:", testingValue);
                },
                (err) => {
                    setError(err);
                    setLoading(false);
                }
            );
            return () => unsub();
        } catch (e) {
            setError(e);
            setLoading(false);
            return undefined;
        }
    }, []);

    return { testing, loading, error };
}
