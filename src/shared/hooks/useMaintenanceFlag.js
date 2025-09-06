import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

// Reads a Firestore document at settings/flags and listens for changes.
// Document shape example: { maintenance: true, targetDate: <serverTimestamp>, updatedAt: <serverTimestamp> }
export function useMaintenanceFlag({ defaultValue = false } = {}) {
    const [maintenance, setMaintenance] = useState(defaultValue);
    const [targetDate, setTargetDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const ref = doc(db, "settings", "flags");
            const unsub = onSnapshot(
                ref,
                (snap) => {
                    const data = snap.data();

                    // Normalize lookup so we tolerate field names with stray spaces or different casing
                    let maintenanceValue = undefined;
                    if (data && typeof data === "object") {
                        if (Object.prototype.hasOwnProperty.call(data, "maintenance")) {
                            maintenanceValue = data.maintenance;
                        } else {
                            // Find a key that, when trimmed and lowercased, equals 'maintenance'
                            for (const [k, v] of Object.entries(data)) {
                                if (k && k.toString().trim().toLowerCase() === "maintenance") {
                                    maintenanceValue = v;
                                    break;
                                }
                            }
                        }
                    }

                    setMaintenance(Boolean(maintenanceValue));

                    // Fetch targetDate
                    let targetDateValue = null;
                    if (data && data.targetDate) {
                        if (data.targetDate.toDate) {
                            targetDateValue = data.targetDate.toDate();
                        } else {
                            targetDateValue = new Date(data.targetDate);
                        }
                    }
                    setTargetDate(targetDateValue);

                    setLoading(false);
                    console.log("Maintenance flag updated:", data, "normalized maintenance:", maintenanceValue, "targetDate:", targetDateValue);
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

    return { maintenance, targetDate, loading, error };
}
