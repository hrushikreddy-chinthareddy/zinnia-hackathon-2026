export const isAllowedState = (state: string): boolean => {
    const allowedStates = ['AR', 'CT', 'GA', 'IA', 'ME', 'MI', 'MN', 'NC', 'OR', 'VA'];
    return allowedStates.includes(state);
};
