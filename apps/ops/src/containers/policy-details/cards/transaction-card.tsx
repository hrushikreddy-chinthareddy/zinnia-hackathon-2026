import { Icon, IconType } from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

import ClickContainer from '@deps/components/click-container/click-container';
import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';

export interface TransactionCardProps {
    href: string;
    fieldLabel: string;
    summary: string;
    cardTitle: string;
    value: number | string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
    href,
    fieldLabel,
    summary,
    cardTitle,
    value,
}) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.detailCards.policyDetails',
    });
    const router = useRouter();

    const goto = (href: string) => {
        router.push(href);
    };

    return (
        <ClickContainer
            ariaLabel={t('goToThisPolicysPage', { page: cardTitle })}
            classes="w-[226px] border-2 p-px !z-[1]"
            role="link"
            onClick={() => goto(href)}
        >
            <div
                className="flex justify-between"
                data-testid="transaction-card"
            >
                <Label
                    className="text-gray-900"
                    label={cardTitle}
                    variant={
                        cardTitle === t('rmds')
                            ? LabelVariant.LabelUnchanged
                            : LabelVariant.LabelLg
                    }
                />
                <Icon
                    type={IconType.CHEVRON_RIGHT}
                    height={18}
                    width={18}
                    color="var(--color-base-text-text-link)"
                />
            </div>
            <dl className="mt-4">
                <Label
                    className="text-gray-900"
                    label={fieldLabel}
                    variant={LabelVariant.FieldLabel}
                />
                <Content
                    className="text-gray-900"
                    details={`${value}`}
                    variant={ContentVariant.Value}
                />
                <Content
                    className="text-gray-600"
                    details={summary}
                    variant={ContentVariant.Caption}
                />
            </dl>
        </ClickContainer>
    );
};

export default TransactionCard;
