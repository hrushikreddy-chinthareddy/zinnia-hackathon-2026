import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useMemo,
    useState,
} from 'react';

type TTreeState = {
    treeState: boolean;
    setTreeState: Dispatch<SetStateAction<boolean>>;
};

export const [Expand, Collapse] = [true, false];

const TreeStateContext = createContext<TTreeState | null>(null);
export const TreeStateProvider = ({
    children,
    initialTreeState,
}: {
    children: ReactNode;
    initialTreeState: boolean;
}) => {
    const [treeState, setTreeState] = useState(initialTreeState || Collapse);
    const memoizedValues = useMemo(
        () => ({ treeState, setTreeState }),
        [treeState, setTreeState]
    );

    return (
        <TreeStateContext.Provider value={memoizedValues}>
            {children}
        </TreeStateContext.Provider>
    );
};

export const useTreeState = () => {
    const context = useContext(TreeStateContext);

    if (!context) {
        throw new Error('useTreeState must be used within a TreeStateProvider');
    }

    return context;
};
