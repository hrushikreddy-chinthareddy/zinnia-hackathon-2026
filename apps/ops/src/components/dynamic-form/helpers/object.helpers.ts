interface FormContextOptions {
    keyName: string;
    details: string;
    mainObject: string;
    minuend: string;
    subtrahend: string;
}

export const extractNestedData = (
    formContext: any,
    options: FormContextOptions
): { minuendData: string; subtrahendData: string } | null => {
    try {
        const data =
            formContext?.[options.keyName]?.[options.details]?.[
                options.mainObject
            ];

        if (!data) return null;

        const minuendData = data[options.minuend];
        const subtrahendData = data[options.subtrahend];

        if (!minuendData || !subtrahendData) return null;

        return {
            minuendData,
            subtrahendData,
        };
    } catch (error) {
        console.error('Error extracting nested data:', error);
        return null;
    }
};
export const calculateDifference = (
    formContext: any,
    options: FormContextOptions
): number | null => {
    const data = extractNestedData(formContext, options);
    if (!data) return null;

    const { minuendData, subtrahendData } = data;
    return Number(minuendData) - Number(subtrahendData);
};
