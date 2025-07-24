import { PartyRole, Policy } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import InputCheckBox from '@deps/components/checkbox-v2/input-checkbox';
import Content, { ContentVariant } from '@deps/components/content/content';
import IconButton from '@deps/components/icon-button/icon-button';
import { TranslationFiles } from '@deps/config/translations';
import { useBeneChange } from '@deps/containers/bene-change/bene-change-provider';
import { getName } from '@deps/helpers/party-info-helpers';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';

import BeneficiaryDetails from '../beneficiary-details';
import { getInitialBene } from '../beneficiary-details.helpers';

export interface BeneficiaryListingItemProps {
    partyRole: PartyRole;
    selectedParty: any;
    carrierId: string;
    index: string;
    setBeneData: Dispatch<SetStateAction<any>>;
    policy: Policy;
    isBeneInfoOnFile?: boolean;
    partyRoleId: any;
    partyId?: string;
}

export default function BeneficiaryListingItem({
    policy,
    index,
    partyRole,
    selectedParty,
    carrierId,
    setBeneData,
    isBeneInfoOnFile,
    partyRoleId,
    partyId,
}: BeneficiaryListingItemProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.beneficiaryListing',
    });
    const [showBeneficiary, setShowBeneficiary] = useState(false);
    const { deletedBene, setDeletedBene, beneData } = useBeneChange();

    const relationshipToParty =
        partyId &&
        policy?.partyRoles?.find((role) => role?.partyId === partyId)
            ?.relationshipToParty;
    const currentBene = useMemo(() => {
        const pos = beneData.map((e: any) => e.index).indexOf(index);
        return pos > -1
            ? beneData[pos]
            : getInitialBene(
                  partyRole,
                  index,
                  selectedParty,
                  relationshipToParty,
                  selectedParty?.partyId,
                  true,
                  'NONE',
                  partyRoleId
              );
    }, [
        beneData,
        index,
        partyRole,
        relationshipToParty,
        selectedParty,
        partyRoleId,
    ]);

    const [isNonEditable, setIsNonEditable] = useState<boolean>(true);

    const isCurrentRemoved = useMemo(() => {
        return deletedBene.includes(index);
    }, [deletedBene, index]);

    useEffect(() => {
        setBeneData((prevState: any) => {
            const position = prevState
                .map((element: any) => element.index)
                .indexOf(index);
            if (position > -1) {
                prevState[position] = currentBene;
                return [...prevState];
            } else {
                return [...prevState, { ...currentBene }];
            }
        });
    }, [currentBene, index, setBeneData]);

    const handleChange = (id: any, isChecked: boolean) => {
        setDeletedBene((prevState: any) =>
            prevState.includes(id)
                ? prevState.filter((value: any) => value !== id)
                : [...prevState, id]
        );
        setBeneData((prevState: any[]) => {
            return prevState.map((bene) => {
                if (bene.index === id) {
                    return {
                        ...bene,
                        action: isChecked ? 'DELETE' : 'NONE',
                    };
                }
                return bene;
            });
        });
    };

    const labelClasses = clsx('flex items-center space-x-2', {
        'cursor-not-allowed text-gray-900': isBeneInfoOnFile,
        'cursor-pointer': !isBeneInfoOnFile,
    });

    return (
        <div
            className={
                !isCurrentRemoved
                    ? 'my-4 w-full rounded-sm border-2 p-8'
                    : 'my-4 w-full rounded-sm border-2 bg-gray-50 p-8'
            }
        >
            <div className="flex justify-between">
                <div className="flex items-center gap-2">
                    <div className="font-primary text-xl">
                        <span
                            className={isCurrentRemoved ? 'text-gray-200' : ''}
                        >
                            {getName(currentBene?.party?.info)}{' '}
                            {!isCurrentRemoved
                                ? ` (${
                                      currentBene?.party?.allocation
                                          ?.beneficiaryPercentage ?? '--'
                                  }) %`
                                : '(--)%'}
                        </span>
                    </div>
                    {isNonEditable && (
                        <IconButton
                            aria-describedby={`bene-listing-item-edit-${index}`}
                            onClick={() => {
                                setIsNonEditable(!isNonEditable);
                                setShowBeneficiary(true);
                            }}
                            disabled={isCurrentRemoved}
                        >
                            <EditIcon height={16} width={16} />
                            <span className="sr-only">{t('edit')}</span>
                        </IconButton>
                    )}
                </div>
                <div className="flex">
                    <div className="flex flex-col gap-6">
                        <label className={labelClasses}>
                            <InputCheckBox
                                isDisabled={isBeneInfoOnFile}
                                checked={isCurrentRemoved}
                                onChange={() => {
                                    handleChange(
                                        index,
                                        isCurrentRemoved ? false : true
                                    );
                                }}
                            />
                            <Content
                                details={t('remove') as string}
                                variant={ContentVariant.BodySm}
                                contentClassName="items-center flex"
                            />
                        </label>
                    </div>
                    <div className={isCurrentRemoved ? 'invisible' : ''}>
                        <div
                            onClick={() => setShowBeneficiary(!showBeneficiary)}
                            className="ml-6"
                        >
                            <ChevronDown
                                height={24}
                                width={24}
                                className={
                                    'simple-transition  self-center text-secondary ' +
                                    (showBeneficiary ? 'flip180' : '')
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {showBeneficiary && !isCurrentRemoved && (
                    <BeneficiaryDetails
                        partyRole={partyRole}
                        partyId={selectedParty?.partyId}
                        selectedParty={selectedParty}
                        carrierId={carrierId}
                        setBeneData={setBeneData}
                        index={index}
                        policy={policy}
                        setShowBeneficiary={setShowBeneficiary}
                        isNonEditable={isNonEditable}
                    />
                )}
            </div>
        </div>
    );
}
