import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import CardPeople from '@deps/components/card/card-people/card-people';
import Label, { LabelVariant } from '@deps/components/label/label';
import { PopoverPlacement } from '@deps/components/popover/popover';
import Tooltip from '@deps/components/tooltip/tooltip';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import { convertToChipText } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { buildFullNameFromParty, isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { Address, PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-medium.svg';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import { TransactionClickProps } from '@deps/types/segment-analytics';

import WorkflowCard from '../workflow-card/workflow-card';

export interface PayorType {
    payorAddress?: Address;
    payorFullName: string;
    payorPartyId: string;
}

export type PayorStepSetState = Dispatch<SetStateAction<PayorType>>;

interface PayorStepProps extends TransactionClickProps {
    parentPage: ParentPage;
    policy: Policy;
    setState: PayorStepSetState;
    state: PayorType;
}

const PayorStep = ({ parentPage, policy, setState, state, trackEventProps }: PayorStepProps) => {
    const { t } = useTranslation();
    const { goToNext } = useWorkflow();

    const [formError, setFormError] = useState(false);

    const { parties, partyRoles, policyNumber } = policy;
    const { payorPartyId: currentPayorPartyId } = state;

    const eligiblePayors = useMemo(() => {
        const ownerPayorRoles = partyRoles?.filter(role => role.partyRole === PartyRole.OWNER || role.partyRole === PartyRole.PAYOR);

        const eligibleRoles = ownerPayorRoles?.filter((value, index, self) => index === self.findIndex(t => t.partyId === value.partyId));
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
        setState(prevState => ({
            ...prevState,
            payorAddress: eligiblePayors?.[0]?.addresses?.filter(address => !isEndDated(address.endDate))[0],
            payorFullName: buildFullNameFromParty(eligiblePayors?.[0]),
            payorPartyId: eligiblePayors?.[0]?.partyId ?? '',
        }));
    }, [eligiblePayors, setState]);

    const handleContinue = () => {
        if (isNullEmptyOrUndefined(currentPayorPartyId)) {
            setFormError(true);
        } else goToNext();
    };

    const handleSelection = ({ payorAddress, payorPartyId, payorFullName }: PayorType) => {
        if (payorPartyId === currentPayorPartyId) {
            setState(prevState => ({
                ...prevState,
                payorAddress: undefined,
                payorFullName: '',
                payorPartyId: '',
            }));
        } else {
            setState(prevState => ({
                ...prevState,
                payorAddress,
                payorFullName,
                payorPartyId,
            }));
            setFormError(false);
        }
    };

    return (
        <WorkflowCard
            title={t('workflows.payorStep.title')}
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
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-4">
                    <Label label={t('workflows.payorStep.subLabel')} sentenceCase={false} variant={LabelVariant.LabelLg} />
                    <div className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-3">
                        {eligiblePayors?.map(eligiblePayor => {
                            const payorFullName = buildFullNameFromParty(eligiblePayor);
                            const selected = eligiblePayor?.partyId === currentPayorPartyId;

                            return (
                                <Tooltip
                                    body={t('workflows.payorStep.popover')}
                                    key={eligiblePayor?.partyId}
                                    placement={PopoverPlacement.TopRight}
                                >
                                    <CardPeople
                                        accessibilityClickText={payorFullName}
                                        accessibilityText={payorFullName}
                                        index={Number(eligiblePayor?.partyId)}
                                        isSelected={selected}
                                        name={payorFullName}
                                        onClick={() => {
                                            handleSelection({
                                                payorAddress: eligiblePayor?.addresses?.filter(address => !isEndDated(address.endDate))[0],
                                                payorPartyId: eligiblePayor?.partyId ?? '',
                                                payorFullName,
                                            });
                                        }}
                                        tags={eligiblePayor?.tags}
                                        testId={`payor-card-${payorFullName.replace(/\s/g, '').toLowerCase()}`}
                                    />
                                </Tooltip>
                            );
                        })}

                        <div className="flex cursor-not-allowed flex-col items-center justify-center gap-4 rounded border-2 border-gray-200 bg-gray-100 px-4 py-8">
                            <div className="flex items-center gap-1 text-gray-300">
                                <AddIcon height={24} width={24} />
                                <p className="font-primary text-base font-semibold">{t('workflows.payorStep.add')}</p>
                            </div>
                        </div>
                    </div>
                    {formError && (
                        <AssistiveText
                            className="col-span-full"
                            iconOverride={<ErrorIcon height={16} width={16} />}
                            text={t('workflows.payorStep.error')}
                            variant={AssistiveTextVariant.Error}
                        />
                    )}
                </div>
            </div>
        </WorkflowCard>
    );
};

export default PayorStep;
