import { FlatExtra, FlatExtraType, SubStandardRating } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { getRiskClass, getSubstandardRating } from '@deps/helpers/party-info-helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

const TableRating = ({ substandardRating }: { substandardRating: SubStandardRating | undefined }) => {
    const { t } = useTranslation();
    return (
        <div>
            <Label
                label={t('policy.detailCards.coveredParty.tableRating')}
                variant={LabelVariant.FieldLabel}
                tooltipBody={t('policy.detailCards.coveredParty.tableRatingTooltip')}
                tooltipTitle={t('policy.detailCards.coveredParty.tableRating')}
            />
            <Content
                details={substandardRating ? getSubstandardRating(substandardRating, t) : DEFAULT_ERROR_STRING}
                variant={ContentVariant.BodySm}
            />
        </div>
    );
};

const FlatExtras = ({ flatExtras }: { flatExtras?: FlatExtra[] }) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'policy.detailCards.coveredParty' });
    if (!flatExtras?.length) {
        return (
            <div>
                <Label
                    label={t('flatExtraNull')}
                    variant={LabelVariant.FieldLabel}
                    tooltipTitle={t('flatExtraNull')}
                    tooltipBody={t('flatExtraTooltip')}
                />
                <Content details={t('none') as string} variant={ContentVariant.BodySm} />
            </div>
        );
    }

    return flatExtras.map((flatExtra, index) => {
        const { flatExtraType, flatExtraAmount, flatExtraDuration } = flatExtra;
        const flatExtraTitle = flatExtraType ? t('flatExtraType', { type: t(flatExtraType) }) : t('flatExtraNull');
        return (
            <div key={index}>
                <Label
                    label={flatExtraTitle}
                    variant={LabelVariant.FieldLabel}
                    tooltipTitle={flatExtraTitle}
                    tooltipBody={t('flatExtraTooltip')}
                />
                <Content
                    details={flatExtraAmount ? numberFormatify(flatExtraAmount) : (t('none') as string)}
                    variant={ContentVariant.BodySm}
                />
                {(flatExtraType === FlatExtraType.TEMP || flatExtraType === ('TEMPORARY' as FlatExtraType)) && (
                    <Content
                        className="text-gray-600"
                        details={t('duration', { duration: flatExtraDuration || DEFAULT_ERROR_STRING }) as string}
                        variant={ContentVariant.Caption}
                    />
                )}
            </div>
        );
    });
};

export const InsuredCard = ({ policy }: { policy: PolicyDetails }) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'policy.detailCards.coveredParty' });

    const { ageInYears, fullName = DEFAULT_ERROR_STRING, partyId } = policy.coveredPeople?.[0] || {};
    const { issueAge, riskClass, substandardRating, flatExtra } = policy.coverage.getCoverageParticipantByPartyId(partyId) || {};

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-200">
            <Typography variant={TypographyVariant.H2}>{t('insured')}</Typography>
            <div className="mt-4 sm:flex gap-8 sm:flex-wrap grid grid-cols-2">
                <div>
                    <Label label={t('fullName')} variant={LabelVariant.FieldLabel} />
                    <NavElement
                        href={`/policies/${policy.planCode}/${policy.policyNumber}/people/${partyId}`}
                        size={NavElementSize.Small}
                        type={NavElementType.Link}
                    >
                        <PiiWrapper>{fullName}</PiiWrapper>
                    </NavElement>
                </div>
                <div>
                    <Label
                        label={t('riskClass')}
                        tooltipBody={t('riskClassTooltip')}
                        tooltipTitle={t('riskClass')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={riskClass ? (getRiskClass(riskClass) as string) : DEFAULT_ERROR_STRING}
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <TableRating substandardRating={substandardRating} />
                <FlatExtras flatExtras={flatExtra} />
                <div>
                    <Label label={t('currentAge')} variant={LabelVariant.FieldLabel} />
                    <Content
                        pii={true}
                        details={
                            isNullEmptyOrUndefined(ageInYears) ? DEFAULT_ERROR_STRING : (t('yearsOld', { count: ageInYears }) as string)
                        }
                        variant={ContentVariant.BodySm}
                    />
                </div>
                <div>
                    <Label label={t('ageAtIssue')} variant={LabelVariant.FieldLabel} />
                    <Content
                        pii={true}
                        details={isNullEmptyOrUndefined(issueAge) ? DEFAULT_ERROR_STRING : (t('yearsOld', { count: issueAge }) as string)}
                        variant={ContentVariant.BodySm}
                    />
                </div>
            </div>
        </CardContainer>
    );
};

export const AnnuitantCard = ({ policy }: { policy: PolicyDetails }) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'policy.detailCards.coveredParty' });

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-200">
            <Typography variant={TypographyVariant.H2}>{t('annuitant')}</Typography>

            <div className="mt-4 flex flex-col gap-2">
                {policy.coveredPeople.map(({ partyId, ageInYears, fullName = DEFAULT_ERROR_STRING }) => (
                    <div className="flex flex-col gap-8 md:flex-row" key={partyId}>
                        <div>
                            <Label label={t('fullName')} variant={LabelVariant.FieldLabel} />
                            <NavElement
                                href={`/policies/${policy.planCode}/${policy.policyNumber}/people/${partyId}`}
                                size={NavElementSize.Small}
                                type={NavElementType.Link}
                            >
                                <PiiWrapper>{fullName}</PiiWrapper>
                            </NavElement>
                        </div>
                        <div className="flex flex-row gap-8">
                            <div>
                                <Label label={t('currentAge')} variant={LabelVariant.FieldLabel} />
                                <Content
                                    pii={true}
                                    details={
                                        isNullEmptyOrUndefined(ageInYears)
                                            ? DEFAULT_ERROR_STRING
                                            : (t('yearsOld', { count: ageInYears }) as string)
                                    }
                                    variant={ContentVariant.BodySm}
                                />
                            </div>
                            <div>
                                <Label label={t('ageAtIssue')} variant={LabelVariant.FieldLabel} />
                                <Content
                                    pii={true}
                                    details={
                                        isNullEmptyOrUndefined(policy.coverage.getCoverageParticipantByPartyId(partyId)?.issueAge)
                                            ? DEFAULT_ERROR_STRING
                                            : (t('yearsOld', {
                                                  count: policy.coverage.getCoverageParticipantByPartyId(partyId)?.issueAge,
                                              }) as string)
                                    }
                                    variant={ContentVariant.BodySm}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CardContainer>
    );
};

export default function CoveredPartyCard({ policy }: { policy: PolicyDetails }) {
    if (policy?.isAnnuity) {
        return <AnnuitantCard policy={policy} />;
    }
    return <InsuredCard policy={policy} />;
}
