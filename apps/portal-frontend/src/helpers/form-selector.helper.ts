export type FormComponentMap = Record<string, React.ReactNode>;

export const determineFormToRender = (clientId: string, formMap: FormComponentMap): React.ReactNode => {
    const clientKey = clientId.toUpperCase();
    const formComponent = formMap[clientKey];
    
    if (formComponent === undefined) {
        console.error('determineFormToRender::unsupported clientId', clientId);
    }

    return formComponent ?? null;
};