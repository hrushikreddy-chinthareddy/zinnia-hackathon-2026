import {
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';

type PrintContextValue = {
    isPrinting: boolean;
    setIsPrinting: Dispatch<SetStateAction<boolean>>;
    printSection: (isContentHidden?: boolean) => void;
};

const PrintContext = createContext<PrintContextValue | undefined>(undefined);

export const PrintProvider = ({ children }: { children: React.ReactNode }) => {
    const [isPrinting, setIsPrinting] = useState(false);
    const [shouldPrint, setShouldPrint] = useState(false);
    const [shouldHideContentAfter, setShouldHideContentAfter] = useState(false);

    /**
     * Triggers the browser print dialog while temporarily enabling
     * "print-only" styles.
     *
     * This function adds a CSS class to the <body> element that
     * activates print-specific rules (defined in global styles),
     * calls `window.print()`, and then removes the class once the
     * print dialog is triggered.
     *
     * Note:
     * - The `print-only` class must be defined in global CSS using
     *   `@media print`.
     * - Intended to be used in the browser only.
     *  CSS style already added at apps\ops\src\styles\styles.css
     *
     * Typical use case:
     * - Print only a specific section of the page
     * - Hide layout, navigation or secondary content
     *
     * @param [isContentHidden=false] - flag to determine if an specific content should be displayed before print
     */
    const printSection = (isContentHidden = false): void => {
        setIsPrinting(true);
        setShouldPrint(true);

        const printContent = document.getElementById('printable');
        if (isContentHidden && printContent) {
            setShouldHideContentAfter(isContentHidden);
            printContent.style.display = 'block';
        }
    };

    useEffect(() => {
        if (!shouldPrint) {
            return;
        }
        const className = 'print-only';

        const beforePrint = () => {
            document.body.classList.add(className);
        };
        const afterPrint = () => {
            document.body.classList.remove(className);
            setIsPrinting(false);
            setShouldPrint(false);

            const printContent = document.getElementById('printable');
            if (printContent && shouldHideContentAfter) {
                printContent.style.display = 'none';
            }

            window.removeEventListener('beforeprint', beforePrint);
            window.removeEventListener('afterprint', afterPrint);
        };

        window.addEventListener('beforeprint', beforePrint);
        window.addEventListener('afterprint', afterPrint);

        requestAnimationFrame(() => {
            window.print();
        });
    }, [shouldPrint, shouldHideContentAfter]);
    return (
        <PrintContext.Provider
            value={{ isPrinting, setIsPrinting, printSection }}
        >
            {children}
        </PrintContext.Provider>
    );
};

export const usePrintContext = () => {
    const context = useContext(PrintContext);

    if (!context) {
        throw new Error('usePrintContext must be used within a PrintProvider');
    }

    return context;
};
