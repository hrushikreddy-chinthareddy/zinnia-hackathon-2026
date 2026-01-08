import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

import FundsCard from './funds-card';
import { getFundDetailsViewModel } from '../funds.helpers';
import { FundDetailsViewModel } from '../types';

interface FundsDetailsCardProps {
    policy: PolicyDetails;
}

const FundsDetailsCard = ({ policy }: FundsDetailsCardProps) => {
    const { t } = useTranslation();
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
                <Typography variant={TypographyVariant.H2}>
                    {t('policy.funds.fundDetails.title') ?? ''}
                </Typography>
                <div className="flex flex-col gap-10">
                    {viewModel?.holdingFunds &&
                        viewModel?.holdingFunds.length > 0 && (
                            <FundsCard
                                funds={viewModel?.holdingFunds}
                                loading={loading}
                                title={
                                    t(
                                        'policy.funds.fundDetails.holdingFunds'
                                    ) ?? ''
                                }
                                titleTooltip={
                                    t(
                                        'policy.funds.fundDetails.holdingFundsTooltip'
                                    ) ?? ''
                                }
                                policy={policy}
                            />
                        )}
                    <FundsCard
                        funds={viewModel?.electedFunds}
                        loading={loading}
                        title={t('policy.funds.fundDetails.electedFunds') ?? ''}
                        titleTooltip={
                            t('policy.funds.fundDetails.electedFundsTooltip') ??
                            ''
                        }
                        policy={policy}
                        notElectedfunds={viewModel?.notElectedFunds}
                        caption={t('allFields.tableCaptionsElectedFunds') ?? ''}
                    />
                    {viewModel?.notElectedFunds &&
                        viewModel?.notElectedFunds.length > 0 && (
                            <FundsCard
                                funds={viewModel?.notElectedFunds}
                                loading={loading}
                                title={
                                    t(
                                        'policy.funds.fundDetails.notElectedFunds'
                                    ) ?? ''
                                }
                                titleTooltip={
                                    t(
                                        'policy.funds.fundDetails.notElectedFundsTooltip'
                                    ) ?? ''
                                }
                                policy={policy}
                                caption={
                                    t(
                                        'allFields.tableCaptionsNotElectedFunds'
                                    ) ?? ''
                                }
                            />
                        )}
                </div>
            </div>
        </CardContainer>
    );
};

export default FundsDetailsCard;
