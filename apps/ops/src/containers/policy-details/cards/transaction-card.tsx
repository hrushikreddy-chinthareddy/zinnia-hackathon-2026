import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

import ClickContainer from '@deps/components/click-container/click-container';
import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { ReactComponent as ChevronRightIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-right.svg';

export interface TransactionCardProps {
    href: string;
    fieldLabel: string;
    summary: string;
    cardTitle: string;
    value: number | string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ href, fieldLabel, summary, cardTitle, value }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const goto = (href: string) => {
        router.push(href);
    };

    return (
        <ClickContainer
            ariaLabel={t('policy.detailCards.policyDetails.goToThisPolicysPage', { page: cardTitle })}
            classes="w-[226px] border-2 p-px"
            role="link"
            onClick={() => goto(href)}
        >
            <div className="flex justify-between" data-testid="transaction-card">
                <Label className="text-gray-900" label={cardTitle} variant={LabelVariant.LabelLg} />
                <ChevronRightIcon width="18px" height="18px" className="text-secondary" />
            </div>
            <dl className="mt-4">
                <Label className="text-gray-900" label={fieldLabel} variant={LabelVariant.FieldLabel} />
                <Content className="text-gray-900" details={`${value}`} variant={ContentVariant.Value} />
                <Content className="text-gray-600" details={summary} variant={ContentVariant.Caption} />
            </dl>
        </ClickContainer>
    );
};

export default TransactionCard;
