import { createContext, useState } from 'react';

export type FormBridgeContextType = {
    formContext: any;
    setFormContext: (ctx: any) => void;
};

export const FormBridgeContext = createContext<FormBridgeContextType>({
    formContext: null,
    setFormContext: () => {},
});

export function FormBridgeContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [formContext, setFormContext] = useState<any>(null);

    return (
        <FormBridgeContext.Provider value={{ formContext, setFormContext }}>
            {children}
        </FormBridgeContext.Provider>
    );
}
