// Utility helpers for computing filter-related button visibility
// Keep these pure so components can wrap them with useMemo/useCallback as needed

/**
 * Determine if there are unapplied filters compared to displayState.appliedFilters.
 * If no appliedFilters exist, returns true only if all of the provided keys in filterState are set.
 * @param {Object} filterState
 * @param {Object} displayState
 * @param {Array<string>} keys - which filter keys to consider (defaults to all keys in filterState)
 */
export function hasUnappliedFilters(
    filterState = {},
    displayState = {},
    keys = []
) {
    const applied = displayState && displayState.appliedFilters;

    const keysToCheck = keys.length ? keys : Object.keys(filterState);

    if (!applied) {
        return keysToCheck.every((k) => {
            const val = filterState[k];
            // treat empty string as not set
            return val !== null && val !== undefined && val !== "";
        });
    }

    return keysToCheck.some((k) => filterState[k] !== applied[k]);
}

/**
 * Determine if current filterState differs from the initial filter state.
 * Useful for showing Reset button only when anything has changed.
 * @param {Object} filterState
 * @param {Object} initialFilterState
 * @param {Array<string>} keys - which filter keys to consider (defaults to all keys in initialFilterState)
 */
export function hasFiltersChanged(
    filterState = {},
    initialFilterState = {},
    keys = []
) {
    const keysToCheck = keys.length ? keys : Object.keys(initialFilterState);

    return keysToCheck.some((k) => filterState[k] !== initialFilterState[k]);
}
