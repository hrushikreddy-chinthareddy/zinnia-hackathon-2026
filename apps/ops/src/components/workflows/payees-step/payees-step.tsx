import { FilingStatus } from '@zinnia/api-types/types/bpm';
import { PartyRole, Policy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import CardPeople from '@deps/components/card/card-people/card-people';
import { PopoverPlacement } from '@deps/components/popover/popover';
import Tooltip from '@deps/components/tooltip/tooltip';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { convertToChipText } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { buildFullNameFromParty, isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-medium.svg';
import { TransactionClickProps } from '@deps/types/segment-analytics';

import WorkflowCard from '../workflow-card/workflow-card';

export interface PayeesType {
    payeeFilingStatus: FilingStatus;
    payeeFullName: string;
    payeePartyId: string;
    payeeTaxJurisdiction: string;
}

export type PayeesStepSetState = Dispatch<SetStateAction<PayeesType>>;

interface PayeesStepProps extends TransactionClickProps {
    parentPage: ParentPage;
    policy: Policy;
    setState: PayeesStepSetState;
    state: PayeesType;
}

const PayeesStep = ({ parentPage, policy, setState, state, trackEventProps }: PayeesStepProps) => {
    const { t } = useTranslation();
    const { goToNext } = useWorkflow();

    const [formError, setFormError] = useState(false);

    const { parties, partyRoles, policyNumber } = policy;
    const { payeePartyId: currentPayeePartyId } = state;

    const eligiblePayees = useMemo(() => {
        const ownerPayeeRoles = partyRoles?.filter(role => role.partyRole === PartyRole.OWNER || role.partyRole === PartyRole.PAYEE);
        const eligibleRoles = ownerPayeeRoles?.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.partyId === value.partyId
            ))
        );
        return eligibleRoles?.map(eligibleRole => {
            const party = parties?.find(party => eligibleRole.partyId === party.partyId);

            if (!party) return;

            const roles = partyRoles?.filter(role => role.partyId === party.partyId);
            const tags = roles?.map(role => {
                return { text: convertToChipText(role.partyRole, t) };
            });

            return { ...party, tags };
        });
    }, [parties, partyRoles, t]);

    useEffect(() => {
        if (!eligiblePayees?.length) {
            return;
        }

        const selectedPayee = eligiblePayees?.find(payee => payee?.partyId === currentPayeePartyId) || eligiblePayees?.[0];

        setState(prevState => ({
            ...prevState,
            payeeFullName: buildFullNameFromParty(selectedPayee),
            payeePartyId: selectedPayee?.partyId ?? '',
            payeeFilingStatus: selectedPayee?.taxWithholdings?.[0]?.filingStatus || FilingStatus.DEFAULT,
            payeeTaxJurisdiction: selectedPayee?.taxWithholdings?.[0]?.taxJurisdiction || '',
        }));
    }, [currentPayeePartyId, eligiblePayees, setState]);

    const handleContinue = () => {
        if (isNullEmptyOrUndefined(currentPayeePartyId)) {
            setFormError(true);
        } else goToNext();
    };

    const handleSelection = ({ payeePartyId, payeeFullName, payeeFilingStatus, payeeTaxJurisdiction }: PayeesType) => {
        if (payeePartyId === currentPayeePartyId) {
            setState(prevState => ({
                ...prevState,
                payeeFullName: '',
                payeePartyId: '',
                payeeFilingStatus: FilingStatus.DEFAULT,
                payeeTaxJurisdiction: '',
            }));
        } else {
            setState(prevState => ({
                ...prevState,
                payeeFullName,
                payeePartyId,
                payeeFilingStatus,
                payeeTaxJurisdiction,
            }));
            setFormError(false);
        }
    };

    return (
        <WorkflowCard
            title={t('workflows.payeesStep.title')}
            footerContent={
                <TransactionNavigationButtons
                    handleContinue={handleContinue}
                    parentPage={parentPage}
                    planCode={policy.product?.planCode}
                    policyNumber={policyNumber}
                    trackEventProps={trackEventProps}
                />
            }
        >
            <div className="flex flex-col">
                <Typography className="mb-4" variant={TypographyVariant.LabelLg}>
                    {t('workflows.payeesStep.subTitle')}
                </Typography>
                <Typography variant={TypographyVariant.Label}>{t('workflows.payeesStep.fieldLabel')}</Typography>
                <div className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-3">
                    {eligiblePayees?.map(eligiblePayee => {
                        const payeeFullName = buildFullNameFromParty(eligiblePayee);
                        const selected = eligiblePayee?.partyId === currentPayeePartyId;
                        return (
                            <Tooltip
                                body={t('workflows.payeesStep.popover')}
                                key={eligiblePayee?.partyId}
                                placement={PopoverPlacement.TopRight}
                            >
                                <CardPeople
                                    accessibilityClickText={payeeFullName}
                                    accessibilityText={payeeFullName}
                                    index={Number(eligiblePayee?.partyId)}
                                    isSelected={selected}
                                    name={payeeFullName}
                                    onClick={() => {
                                        handleSelection({
                                            payeePartyId: eligiblePayee?.partyId ?? '',
                                            payeeFullName,
                                            payeeFilingStatus: eligiblePayee?.taxWithholdings?.[0]?.filingStatus || FilingStatus.DEFAULT,
                                            payeeTaxJurisdiction: eligiblePayee?.taxWithholdings?.[0]?.taxJurisdiction || '',
                                        });
                                    }}
                                    tags={eligiblePayee?.tags}
                                />
                            </Tooltip>
                        );
                    })}

                    <div className="flex cursor-not-allowed flex-col items-center justify-center gap-4 rounded border-2 border-gray-200 bg-gray-100 px-4 py-8">
                        <div className="flex items-center gap-1 text-gray-300">
                            <AddIcon height={24} width={24} />
                            <p className="font-primary text-base font-semibold">{t('workflows.payeesStep.add')}</p>
                        </div>
                    </div>
                </div>
                {formError && (
                    <AssistiveText className="mt-2" text={t('workflows.payeesStep.error')} variant={AssistiveTextVariant.Error} />
                )}
            </div>
        </WorkflowCard>
    );
};

export default PayeesStep;
