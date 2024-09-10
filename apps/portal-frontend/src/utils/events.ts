export const handleKeyDown = (e: React.KeyboardEvent, onClick?: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent scrolling when pressing Spacebar

        if (onClick) {
            onClick();
        }
    }
};
