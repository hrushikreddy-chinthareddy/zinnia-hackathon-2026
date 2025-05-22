import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

import FundsCard from './funds-card';
import { getFundDetailsViewModel } from '../funds.helpers';
import { FundDetailsViewModel } from '../types';

interface FundsDetailsCardProps {
    policy: PolicyDetails;
}

const FundsDetailsCard = ({ policy }: FundsDetailsCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.funds.fundDetails',
    });
    const [viewModel, setViewModel] = useState<FundDetailsViewModel>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const getViewModel = async () => {
            const fundsPageViewModel = await getFundDetailsViewModel(policy);

            setViewModel(fundsPageViewModel);
            setLoading(false);
        };
        getViewModel();
    }, [policy]);

    return (
        <CardContainer containerClassNames="rounded-b">
            <div className="flex flex-col gap-6">
                <Typography variant={TypographyVariant.H2}>{t('title')}</Typography>
                <div className="flex flex-col gap-10">
                    {viewModel?.holdingFunds && viewModel?.holdingFunds.length > 0 && (
                        <FundsCard
                            funds={viewModel?.holdingFunds}
                            loading={loading}
                            title={t('holdingFunds') as string}
                            titleTooltip={t('holdingFundsTooltip') as string}
                            policy={policy}
                        />
                    )}
                    <FundsCard
                        funds={viewModel?.electedFunds}
                        loading={loading}
                        title={t('electedFunds') as string}
                        titleTooltip={t('electedFundsTooltip') as string}
                        policy={policy}
                        notElectedfunds={viewModel?.notElectedFunds}
                    />
                    {viewModel?.notElectedFunds && viewModel?.notElectedFunds.length > 0 && (
                        <FundsCard
                            funds={viewModel?.notElectedFunds}
                            loading={loading}
                            title={t('notElectedFunds') as string}
                            titleTooltip={t('notElectedFundsTooltip') as string}
                            policy={policy}
                        />
                    )}
                </div>
            </div>
        </CardContainer>
    );
};

export default FundsDetailsCard;
