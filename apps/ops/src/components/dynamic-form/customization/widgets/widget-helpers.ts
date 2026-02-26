export const formatPhoneNumber = (digits: string) => {
    if (!digits) return '';

    if (digits.length <= 3) return `+${digits}`;

    if (digits.length <= 6)
        return `+${digits.slice(0, 1)} (${digits.slice(1)})`;

    if (digits.length <= 10)
        return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(
            4
        )}`;

    const countrycode = digits.slice(0, digits.length - 10);
    const area = digits.slice(digits.length - 10, digits.length - 7);
    const dial = digits.slice(digits.length - 7);

    return `+${countrycode} (${area}) ${dial.slice(0, 3)}-${dial.slice(3)}`;
};
