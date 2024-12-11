import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { getRiskClass } from '@deps/helpers/party-info-helper';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { ReactComponent as ShieldHeart } from '@deps/styles/elements/icons/navigation/shield-heart.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';

const InsuredCard = ({ policy }: { policy: PolicyDetails }) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'policy.detailCards.coveredParty' });

    const { ageInYears, fullName = DEFAULT_ERROR_STRING, partyId } = policy.coveredPeople?.[0] || {};
    const { issueAge, riskClass } = policy.coverage.getCoverageParticipantByPartyId(partyId) || {};

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <div className="flex gap-2">
                <ShieldHeart className="mt-1 flex-none text-primary" height={'24px'} role="presentation" width={'24px'} />
                <div>
                    <Typography variant={TypographyVariant.H2}>{t('insured')}</Typography>
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row lg:ml-8">
                <div className="flex flex-col gap-8 lg:flex-row">
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
                </div>
                <div className="flex flex-col gap-8 lg:flex-row">
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
                            details={
                                isNullEmptyOrUndefined(issueAge) ? DEFAULT_ERROR_STRING : (t('yearsOld', { count: issueAge }) as string)
                            }
                            variant={ContentVariant.BodySm}
                        />
                    </div>
                </div>
            </div>
        </CardContainer>
    );
};

const AnnuitantCard = ({ policy }: { policy: PolicyDetails }) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'policy.detailCards.coveredParty' });

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <div className="flex gap-2">
                <ShieldHeart className="mt-1 flex-none text-primary" height={'24px'} role="presentation" width={'24px'} />
                <div>
                    <Typography variant={TypographyVariant.H2}>{t('annuitant')}</Typography>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
                {policy.coveredPeople.map(({ partyId, ageInYears, fullName = DEFAULT_ERROR_STRING }) => (
                    <div className="flex flex-col gap-8 md:flex-row lg:ml-8" key={partyId}>
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
