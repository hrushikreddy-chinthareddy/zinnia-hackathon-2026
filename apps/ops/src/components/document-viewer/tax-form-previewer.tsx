import { TaxformResponse } from '@zinnia/api-types/types/documents-v3';
import { useTranslation } from 'next-i18next';

import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { TaxForm } from '@deps/models/case/send-tax-forms';

export interface TaxFormPreviewer {
    carrier: string;
    taxForm: TaxformResponse;
    className?: string;
    policyNumber: string;
    planCode?: string;
    variant?: NavElementVariant;
}

export default function TaxFormPreviewer({
    carrier,
    taxForm,
    policyNumber,
    planCode,
    children,
    className = '',
    variant,
}: TaxFormPreviewer & { children: React.ReactNode }) {
    const { t } = useTranslation();

    return (
        <NavElement
            className={className}
            href={
                `/documents/tax-forms/${
                    taxForm?.formId
                }?contractNumber=${policyNumber}&clientCode=${carrier}&fChar=${
                    (taxForm as TaxForm)?.fChar ?? taxForm?.fchar
                }` +
                (taxForm?.taxYear ? `&taxYear=${taxForm?.taxYear}` : '') +
                (planCode ? `&planCode=${planCode}` : '')
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
