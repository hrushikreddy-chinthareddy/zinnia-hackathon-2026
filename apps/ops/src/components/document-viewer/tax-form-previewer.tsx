import { useTranslation } from 'next-i18next';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '../nav-element/nav-element';
import { TaxformResponse } from '@zinnia/api-types/types/documents-v3';

export interface TaxFormPreviewer {
    carrier: string;
    taxForm: TaxformResponse;
    className?: string;
    policyNumber: string;
    variant?: NavElementVariant;
}

export default function TaxFormPreviewer({
    carrier,
    taxForm,
    policyNumber,
    children,
    className = '',
    variant,
}: TaxFormPreviewer & { children: React.ReactNode }) {
    const { t } = useTranslation();

    return (
        <NavElement
            className={className}
            href={
                `/documents/tax-forms/${taxForm?.formId}?contractNumber=${policyNumber}&clientCode=${carrier}&fChar=${
                    taxForm?.fChar ?? taxForm?.fchar
                }` + (taxForm?.taxYear ? `&taxYear=${taxForm?.taxYear}` : '')
            }
            isNewPage={false}
            size={NavElementSize.Small}
            target="_blank"
            title={`${t('general.preview')} ${taxForm?.name}`}
            type={NavElementType.Link}
            variant={variant}
        >
            {children}
        </NavElement>
    );
}
