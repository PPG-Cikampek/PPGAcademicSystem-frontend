import { useMemo } from "react";

/**
 * Custom hook to determine the optimal list rendering strategy
 * based on the number of items and their dynamic states
 *
 * @param {number} itemCount - Total number of items in the list
 * @param {Object} expandedStates - Object containing expanded states (notes, menus, etc.)
 * @param {number} threshold - Threshold for enabling virtualization (default: 50)
 * @returns {Object} - Contains rendering strategy and configuration
 */
export const useListVirtualization = (
    itemCount,
    expandedStates = {},
    threshold = 1
) => {
    const strategy = useMemo(() => {
        // Don't virtualize for small lists
        if (itemCount < threshold) {
            return {
                type: "regular",
                shouldVirtualize: false,
                useVariableHeight: false,
                reason: "Small list - better UX without virtualization",
            };
        }

        // Check if any items have dynamic height
        const hasExpandedItems = Object.values(expandedStates).some(
            (stateGroup) => Object.values(stateGroup || {}).some(Boolean)
        );

        if (hasExpandedItems) {
            return {
                type: "variable-height",
                shouldVirtualize: true,
                useVariableHeight: true,
                reason: "Large list with dynamic heights",
            };
        }

        return {
            type: "fixed-height",
            shouldVirtualize: true,
            useVariableHeight: false,
            reason: "Large list with consistent heights",
        };
    }, [itemCount, expandedStates, threshold]);

    const config = useMemo(
        () => ({
            // Performance optimizations
            overscanCount: itemCount > 200 ? 10 : 5,

            // Height configurations
            defaultListHeight: Math.min(600, itemCount * 80),
            baseItemHeight: 80,

            // Estimated heights for expanded states
            expandedHeights: {
                notes: 60,
                violations: 120,
                actions: 40,
            },
        }),
        [itemCount]
    );

    return {
        strategy,
        config,
        // Helper methods
        getListHeight: (maxHeight = 600) =>
            Math.min(maxHeight, itemCount * config.baseItemHeight),
        shouldUseVirtualization: () => strategy.shouldVirtualize,
        getVirtualizationType: () => strategy.type,
    };
};

export default useListVirtualization;
