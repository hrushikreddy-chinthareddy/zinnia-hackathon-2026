import { Transition } from '@headlessui/react';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import Radio, { RadioVariant } from '@deps/components/radio/radio';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useBeneChange } from '@deps/containers/bene-change/bene-change-provider';
import { SorSystem } from '@deps/models/policy/enums';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-medium.svg';
import { PartyRole, Policy } from '@zinnia/api-types/types/sor';

import BeneficiaryDetails from '../beneficiary-details';
import BeneficiaryListingItem from '../beneficiary-listing-item/beneficiary-listing-item';

interface BeneficiaryListingProps {
    parties: any[];
    carrierId: string;
    policy: Policy;
}

export default function BeneficiaryListing({
    policy,
    parties,
    carrierId,
}: BeneficiaryListingProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.beneficiaryListing',
    });
    const {
        formData,
        setFormData,
        setBeneData,
        beneData,
        setDeletedBene,
        SOR,
    } = useBeneChange();

    const primary: string[] = useMemo(() => {
        const primaryArr: string[] = [];
        beneData?.map((item: any) => {
            if (item.action === 'ADD') {
                if (item.partyRole.partyRole === PartyRole.PRIMARYBENEFICIARY) {
                    primaryArr.push(item.index);
                }
            }
        });
        return primaryArr;
    }, [beneData]);

    const contingent: string[] = useMemo(() => {
        const contingentArr: string[] = [];
        beneData?.map((item: any) => {
            if (item.action === 'ADD') {
                if (
                    item.partyRole.partyRole === PartyRole.CONTINGENTBENEFICIARY
                ) {
                    contingentArr.push(item.index);
                }
            }
        });
        return contingentArr;
    }, [beneData]);

    const [primaryCount, setPrimaryCount] = useState<string[]>(
        primary.length > 0 ? primary : []
    );
    const [contingentCount, setContingentCount] = useState<string[]>(
        contingent.length > 0 ? contingent : []
    );

    const handlePrimaryBeneInfoOnFile = (value: boolean) => {
        if (value) {
            const deletedBenes: any = [];
            setBeneData((prevState: any) => {
                const contingentBeneItems = prevState.filter(
                    (element: any) =>
                        element.partyRole.partyRole ===
                        PartyRole.CONTINGENTBENEFICIARY
                );
                const primaryBeneItems = prevState.filter(
                    (element: any) =>
                        element.partyRole.partyRole ===
                        PartyRole.PRIMARYBENEFICIARY
                );

                const formattedPrimaryBeneItems = primaryBeneItems
                    .map((item: any) => {
                        if (item.action === 'EDIT' || item.action === 'NONE') {
                            deletedBenes.push(item.index);
                            return { ...item, action: 'DELETE' };
                        }
                        if (item.action === 'DELETE') {
                            return item;
                        }
                        if (item.action === 'ADD') {
                            return undefined;
                        }
                    })
                    .filter((item: any) => item !== undefined);
                return [...formattedPrimaryBeneItems, ...contingentBeneItems];
            });
            setDeletedBene((prevState: any) => {
                const newState = new Set([...prevState, ...deletedBenes]);
                return Array.from(newState);
            });
            setPrimaryCount([]);
        } else {
            const undoDeletedBenes: any = [];
            setBeneData((prevState: any) => {
                const contingentBeneItems = prevState.filter(
                    (element: any) =>
                        element.partyRole.partyRole ===
                        PartyRole.CONTINGENTBENEFICIARY
                );
                const primaryBeneItems = prevState.filter(
                    (element: any) =>
                        element.partyRole.partyRole ===
                        PartyRole.PRIMARYBENEFICIARY
                );

                const formattedPrimaryBeneItems = primaryBeneItems
                    .map((item: any) => {
                        if (item.action === 'DELETE') {
                            undoDeletedBenes.push(item.index);
                            return { ...item, action: 'NONE' };
                        }
                    })
                    .filter((item: any) => item !== undefined);
                return [...formattedPrimaryBeneItems, ...contingentBeneItems];
            });
            setDeletedBene((prevState: any) => {
                const newState = prevState.filter(
                    (item: any) => !undoDeletedBenes.includes(item)
                );
                return newState;
            });
        }
    };

    const handleContingentBeneInfoOnFile = (value: boolean) => {
        if (value) {
            const deletedBenes: any = [];
            setBeneData((prevState: any) => {
                const contingentBeneItems = prevState.filter(
                    (element: any) =>
                        element.partyRole.partyRole ===
                        PartyRole.CONTINGENTBENEFICIARY
                );
                const primaryBeneItems = prevState.filter(
                    (element: any) =>
                        element.partyRole.partyRole ===
                        PartyRole.PRIMARYBENEFICIARY
                );

                const formattedContingentBeneItems = contingentBeneItems
                    .map((item: any) => {
                        if (item.action === 'EDIT' || item.action === 'NONE') {
                            deletedBenes.push(item.index);
                            return { ...item, action: 'DELETE' };
                        }
                        if (item.action === 'DELETE') {
                            return item;
                        }
                        if (item.action === 'ADD') {
                            return undefined;
                        }
                    })
                    .filter((item: any) => item !== undefined);
                return [...primaryBeneItems, ...formattedContingentBeneItems];
            });
            setDeletedBene((prevState: any) => {
                const newState = new Set([...prevState, ...deletedBenes]);
                return Array.from(newState);
            });
            setContingentCount([]);
        } else {
            const undoDeletedBenes: any = [];
            setBeneData((prevState: any) => {
                const primaryBeneItems = prevState.filter(
                    (element: any) =>
                        element.partyRole.partyRole ===
                        PartyRole.PRIMARYBENEFICIARY
                );
                const contingentBeneItems = prevState.filter(
                    (element: any) =>
                        element.partyRole.partyRole ===
                        PartyRole.CONTINGENTBENEFICIARY
                );

                const formattedContingentBeneItems = contingentBeneItems
                    .map((item: any) => {
                        if (item.action === 'DELETE') {
                            undoDeletedBenes.push(item.index);
                            return { ...item, action: 'NONE' };
                        }
                    })
                    .filter((item: any) => item !== undefined);
                return [...formattedContingentBeneItems, ...primaryBeneItems];
            });
            setDeletedBene((prevState: any) => {
                const newState = prevState.filter(
                    (item: any) => !undoDeletedBenes.includes(item)
                );
                return newState;
            });
        }
    };

    const handlePrimaryBeneficiaryClick = (id: string) => {
        setPrimaryCount((prevState) => [...prevState, id]);
    };

    const handleContingentBeneficiaryClick = (id: string) => {
        setContingentCount((prevState) => [...prevState, id]);
    };

    const handlePrimaryBeneficiaryCancelClick = (id: string) => {
        setPrimaryCount((prevState) =>
            prevState?.filter((state) => state !== id)
        );

        setBeneData((prevState: any) => {
            const position = prevState
                .map((element: any) => element.index)
                .indexOf(id);
            if (position > -1) {
                prevState.splice(position, 1);
                const newState = prevState.filter(
                    (element: any) => element !== undefined
                );
                return [...newState];
            } else {
                return [...prevState];
            }
        });
    };

    const handleContingentBeneficiaryCancelClick = (id: string) => {
        setContingentCount((prevState) =>
            prevState?.filter((state) => state !== id)
        );
        setBeneData((prevState: any) => {
            const position = prevState
                .map((element: any) => element.index)
                .indexOf(id);
            if (position > -1) {
                prevState.splice(position, 1);
                const newState = prevState.filter(
                    (element: any) => element !== undefined
                );
                return [...newState];
            } else {
                return [...prevState];
            }
        });
    };

    const options = {
        isRequired: false,
        selectOptions: [
            { label: t('yes'), value: 'true' },
            { label: t('no'), value: 'false' },
        ],
    };

    const toggleSelection = (role: PartyRole, value: string) => {
        if (role === PartyRole.PRIMARYBENEFICIARY) {
            setFormData((prevState: any) => ({
                ...prevState,
                isPrimaryBeneInfoOnFile: value === 'true',
            }));
            handlePrimaryBeneInfoOnFile(value === 'true');
        }
        if (role === PartyRole.CONTINGENTBENEFICIARY) {
            setFormData((prevState: any) => ({
                ...prevState,
                isContingentBeneInfoOnFile: value === 'true',
            }));
            handleContingentBeneInfoOnFile(value === 'true');
        }
    };

    return (
        <>
            <div>
                <div className="mb-3 flex">
                    <Typography variant={TypographyVariant.H3}>
                        {t('primaryBeneficiaries')}
                    </Typography>
                </div>
                {SOR != SorSystem.Zahara && (
                    <div className="border-2 border-gray-100 p-4 font-primary">
                        <p className="mb-2 text-base">
                            {t('requestAddPrimaryBeneficiaryLabel') as string}
                        </p>
                        <Radio
                            items={options.selectOptions}
                            onChange={(event) =>
                                toggleSelection(
                                    PartyRole.PRIMARYBENEFICIARY,
                                    event.target.value
                                )
                            }
                            value={
                                formData.isPrimaryBeneInfoOnFile
                                    ? 'true'
                                    : 'false'
                            }
                            variant={RadioVariant.Default}
                        />
                    </div>
                )}
                {parties?.map((item, index) => {
                    if (
                        item?.partyRoles?.includes(PartyRole.PRIMARYBENEFICIARY)
                    ) {
                        const beneIndex = item?.partyRoles?.indexOf(
                            PartyRole.PRIMARYBENEFICIARY
                        );
                        return (
                            <BeneficiaryListingItem
                                selectedParty={item}
                                index={`${item.partyId}-${index}`}
                                partyRole={PartyRole.PRIMARYBENEFICIARY}
                                partyRoleId={item?.partyRoleIds?.[beneIndex]}
                                carrierId={carrierId}
                                key={`listing-item-${index}`}
                                setBeneData={setBeneData}
                                policy={policy}
                                isBeneInfoOnFile={
                                    formData.isPrimaryBeneInfoOnFile
                                }
                                partyId={item.partyId}
                            />
                        );
                    }
                })}

                {primaryCount.map((item) => {
                    return (
                        <div
                            key={item}
                            className="my-4 flex min-h-[100px] w-full items-center justify-between gap-4 rounded-sm border-2 p-8"
                        >
                            <div className="flex justify-start">
                                <BeneficiaryDetails
                                    partyRole={PartyRole.PRIMARYBENEFICIARY}
                                    carrierId={carrierId}
                                    setBeneData={setBeneData}
                                    index={item}
                                    policy={policy}
                                    action={'ADD'}
                                    isNonEditable={false}
                                />
                                <button
                                    aria-label={
                                        t('beneficiaryListing.cancel') as string
                                    }
                                    className="default-focus-icons flex justify-start rounded-xl"
                                    onClick={() =>
                                        handlePrimaryBeneficiaryCancelClick(
                                            item
                                        )
                                    }
                                >
                                    <CancelIcon height={24} width={24} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                <div className="my-3 flex w-full justify-center gap-4 border-2 p-8 align-middle">
                    <Transition
                        as="div"
                        show={true}
                        className="mt-2"
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <NavElement
                            onClick={() =>
                                handlePrimaryBeneficiaryClick(uuidV4())
                            }
                            size={NavElementSize.Small}
                            startIcon={<AddIcon height={20} width={20} />}
                            type={NavElementType.Button}
                            disabled={formData.isPrimaryBeneInfoOnFile}
                        >
                            {t('addPrimaryBeneficiary')}
                        </NavElement>
                    </Transition>
                </div>
            </div>

            <div className="my-6">
                {SOR != SorSystem.Zahara && (
                    <div className="my-3 border-2 border-gray-100 p-4 font-primary">
                        <p className="mb-2 text-base">
                            {t('requestAddContingentBeneficiaryLabel')}
                        </p>
                        <Radio
                            items={options.selectOptions}
                            onChange={(event) =>
                                toggleSelection(
                                    PartyRole.CONTINGENTBENEFICIARY,
                                    event.target.value
                                )
                            }
                            value={
                                formData.isContingentBeneInfoOnFile
                                    ? 'true'
                                    : 'false'
                            }
                            variant={RadioVariant.Default}
                        />
                    </div>
                )}

                <div>
                    <Typography variant={TypographyVariant.H2}>
                        {t('contingentBeneficiaries')}
                    </Typography>
                </div>

                {parties?.map((item, index) => {
                    if (
                        item?.partyRoles?.includes(
                            PartyRole.CONTINGENTBENEFICIARY
                        )
                    ) {
                        const beneIndex = item?.partyRoles?.indexOf(
                            PartyRole.CONTINGENTBENEFICIARY
                        );
                        return (
                            <BeneficiaryListingItem
                                selectedParty={item}
                                index={`${item.partyId}-${index}`}
                                partyRole={PartyRole.CONTINGENTBENEFICIARY}
                                partyRoleId={item?.partyRoleIds?.[beneIndex]}
                                carrierId={carrierId}
                                key={`listing-item-${index}`}
                                setBeneData={setBeneData}
                                policy={policy}
                                isBeneInfoOnFile={
                                    formData.isContingentBeneInfoOnFile
                                }
                                partyId={item.partyId}
                            />
                        );
                    }
                })}

                {contingentCount.map((item) => {
                    return (
                        <div
                            key={item}
                            className="my-4 flex w-full  rounded-sm border-2 p-8 "
                        >
                            <div className="flex justify-start">
                                <BeneficiaryDetails
                                    partyRole={PartyRole.CONTINGENTBENEFICIARY}
                                    carrierId={carrierId}
                                    setBeneData={setBeneData}
                                    index={item}
                                    policy={policy}
                                    action={'ADD'}
                                    isNonEditable={false}
                                />
                            </div>
                            <button
                                aria-label={
                                    t('beneficiaryListing.cancel') as string
                                }
                                className="default-focus-icons flex justify-start rounded-xl"
                                onClick={() =>
                                    handleContingentBeneficiaryCancelClick(item)
                                }
                            >
                                <CancelIcon height={24} width={24} />
                            </button>
                        </div>
                    );
                })}

                <div className="my-3 flex w-full justify-center gap-4 border-2 p-8 align-middle">
                    <Transition
                        as="div"
                        show={true}
                        className="mt-2"
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <NavElement
                            onClick={() =>
                                handleContingentBeneficiaryClick(uuidV4())
                            }
                            size={NavElementSize.Small}
                            startIcon={<AddIcon height={20} width={20} />}
                            type={NavElementType.Button}
                            disabled={formData.isContingentBeneInfoOnFile}
                        >
                            {t('addContingentBeneficiary')}
                        </NavElement>
                    </Transition>
                </div>
            </div>
        </>
    );
}
