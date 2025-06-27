import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import Footnote from '@deps/components/footnote/footnote';
import Label, { LabelVariant } from '@deps/components/label/label';
import { Loader } from '@deps/components/page-loader';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { percentFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { getSbulMatchRate } from '@deps/queries/api/product-rate';
import { ReactComponent as CurrencyDollarsIcon } from '@deps/styles/elements/icons/icons_outlined/currency-dollar.svg';

import { getMatchViewModel } from '../funds.helpers';
import { MatchViewModel } from '../types';

interface MatchCardProps {
    policy: PolicyDetails;
}

const MatchCard = ({ policy }: MatchCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.funds.matchCard',
    });

    const [viewModel, setViewModel] = useState<MatchViewModel>();
    const [loading, setLoading] = useState<boolean>(true);
    const [matchRate, setMatchRate] = useState(t('loadingMatchRate') as string);

    useEffect(() => {
        const getRate = async () => {
            const match = await getSbulMatchRate(policy);
            setMatchRate(percentFormatify(match));
        };

        const getViewModel = async () => {
            const matchViewModel = getMatchViewModel(
                policy?.policy?.allocation?.matchSegment,
                policy?.product
            );

            setViewModel(matchViewModel);
            setLoading(false);
        };

        getViewModel();
        getRate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            {loading && <Loader />}

            {!loading && (
                <>
                    <div className="flex gap-2">
                        <CurrencyDollarsIcon
                            className="mt-1 text-primary"
                            role="presentation"
                            width={24}
                            height={24}
                        />
                        <Typography variant={TypographyVariant.H2}>
                            {t('label')}
                        </Typography>
                    </div>
                    <div className="mt-4 grid grid-cols-[repeat(2,minmax(min-content,max-content))] gap-x-8 gap-y-4 md:flex md:flex-wrap lg:ml-8">
                        <div>
                            <Label
                                label={t('currentValue')}
                                tooltipBody={t('currentValuePopover')}
                                tooltipTitle={t('currentValue')}
                                variant={LabelVariant.FieldLabel}
                            />
                            <Content
                                details={viewModel?.matchAccountValue}
                                variant={ContentVariant.BodySm}
                            />
                            <Content
                                className="text-gray-600"
                                details={
                                    t('ytdValue', {
                                        value: viewModel?.yearToDateMatchValue,
                                    }) as string
                                }
                                variant={ContentVariant.Caption}
                            />
                        </div>
                        <div>
                            <Label
                                label={t('matchRate')}
                                tooltipBody={t('matchRatePopover')}
                                tooltipTitle={t('matchRate')}
                                variant={LabelVariant.FieldLabel}
                            />
                            <Content
                                details={matchRate}
                                variant={ContentVariant.BodySm}
                            />
                        </div>
                        <div>
                            <Label
                                label={t('vestingPeriod')}
                                tooltipBody={t('vestingPeriodPopover')}
                                tooltipTitle={t('vestingPeriod')}
                                variant={LabelVariant.FieldLabel}
                            />
                            <Content
                                details={
                                    t('years', {
                                        count: viewModel?.vestingPeriod,
                                    }) as string
                                }
                                variant={ContentVariant.BodySm}
                            />
                            <Content
                                className="text-gray-600"
                                details={
                                    t('matchVestingDate', {
                                        date: viewModel?.matchVestingDate,
                                    }) as string
                                }
                                variant={ContentVariant.Caption}
                            />
                        </div>
                        <div>
                            <Label
                                label={t('maxLifetimeMatch')}
                                tooltipBody={t('maxLifetimeMatchPopover')}
                                tooltipTitle={t('maxLifetimeMatch')}
                                variant={LabelVariant.FieldLabel}
                            />
                            <Content
                                details={
                                    viewModel?.maximumLifeTimeVestingAmount
                                }
                                variant={ContentVariant.BodySm}
                            />
                        </div>
                    </div>
                    <Footnote
                        productMarketingName={viewModel?.marketingName}
                        productType={viewModel?.product?.productType}
                    />
                </>
            )}
        </CardContainer>
    );
};

export default MatchCard;
