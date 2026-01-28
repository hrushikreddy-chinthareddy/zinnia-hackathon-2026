import { useQuery } from '@tanstack/react-query';
import { Heading, HeadingVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { Loader } from '@deps/components/page-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import {
    numberFormatify,
    percentFormatify,
} from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { getPremiumBonusRate } from '@deps/queries/api/product-rate';
import { DEFAULT_ERROR_STRING, toTitleCase } from '@deps/utils/strings';

import styles from './PremiumBonusCard.module.css';

interface PremiumBonusCardProps {
    policy: PolicyDetails;
}

export default function PremiumBonusCard({ policy }: PremiumBonusCardProps) {
    const { t } = useTranslation();

    const { isLoading, data: bonusRate } = useQuery({
        queryKey: ['premium-bonus-rate', policy],
        queryFn: () => getPremiumBonusRate(policy),
        select: (data) =>
            data
                ? percentFormatify(data, { isInteger: true })
                : DEFAULT_ERROR_STRING,
        enabled: !!policy?.policy,
    });

    const {
        unvestedPremiumBonus,
        totalRecapturedPremiumBonus,
        vestingPeriod,
        matchVestingDate,
    } = policy?.policy?.allocation?.matchSegment || {};

    return (
        <CardContainer containerClassNames={styles.cardContainer}>
            <div className={styles.headerContainer}>
                <Heading as={HeadingVariant.h2}>
                    {toTitleCase(t('allFields.premiumBonus'))}
                </Heading>
            </div>
            {isLoading ? (
                <div className={styles.loaderContainer}>
                    <Loader />
                </div>
            ) : (
                <div className={styles.fieldsContainer}>
                    <div>
                        <Label
                            label={t('allFields.unvestedPremiumBonus')}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content
                            details={numberFormatify(unvestedPremiumBonus)}
                            variant={ContentVariant.BodySm}
                        />
                    </div>
                    <div>
                        <Label
                            label={t('allFields.totalRecapturedPremiumBonus')}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content
                            details={numberFormatify(
                                totalRecapturedPremiumBonus
                            )}
                            variant={ContentVariant.BodySm}
                        />
                    </div>
                    <div>
                        <Label
                            label={t('allFields.bonusRate')}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content
                            details={bonusRate}
                            variant={ContentVariant.BodySm}
                        />
                    </div>
                    <div>
                        <Label
                            label={t('allFields.vestingPeriod')}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content
                            details={
                                t('temporal.years', {
                                    count: vestingPeriod,
                                }) || ''
                            }
                            variant={ContentVariant.BodySm}
                        />
                    </div>
                    <div>
                        <Label
                            label={t('allFields.vestingDate')}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content
                            details={convertKebabedDateString(matchVestingDate)}
                            variant={ContentVariant.BodySm}
                        />
                    </div>
                </div>
            )}
        </CardContainer>
    );
}
