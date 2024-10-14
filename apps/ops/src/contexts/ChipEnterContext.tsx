import { createContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const ChipEnterContext = createContext<{
    chipEntered: boolean;
    setChipEntered: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    chipEntered: false,
    setChipEntered: noop,
});
