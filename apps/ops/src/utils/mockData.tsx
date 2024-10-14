import DescriptionList from '@deps/components/description-list/description-list';
import { numberFormatify } from '@deps/helpers/numbers.helper';

interface LabelValue {
    label: string;
    value: string;
    col: number;
    tooltip?: string;
}

export const mockPolicyData = () => {
    const policyOwnerInformation: LabelValue[] = [
        { label: 'Full name', value: 'Fiora Anderson', col: 1 },
        { label: 'SSN', value: '***-**-4578', col: 1 },
        { label: 'Birth date', value: '09/26/1986', col: 1 },
        { label: 'Primary phone', value: '(443) 786-4200', col: 2 },
        { label: 'Email', value: 'fiora.anderson@gmail.com', col: 2 },
        { label: 'Mailing address', value: '4452 Lake Forest Drive, \n\r Lenexa, KS, 66215', col: 2 },
    ];

    const policySummary: LabelValue[] = [
        { label: 'Product name', value: 'Name', col: 1 },
        { label: 'Issue date', value: '03/01/2023', col: 1 },
        { label: 'Face amount', value: numberFormatify('1000.00'), col: 2, tooltip: 'Face amount' },
        { label: 'Account value', value: numberFormatify('1080.00'), col: 2, tooltip: 'Account value' },
        { label: 'Net Surrender value', value: numberFormatify('7009.00'), col: 2, tooltip: 'Net Surrender value' },
    ];

    const toDescriptionList = (array: LabelValue[], column = 1) => {
        return (
            <div>
                {array
                    .filter(({ col }) => column === col)
                    .map(({ label, value, tooltip }: LabelValue) => (
                        <DescriptionList key={'mock-data-description-list-policy-' + label} label={label} text={value} tooltip={tooltip} />
                    ))}
            </div>
        );
    };

    const PolicyOwnerInfo = () => (
        <>
            {toDescriptionList(policyOwnerInformation)}
            {toDescriptionList(policyOwnerInformation, 2)}
        </>
    );

    const PolicySummaryInfo = () => (
        <>
            {toDescriptionList(policySummary)}
            {toDescriptionList(policySummary, 2)}
        </>
    );

    return [<PolicyOwnerInfo key="owner" />, <PolicySummaryInfo key="summary" />];
};
