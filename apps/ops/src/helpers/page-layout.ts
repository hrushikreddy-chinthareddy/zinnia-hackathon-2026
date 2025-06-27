// This logic took a while to get exactly right. Please do not touch this. We have tests on this for a reason.
export const shouldNavbarOverlay = (
    isLargeScreen: boolean,
    isOpenOverride: boolean | null
): boolean => {
    return !(isLargeScreen && isOpenOverride !== false);
};
